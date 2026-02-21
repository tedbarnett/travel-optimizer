import type { FlightItinerary, Preferences, JetLagDetail } from '../types';
import { getTimezoneDelta, getHourInTimezone, getDirection } from './timezone';
import { airports } from '../data/airports';

export function scoreJetLag(
  flight: FlightItinerary,
  prefs: Preferences
): { detail: JetLagDetail; penalty: number } | null {
  const originCode = flight.departureAirport;
  const destCode = flight.arrivalAirport;
  const destAirport = airports[destCode];
  if (!destAirport) return null;

  const tzDelta = getTimezoneDelta(originCode, destCode, flight.departureTime);
  const absDelta = Math.abs(tzDelta);

  // Only apply jet lag rules for 3+ timezone crossings
  if (absDelta < 3) return null;

  const direction = getDirection(tzDelta);
  let score = 100; // start at perfect, subtract for issues
  let penalty = 0;

  // 1. Arrival time scoring
  const arrivalHour = getHourInTimezone(flight.arrivalTime, destAirport.timezone);
  let arrivalTimeScore: number;

  if (direction === 'east') {
    // Prefer arriving late afternoon/early evening (16-20)
    if (arrivalHour >= 16 && arrivalHour <= 20) {
      arrivalTimeScore = 100;
    } else if (arrivalHour >= 14 && arrivalHour <= 22) {
      arrivalTimeScore = 70;
    } else if (arrivalHour >= 10) {
      arrivalTimeScore = 50;
    } else {
      arrivalTimeScore = 20; // early morning arrival eastbound is bad
    }
  } else {
    // West: prefer arriving in the morning (8-12)
    if (arrivalHour >= 8 && arrivalHour <= 12) {
      arrivalTimeScore = 100;
    } else if (arrivalHour >= 6 && arrivalHour <= 15) {
      arrivalTimeScore = 70;
    } else if (arrivalHour >= 15 && arrivalHour <= 20) {
      arrivalTimeScore = 50;
    } else {
      arrivalTimeScore = 20;
    }
  }

  score -= (100 - arrivalTimeScore) * 0.3;
  penalty += ((100 - arrivalTimeScore) / 100) * 50; // up to $50 for bad arrival time

  // 2. Aircraft bonus (A350-class aircraft with better cabin pressure)
  const hasPreferredAircraft = flight.segments.some(
    seg => prefs.preferredAircraft.includes(seg.aircraftCode)
  );
  if (hasPreferredAircraft) {
    score += 10;
    penalty -= 50; // bonus for jet-lag-reducing aircraft
  }

  // 3. Red-eye in economy penalty
  const depHour = new Date(flight.departureTime).getHours();
  const isRedEye = depHour >= 20 || depHour < 4;
  const hasEconomy = flight.segments.some(s => s.cabinClass === 'economy');
  const redEyePenalty = isRedEye && hasEconomy;

  if (redEyePenalty) {
    score -= 25;
    penalty += 150; // significant penalty for economy red-eye on long-haul
  }

  // 4. Connection timing vs destination sleep windows
  if (flight.segments.length > 1) {
    for (let i = 0; i < flight.segments.length - 1; i++) {
      const layoverStartHour = getHourInTimezone(
        flight.segments[i].arrivalTime,
        destAirport.timezone
      );
      // If layover happens during destination sleep time (23-7), it disrupts adjustment
      if (layoverStartHour >= 23 || layoverStartHour < 7) {
        score -= 15;
        penalty += 40;
      }
    }
  }

  // Scale penalty by number of timezones crossed
  const tzMultiplier = Math.min(absDelta / 6, 1.5); // caps at 9+ hours
  penalty = Math.round(penalty * tzMultiplier);

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    detail: {
      timezoneDelta: tzDelta,
      direction,
      arrivalTimeScore,
      aircraftBonus: hasPreferredAircraft,
      redEyePenalty,
      overallScore: score,
    },
    penalty: Math.max(0, penalty), // floor at 0 if bonuses outweigh penalties
  };
}
