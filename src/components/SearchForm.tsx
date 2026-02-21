import { useState, useRef, useEffect } from 'react';
import type { SearchParams, TripType } from '../types';
import { searchAirports } from '../data/airports';
import type { Airport } from '../types';

interface Props {
  onSearch: (params: SearchParams) => void;
}

function AirportInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (code: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length >= 1) {
      setSuggestions(searchAirports(val));
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const select = (airport: Airport) => {
    setQuery(airport.code);
    onChange(airport.code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => query.length >= 1 && setSuggestions(searchAirports(query))}
        placeholder="Airport code or city"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map(a => (
            <li
              key={a.code}
              onClick={() => select(a)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
            >
              <span className="font-mono font-bold text-sm">{a.code}</span>
              <span className="text-sm text-gray-600 truncate ml-2">{a.city} — {a.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SearchForm({ onSearch }: Props) {
  const [origin, setOrigin] = useState('EWR');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [travelers, setTravelers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;
    onSearch({
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      travelers,
      tripType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="frost-panel rounded-xl shadow-sm p-6" style={{background:'rgba(230,230,230,0.7)'}}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AirportInput label="From" value={origin} onChange={setOrigin} />
        <AirportInput label="To" value={destination} onChange={setDestination} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
          <input
            type="date"
            value={departureDate}
            onChange={e => setDepartureDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        {tripType === 'round_trip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Trip:</label>
          <select
            value={tripType}
            onChange={e => setTripType(e.target.value as TripType)}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
          >
            <option value="round_trip">Round trip</option>
            <option value="one_way">One way</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Travelers:</label>
          <input
            type="number"
            min={1}
            max={9}
            value={travelers}
            onChange={e => setTravelers(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-md text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!origin || !destination || !departureDate}
          className="ml-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
