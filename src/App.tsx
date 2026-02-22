import { useState, useRef, useEffect } from 'react';
import type { SearchParams, ScoredFlight, Preferences, SortField } from './types';
import { usePreferences } from './hooks/usePreferences';
import { generateMockFlights } from './data/mockFlights';
import { scoreFlights } from './engine/scorer';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import SortBar from './components/SortBar';
import PreferencesEditor from './components/PreferencesEditor';
import FilterPanel from './components/FilterPanel';

export type FilterState = {
  nonstopOnly: boolean;
  maxPrice: number | null;
  airlines: string[];
};

type FeedbackItem = {
  id: string;
  text: string;
  timestamp: string;
  images?: string[]; // base64 data URLs
};

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function loadFeedback(): FeedbackItem[] {
  try {
    return JSON.parse(localStorage.getItem('travel-optimizer-feedback') || '[]');
  } catch { return []; }
}

function saveFeedback(items: FeedbackItem[]) {
  localStorage.setItem('travel-optimizer-feedback', JSON.stringify(items));
}

function App() {
  const { preferences, updatePreferences, loadDefaults } = usePreferences();
  const [results, setResults] = useState<ScoredFlight[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [sortField, setSortField] = useState<SortField>('effective_cost');
  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    nonstopOnly: false,
    maxPrice: null,
    airlines: [],
  });
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackList, setShowFeedbackList] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackImages, setFeedbackImages] = useState<string[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(loadFeedback);
  const feedbackFileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    const flights = generateMockFlights(params);
    const scored = scoreFlights(flights, preferences);
    setResults(scored);
  };

  const handlePreferencesChange = (updated: Preferences) => {
    updatePreferences(updated);
    if (searchParams) {
      const flights = generateMockFlights(searchParams);
      const scored = scoreFlights(flights, updated);
      setResults(scored);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortField) {
      case 'effective_cost': return a.effectiveCost - b.effectiveCost;
      case 'price': return a.flight.price - b.flight.price;
      case 'duration': return a.flight.totalDurationMinutes - b.flight.totalDurationMinutes;
      case 'departure': return new Date(a.flight.departureTime).getTime() - new Date(b.flight.departureTime).getTime();
      default: return 0;
    }
  });

  const filteredResults = sortedResults.filter(r => {
    if (filters.nonstopOnly && r.flight.stops > 0) return false;
    if (filters.maxPrice && r.flight.price > filters.maxPrice) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(r.flight.segments[0].airlineCode)) return false;
    return true;
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen sky-background flex flex-col">
      <header className="px-6 pt-4 pb-0 relative z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Travel Optimizer</h1>
            <p className="text-base text-gray-600" style={{paddingLeft:2}}>The Best Flight For <span className="font-bold text-black">You</span></p>
          </div>
          <div ref={menuRef} className="relative z-30">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-white/30 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => { setShowAbout(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  About
                </button>
                <button
                  onClick={() => { setShowFeedback(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Feedback
                </button>
                <button
                  disabled
                  className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 w-full flex-1">
        {/* Collapsible Preferences Panel */}
        <div className="frost-panel rounded-xl shadow-sm mb-6">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-xl"
          >
            <span className="text-sm font-semibold text-gray-700">Preferences</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPreferences && (
            <div className="border-t border-gray-200">
              <PreferencesEditor
                preferences={preferences}
                onChange={handlePreferencesChange}
                onLoadDefaults={loadDefaults}
              />
            </div>
          )}
        </div>

        <SearchForm onSearch={handleSearch} />

        {results.length > 0 && (
          <>
            <div className="mt-6 flex gap-4 items-start">
              <div className="flex-1">
                <SortBar
                  sortField={sortField}
                  onSortChange={setSortField}
                  resultCount={filteredResults.length}
                  totalCount={results.length}
                />
                <ResultsList results={filteredResults} preferences={preferences} />
              </div>
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                results={results}
              />
            </div>
          </>
        )}

        {searchParams && results.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            No flights found for this route.
          </div>
        )}
      </main>

      {/* About Dialog */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Travel Optimizer</h2>
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Travel Optimizer ranks flights by <strong>effective cost</strong> &mdash; the ticket price plus dollar-equivalent penalties for everything you care about.
              </p>
              <p>
                Set your preferences (airport, airline, cabin class, aircraft type, departure time, layover tolerance) and assign dollar penalties to each. The scoring engine adds those penalties to the ticket price so you can compare flights on a single, personalized number.
              </p>
              <p>
                For long-haul flights crossing 3+ timezones, jet lag rules kick in: departure and arrival times are evaluated against the destination timezone, premium aircraft get bonuses, and red-eye economy flights get extra penalties.
              </p>
              <p>
                The result: the best flight <em>for you</em> is always at the top.
              </p>
            </div>
            <p className="mt-6 text-xs text-gray-400 text-center">&copy;2026 Debbi Gibbs</p>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowFeedback(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Describe features or bugs in detail here. Claude will fix them!"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />

            {/* Image drop zone / file picker */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={async e => {
                e.preventDefault();
                setDragging(false);
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                const resized = await Promise.all(files.map(f => resizeImage(f, 800)));
                setFeedbackImages(prev => [...prev, ...resized]);
              }}
              onClick={() => feedbackFileRef.current?.click()}
              className={`mt-3 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <p className="text-sm text-gray-500">Drop images here or click to attach</p>
              <input
                ref={feedbackFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async e => {
                  const files = Array.from(e.target.files || []);
                  const resized = await Promise.all(files.map(f => resizeImage(f, 800)));
                  setFeedbackImages(prev => [...prev, ...resized]);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Image previews */}
            {feedbackImages.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {feedbackImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => setFeedbackImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => { setShowFeedback(false); setShowFeedbackList(true); }}
                className="text-xs text-blue-600 hover:underline"
              >
                Show Feedback List
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFeedbackText(''); setFeedbackImages([]); setShowFeedback(false); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (feedbackText.trim() || feedbackImages.length > 0) {
                      const item: FeedbackItem = {
                        id: Date.now().toString(),
                        text: feedbackText.trim(),
                        timestamp: new Date().toISOString(),
                        images: feedbackImages.length > 0 ? feedbackImages : undefined,
                      };
                      const updated = [item, ...feedbackItems];
                      setFeedbackItems(updated);
                      saveFeedback(updated);
                    }
                    setFeedbackText('');
                    setFeedbackImages([]);
                    setShowFeedback(false);
                  }}
                  disabled={!feedbackText.trim() && feedbackImages.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List Dialog */}
      {showFeedbackList && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowFeedbackList(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback List</h2>
            {feedbackItems.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No feedback submitted yet.</p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {feedbackItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.text}</p>
                    {item.images && item.images.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {item.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFeedbackList(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-4 text-center text-sm text-gray-500">
        &copy;2026 Debbi Gibbs
      </footer>
    </div>
  );
}

export default App;
