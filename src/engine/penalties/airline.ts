import type { FlightItinerary, Preferences } from '../../types';

export function airlinePenalty(flight: FlightItinerary, prefs: Preferences): number {
  let penalty = 0;

  for (const segment of flight.segments) {
    const airlinePref = prefs.airlines.find(a => a.code === segment.airlineCode);
    if (airlinePref) {
      switch (airlinePref.tier) {
        case 'preferred':
          // No penalty
          break;
        case 'acceptable':
          penalty += prefs.acceptableAirlinePenalty;
          break;
        case 'avoid':
          penalty += prefs.avoidAirlinePenalty;
          break;
      }
    } else {
      // Unlisted airline
      penalty += prefs.nonPreferredAirlinePenalty;
    }
  }

  return penalty;
}
