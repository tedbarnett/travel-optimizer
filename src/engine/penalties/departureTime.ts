import type { FlightItinerary, Preferences } from '../../types';
import { getTimezoneDelta } from '../timezone';

export function departureTimePenalty(flight: FlightItinerary, prefs: Preferences): number {
  const firstSeg = flight.segments[0];
  const depDate = new Date(firstSeg.departureTime);
  const depHour = depDate.getHours();

  // Check timezone-aware exception:
  // If destination is west (earlier timezone), early departures are acceptable
  // because they arrive at a reasonable destination-local time
  const tzDelta = getTimezoneDelta(
    firstSeg.departureAirport,
    flight.arrivalAirport,
    firstSeg.departureTime
  );

  const isWestbound = tzDelta < -1; // destination timezone is earlier

  if (depHour < prefs.earlyDepartureThreshold) {
    if (isWestbound) {
      // Reduced penalty for westbound early flights
      return prefs.earlyDeparturePenalty * 0.25;
    }
    return prefs.earlyDeparturePenalty;
  }

  if (depHour >= prefs.lateDepartureThreshold) {
    return prefs.lateDeparturePenalty;
  }

  return 0;
}
