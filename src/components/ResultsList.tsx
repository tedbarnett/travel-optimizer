import type { ScoredFlight, Preferences } from '../types';
import FlightCard from './FlightCard';

interface Props {
  results: ScoredFlight[];
  preferences: Preferences;
}

export default function ResultsList({ results, preferences }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No flights match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((scored, i) => (
        <FlightCard
          key={scored.flight.id}
          scored={scored}
          preferences={preferences}
          rank={i + 1}
        />
      ))}
    </div>
  );
}
