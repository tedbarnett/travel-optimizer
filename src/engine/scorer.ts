import type { FlightItinerary, Preferences, ScoredFlight, PenaltyBreakdown } from '../types';
import { airportPenalty } from './penalties/airport';
import { airlinePenalty } from './penalties/airline';
import { cabinClassPenalty } from './penalties/cabinClass';
import { stopsPenalty } from './penalties/stops';
import { aircraftPenalty } from './penalties/aircraft';
import { departureTimePenalty } from './penalties/departureTime';
import { travelTimePenalty } from './penalties/travelTime';
import { scoreJetLag } from './jetlag';

export function scoreFlight(
  flight: FlightItinerary,
  prefs: Preferences,
  shortestDuration: number
): ScoredFlight {
  const penalties: PenaltyBreakdown = {
    airport: airportPenalty(flight, prefs),
    airline: airlinePenalty(flight, prefs),
    cabinClass: cabinClassPenalty(flight, prefs),
    stops: stopsPenalty(flight, prefs),
    aircraft: aircraftPenalty(flight, prefs),
    departureTime: departureTimePenalty(flight, prefs),
    travelTime: travelTimePenalty(flight, prefs, shortestDuration),
    jetLag: 0,
  };

  const jetLagResult = scoreJetLag(flight, prefs);
  let jetLagDetail = null;

  if (jetLagResult) {
    penalties.jetLag = jetLagResult.penalty;
    jetLagDetail = jetLagResult.detail;
  }

  const totalPenalty = Object.values(penalties).reduce((sum, p) => sum + p, 0);
  const effectiveCost = flight.price + totalPenalty;

  return {
    flight,
    effectiveCost: Math.round(effectiveCost),
    penalties,
    totalPenalty: Math.round(totalPenalty),
    jetLagDetail,
  };
}

export function scoreFlights(
  flights: FlightItinerary[],
  prefs: Preferences
): ScoredFlight[] {
  const shortestDuration = Math.min(...flights.map(f => f.totalDurationMinutes));

  return flights
    .map(f => scoreFlight(f, prefs, shortestDuration))
    .sort((a, b) => a.effectiveCost - b.effectiveCost);
}
