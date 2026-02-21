import type { FlightItinerary, Preferences } from '../../types';

export function aircraftPenalty(flight: FlightItinerary, prefs: Preferences): number {
  let penalty = 0;

  for (const segment of flight.segments) {
    if (prefs.preferredAircraft.includes(segment.aircraftCode)) {
      penalty += prefs.aircraftBonus; // negative = reward
    } else {
      penalty += prefs.nonPreferredAircraftPenalty;
    }
  }

  return penalty;
}
