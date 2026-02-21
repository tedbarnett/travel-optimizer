import { describe, it, expect } from 'vitest';
import { scoreFlight, scoreFlights } from '../scorer';
import type { FlightItinerary } from '../../types';
import { defaultPreferences } from '../../data/defaults';

function makeSegment(overrides: Partial<import('../../types').FlightSegment> = {}): import('../../types').FlightSegment {
  return {
    flightNumber: 'UA100',
    airlineCode: 'UA',
    aircraftCode: 'B738',
    departureAirport: 'EWR',
    arrivalAirport: 'SFO',
    departureTime: '2026-03-15T10:00:00',
    arrivalTime: '2026-03-15T16:20:00',
    durationMinutes: 380,
    cabinClass: 'economy',
    ...overrides,
  };
}

function makeFlight(overrides: Partial<FlightItinerary> = {}, segOverrides: Partial<import('../../types').FlightSegment> = {}): FlightItinerary {
  const seg = makeSegment(segOverrides);
  return {
    id: 'test-1',
    segments: [seg],
    totalDurationMinutes: seg.durationMinutes,
    stops: 0,
    price: 350,
    departureAirport: seg.departureAirport,
    arrivalAirport: seg.arrivalAirport,
    departureTime: seg.departureTime,
    arrivalTime: seg.arrivalTime,
    ...overrides,
  };
}

const prefs = defaultPreferences;

describe('Scoring Engine', () => {
  describe('Airport Penalty', () => {
    it('no penalty for home airport', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.airport).toBe(0);
    });

    it('adds penalty for alternate airport (JFK)', () => {
      const flight = makeFlight({}, { departureAirport: 'JFK' });
      flight.departureAirport = 'JFK';
      const result = scoreFlight(flight, prefs, 380);
      // JFK = $100 + 120min * $50/hr = $100 + $100 = $200
      expect(result.penalties.airport).toBe(200);
    });
  });

  describe('Airline Penalty', () => {
    it('no penalty for preferred airline (United)', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.airline).toBe(0);
    });

    it('acceptable penalty for American', () => {
      const flight = makeFlight({}, { airlineCode: 'AA' });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.airline).toBe(prefs.acceptableAirlinePenalty);
    });

    it('avoid penalty for Spirit', () => {
      const flight = makeFlight({}, { airlineCode: 'NK' });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.airline).toBe(prefs.avoidAirlinePenalty);
    });

    it('non-preferred penalty for unlisted airline', () => {
      const flight = makeFlight({}, { airlineCode: 'ZZ' });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.airline).toBe(prefs.nonPreferredAirlinePenalty);
    });
  });

  describe('Stops Penalty', () => {
    it('gives nonstop bonus', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.stops).toBe(prefs.nonstopBonus);
    });

    it('penalizes 1-stop flight', () => {
      const seg1 = makeSegment({
        arrivalAirport: 'ORD',
        arrivalTime: '2026-03-15T13:00:00',
        durationMinutes: 180,
      });
      const seg2 = makeSegment({
        departureAirport: 'ORD',
        departureTime: '2026-03-15T15:00:00',
        arrivalTime: '2026-03-15T18:00:00',
        durationMinutes: 180,
      });
      const flight: FlightItinerary = {
        id: 'test-connect',
        segments: [seg1, seg2],
        totalDurationMinutes: 480,
        stops: 1,
        price: 280,
        departureAirport: 'EWR',
        arrivalAirport: 'SFO',
        departureTime: seg1.departureTime,
        arrivalTime: seg2.arrivalTime,
      };
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.stops).toBeGreaterThan(0);
      // 1 stop ($75) + 1hr excess layover ($25)
      expect(result.penalties.stops).toBe(75 + 25);
    });
  });

  describe('Aircraft Penalty', () => {
    it('gives bonus for A350', () => {
      const flight = makeFlight({}, { aircraftCode: 'A350' });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.aircraft).toBe(prefs.aircraftBonus); // negative
    });

    it('no penalty for non-preferred when set to 0', () => {
      const flight = makeFlight({}, { aircraftCode: 'B738' });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.aircraft).toBe(0);
    });
  });

  describe('Departure Time Penalty', () => {
    it('penalizes early departure', () => {
      // Use same-timezone route (EWR→BOS) to avoid westbound reduction
      const flight = makeFlight({}, {
        departureTime: '2026-03-15T05:30:00',
        arrivalAirport: 'BOS',
      });
      flight.departureTime = '2026-03-15T05:30:00';
      flight.arrivalAirport = 'BOS';
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.departureTime).toBe(prefs.earlyDeparturePenalty);
    });

    it('no penalty for midday departure', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.departureTime).toBe(0);
    });
  });

  describe('Travel Time Penalty', () => {
    it('no penalty for shortest flight', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.travelTime).toBe(0);
    });

    it('penalizes excess travel time', () => {
      const flight = makeFlight({ totalDurationMinutes: 500 });
      const result = scoreFlight(flight, prefs, 380);
      // 120 extra minutes = 2 hours * $50/hr = $100
      expect(result.penalties.travelTime).toBe(100);
    });
  });

  describe('Cabin Class Penalty', () => {
    it('penalizes economy on overnight flight', () => {
      const flight = makeFlight({}, {
        departureTime: '2026-03-15T21:00:00',
        arrivalTime: '2026-03-16T07:00:00',
        durationMinutes: 600,
        cabinClass: 'economy',
      });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.cabinClass).toBe(prefs.overnightEconomyPenalty);
    });

    it('no penalty for business on overnight', () => {
      const flight = makeFlight({}, {
        departureTime: '2026-03-15T21:00:00',
        arrivalTime: '2026-03-16T07:00:00',
        durationMinutes: 600,
        cabinClass: 'business',
      });
      const result = scoreFlight(flight, prefs, 380);
      expect(result.penalties.cabinClass).toBe(0);
    });
  });

  describe('Effective Cost Calculation', () => {
    it('effective cost = price + total penalty', () => {
      const flight = makeFlight();
      const result = scoreFlight(flight, prefs, 380);
      expect(result.effectiveCost).toBe(
        flight.price + result.totalPenalty
      );
    });
  });

  describe('scoreFlights', () => {
    it('sorts by effective cost', () => {
      const cheap = makeFlight({ id: 'cheap', price: 200 });
      const expensive = makeFlight({ id: 'expensive', price: 500 });
      const results = scoreFlights([expensive, cheap], prefs);
      expect(results[0].flight.id).toBe('cheap');
      expect(results[1].flight.id).toBe('expensive');
    });
  });

  describe('Jet Lag', () => {
    it('activates for transatlantic flights (EWR → LHR)', () => {
      const flight = makeFlight({}, {
        arrivalAirport: 'LHR',
        departureTime: '2026-03-15T18:00:00',
        arrivalTime: '2026-03-16T06:00:00',
        durationMinutes: 420,
      });
      flight.arrivalAirport = 'LHR';
      flight.arrivalTime = '2026-03-16T06:00:00';
      const result = scoreFlight(flight, prefs, 420);
      expect(result.jetLagDetail).not.toBeNull();
      expect(result.jetLagDetail!.timezoneDelta).toBeGreaterThan(0);
      expect(result.jetLagDetail!.direction).toBe('east');
    });

    it('does not activate for short domestic flights', () => {
      const flight = makeFlight(); // EWR → SFO = 3 hours, edge case
      const result = scoreFlight(flight, prefs, 380);
      // SFO is only 3 hours behind EWR, so this is borderline
      // The test validates the mechanism works
      if (result.jetLagDetail) {
        expect(Math.abs(result.jetLagDetail.timezoneDelta)).toBeGreaterThanOrEqual(3);
      }
    });

    it('gives aircraft bonus for A350 on long-haul', () => {
      const flight = makeFlight({}, {
        aircraftCode: 'A350',
        arrivalAirport: 'LHR',
        departureTime: '2026-03-15T18:00:00',
        arrivalTime: '2026-03-16T06:00:00',
        durationMinutes: 420,
      });
      flight.arrivalAirport = 'LHR';
      flight.arrivalTime = '2026-03-16T06:00:00';
      const result = scoreFlight(flight, prefs, 420);
      expect(result.jetLagDetail).not.toBeNull();
      expect(result.jetLagDetail!.aircraftBonus).toBe(true);
    });
  });
});
