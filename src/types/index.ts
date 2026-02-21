// ---- Reference Data Types ----

export type Alliance = 'Star Alliance' | 'Oneworld' | 'SkyTeam' | 'None';
export type AirlineTier = 'preferred' | 'acceptable' | 'avoid';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type SeatPosition = 'window' | 'aisle' | 'middle';
export type TripType = 'round_trip' | 'one_way';
export type SortField = 'effective_cost' | 'price' | 'duration' | 'departure';

export interface Airport {
  code: string;
  name: string;
  city: string;
  timezone: string; // IANA timezone
  lat: number;
  lon: number;
}

export interface Airline {
  code: string; // IATA 2-letter
  name: string;
  alliance: Alliance;
}

export interface Aircraft {
  code: string;
  name: string;
  cabinPressureAltitude: number; // feet — lower is better (A350 = 6000, typical = 8000)
  hasHighHumidity: boolean;
  hasBetterFiltration: boolean;
}

// ---- Flight Data Types ----

export interface FlightSegment {
  flightNumber: string;
  airlineCode: string;
  aircraftCode: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string; // ISO 8601 datetime
  arrivalTime: string;   // ISO 8601 datetime
  durationMinutes: number;
  cabinClass: CabinClass;
}

export interface FlightItinerary {
  id: string;
  segments: FlightSegment[];
  totalDurationMinutes: number;
  stops: number;
  price: number; // base ticket price in USD
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
}

// ---- Search Types ----

export interface SearchParams {
  origin: string;       // airport code or city
  destination: string;  // airport code or city
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD
  travelers: number;
  tripType: TripType;
}

// ---- Preferences Types ----

export interface AirportPreference {
  code: string;
  dollarPenalty: number;   // extra $ cost vs home airport
  timePenaltyMinutes: number; // extra travel time per leg
}

export interface AirlinePreference {
  code: string;
  tier: AirlineTier;
}

export interface Preferences {
  version: number;
  homeAirport: string;
  alternateAirports: AirportPreference[];
  airlines: AirlinePreference[];
  preferredAlliances: Alliance[];
  avoidAirlinePenalty: number;     // $ penalty for "avoid" tier
  acceptableAirlinePenalty: number; // $ penalty for "acceptable" tier
  nonPreferredAirlinePenalty: number; // $ penalty for unlisted airlines
  preferredCabin: CabinClass;
  businessIfOvernight: boolean;
  overnightEconomyPenalty: number; // $ penalty for economy on overnight
  seatPreference: SeatPosition;
  nonstopBonus: number;           // negative $ (reward) for nonstop
  perStopPenalty: number;         // $ per stop
  perLayoverHourPenalty: number;  // $ per hour of layover
  layoverThresholdMinutes: number; // layover time before penalties start
  preferredAircraft: string[];     // aircraft codes
  aircraftBonus: number;          // negative $ for preferred aircraft
  nonPreferredAircraftPenalty: number;
  earlyDeparturePenalty: number;  // $ for departures before earlyThreshold
  earlyDepartureThreshold: number; // hour (0-23), departures before this are "early"
  lateDeparturePenalty: number;
  lateDepartureThreshold: number;
  dollarPerHour: number;          // conversion rate for time → $
  maxBudget: number | null;
}

// ---- Scoring Types ----

export interface PenaltyBreakdown {
  airport: number;
  airline: number;
  cabinClass: number;
  stops: number;
  aircraft: number;
  departureTime: number;
  travelTime: number;
  jetLag: number;
}

export type PenaltyCategory = keyof PenaltyBreakdown;

export interface JetLagDetail {
  timezoneDelta: number;     // hours crossed
  direction: 'east' | 'west' | 'none';
  arrivalTimeScore: number;  // 0–100, higher is better
  aircraftBonus: boolean;
  redEyePenalty: boolean;
  overallScore: number;      // 0–100
}

export interface ScoredFlight {
  flight: FlightItinerary;
  effectiveCost: number;
  penalties: PenaltyBreakdown;
  totalPenalty: number;
  jetLagDetail: JetLagDetail | null;
}
