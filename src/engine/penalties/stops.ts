import type { FlightItinerary, Preferences } from '../../types';

export function stopsPenalty(flight: FlightItinerary, prefs: Preferences): number {
  let penalty = 0;

  if (flight.stops === 0) {
    penalty += prefs.nonstopBonus; // negative = reward
  } else {
    penalty += flight.stops * prefs.perStopPenalty;

    // Calculate layover time between segments
    for (let i = 0; i < flight.segments.length - 1; i++) {
      const arr = new Date(flight.segments[i].arrivalTime).getTime();
      const dep = new Date(flight.segments[i + 1].departureTime).getTime();
      const layoverMin = (dep - arr) / (1000 * 60);
      const excessMin = Math.max(0, layoverMin - prefs.layoverThresholdMinutes);
      penalty += (excessMin / 60) * prefs.perLayoverHourPenalty;
    }
  }

  return penalty;
}
