import type { FlightItinerary, Preferences } from '../../types';

export function airportPenalty(flight: FlightItinerary, prefs: Preferences): number {
  let penalty = 0;

  for (const segment of flight.segments) {
    // Check departure airports
    if (segment.departureAirport !== prefs.homeAirport) {
      const alt = prefs.alternateAirports.find(a => a.code === segment.departureAirport);
      if (alt) {
        penalty += alt.dollarPenalty;
        penalty += (alt.timePenaltyMinutes / 60) * prefs.dollarPerHour;
      }
    }
  }

  return penalty;
}
