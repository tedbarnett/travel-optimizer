import type { FlightItinerary, Preferences } from '../../types';

// The shortest possible duration is passed in from the orchestrator
export function travelTimePenalty(
  flight: FlightItinerary,
  prefs: Preferences,
  shortestDurationMinutes: number
): number {
  const excessMinutes = flight.totalDurationMinutes - shortestDurationMinutes;
  if (excessMinutes <= 0) return 0;
  return (excessMinutes / 60) * prefs.dollarPerHour;
}
