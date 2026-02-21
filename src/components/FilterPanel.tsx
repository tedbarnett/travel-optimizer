import type { ScoredFlight } from '../types';
import type { FilterState } from '../App';
import { getAirline } from '../data/airlines';

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  results: ScoredFlight[];
}

export default function FilterPanel({ filters, onFiltersChange, results }: Props) {
  // Get unique airlines from results
  const airlineCodes = [...new Set(results.map(r => r.flight.segments[0].airlineCode))].sort();

  return (
    <div className="w-56 flex-shrink-0 bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>

      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.nonstopOnly}
          onChange={e => onFiltersChange({ ...filters, nonstopOnly: e.target.checked })}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Nonstop only</span>
      </label>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Max price</label>
        <input
          type="number"
          placeholder="No limit"
          value={filters.maxPrice ?? ''}
          onChange={e => onFiltersChange({
            ...filters,
            maxPrice: e.target.value ? parseInt(e.target.value) : null,
          })}
          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Airlines</label>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {airlineCodes.map(code => {
            const airline = getAirline(code);
            return (
              <label key={code} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.airlines.length === 0 || filters.airlines.includes(code)}
                  onChange={e => {
                    let next: string[];
                    if (e.target.checked) {
                      if (filters.airlines.length === 0) {
                        // First check: select only this one
                        next = [code];
                      } else {
                        next = [...filters.airlines, code];
                        // If all are selected, clear filter
                        if (next.length === airlineCodes.length) next = [];
                      }
                    } else {
                      if (filters.airlines.length === 0) {
                        // Unchecking from "all": select all except this one
                        next = airlineCodes.filter(c => c !== code);
                      } else {
                        next = filters.airlines.filter(c => c !== code);
                      }
                    }
                    onFiltersChange({ ...filters, airlines: next });
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{airline?.name || code}</span>
              </label>
            );
          })}
        </div>
      </div>

      {(filters.nonstopOnly || filters.maxPrice || filters.airlines.length > 0) && (
        <button
          onClick={() => onFiltersChange({ nonstopOnly: false, maxPrice: null, airlines: [] })}
          className="mt-3 text-xs text-blue-600 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
