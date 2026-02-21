import type { FlightItinerary, Preferences } from '../../types';

function isOvernightFlight(departureTime: string): boolean {
  // Parse hour directly from ISO string to avoid timezone issues
  const hourStr = departureTime.split('T')[1]?.substring(0, 2);
  const depHour = parseInt(hourStr, 10);
  return depHour >= 20 || depHour < 4;
}

export function cabinClassPenalty(flight: FlightItinerary, prefs: Preferences): number {
  let penalty = 0;

  if (prefs.businessIfOvernight) {
    const overnight = flight.segments.some(
      seg => isOvernightFlight(seg.departureTime)
    );
    if (overnight) {
      const hasEconomy = flight.segments.some(
        seg => seg.cabinClass === 'economy'
      );
      if (hasEconomy) {
        penalty += prefs.overnightEconomyPenalty;
      }
    }
  }

  return penalty;
}
