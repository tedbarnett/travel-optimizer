import type { Airport } from '../types';

export const airports: Record<string, Airport> = {
  // New York Area
  EWR: { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', timezone: 'America/New_York', lat: 40.6925, lon: -74.1686 },
  JFK: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', timezone: 'America/New_York', lat: 40.6413, lon: -73.7781 },
  LGA: { code: 'LGA', name: 'LaGuardia', city: 'New York', timezone: 'America/New_York', lat: 40.7769, lon: -73.8740 },
  // California
  SFO: { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', timezone: 'America/Los_Angeles', lat: 37.6213, lon: -122.3790 },
  LAX: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', timezone: 'America/Los_Angeles', lat: 33.9425, lon: -118.4081 },
  SJC: { code: 'SJC', name: 'San Jose International', city: 'San Jose', timezone: 'America/Los_Angeles', lat: 37.3639, lon: -121.9289 },
  OAK: { code: 'OAK', name: 'Oakland International', city: 'Oakland', timezone: 'America/Los_Angeles', lat: 37.7213, lon: -122.2208 },
  SAN: { code: 'SAN', name: 'San Diego International', city: 'San Diego', timezone: 'America/Los_Angeles', lat: 32.7338, lon: -117.1933 },
  // Midwest
  ORD: { code: 'ORD', name: "O'Hare International", city: 'Chicago', timezone: 'America/Chicago', lat: 41.9742, lon: -87.9073 },
  MDW: { code: 'MDW', name: 'Midway International', city: 'Chicago', timezone: 'America/Chicago', lat: 41.7868, lon: -87.7522 },
  DTW: { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', timezone: 'America/Detroit', lat: 42.2124, lon: -83.3534 },
  MSP: { code: 'MSP', name: 'Minneapolis-Saint Paul', city: 'Minneapolis', timezone: 'America/Chicago', lat: 44.8848, lon: -93.2223 },
  // South
  ATL: { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', timezone: 'America/New_York', lat: 33.6407, lon: -84.4277 },
  MIA: { code: 'MIA', name: 'Miami International', city: 'Miami', timezone: 'America/New_York', lat: 25.7959, lon: -80.2870 },
  FLL: { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale', timezone: 'America/New_York', lat: 26.0726, lon: -80.1527 },
  DFW: { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', timezone: 'America/Chicago', lat: 32.8998, lon: -97.0403 },
  IAH: { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', timezone: 'America/Chicago', lat: 29.9902, lon: -95.3368 },
  DEN: { code: 'DEN', name: 'Denver International', city: 'Denver', timezone: 'America/Denver', lat: 39.8561, lon: -104.6737 },
  // Pacific Northwest
  SEA: { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', timezone: 'America/Los_Angeles', lat: 47.4502, lon: -122.3088 },
  PDX: { code: 'PDX', name: 'Portland International', city: 'Portland', timezone: 'America/Los_Angeles', lat: 45.5898, lon: -122.5951 },
  // Other US
  BOS: { code: 'BOS', name: 'Boston Logan International', city: 'Boston', timezone: 'America/New_York', lat: 42.3656, lon: -71.0096 },
  PHL: { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', timezone: 'America/New_York', lat: 39.8744, lon: -75.2424 },
  DCA: { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', timezone: 'America/New_York', lat: 38.8512, lon: -77.0402 },
  IAD: { code: 'IAD', name: 'Washington Dulles International', city: 'Washington', timezone: 'America/New_York', lat: 38.9531, lon: -77.4565 },
  CLT: { code: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', timezone: 'America/New_York', lat: 35.2140, lon: -80.9431 },
  PHX: { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', timezone: 'America/Phoenix', lat: 33.4373, lon: -112.0078 },
  LAS: { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', timezone: 'America/Los_Angeles', lat: 36.0840, lon: -115.1537 },
  MCO: { code: 'MCO', name: 'Orlando International', city: 'Orlando', timezone: 'America/New_York', lat: 28.4312, lon: -81.3081 },
  MSY: { code: 'MSY', name: 'Louis Armstrong New Orleans', city: 'New Orleans', timezone: 'America/Chicago', lat: 29.9934, lon: -90.2580 },
  SLC: { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', timezone: 'America/Denver', lat: 40.7899, lon: -111.9791 },
  HNL: { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', timezone: 'Pacific/Honolulu', lat: 21.3187, lon: -157.9225 },
  ANC: { code: 'ANC', name: 'Ted Stevens Anchorage', city: 'Anchorage', timezone: 'America/Anchorage', lat: 61.1744, lon: -149.9964 },
  // Europe
  LHR: { code: 'LHR', name: 'London Heathrow', city: 'London', timezone: 'Europe/London', lat: 51.4700, lon: -0.4543 },
  LGW: { code: 'LGW', name: 'London Gatwick', city: 'London', timezone: 'Europe/London', lat: 51.1537, lon: -0.1821 },
  CDG: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', timezone: 'Europe/Paris', lat: 49.0097, lon: 2.5479 },
  FRA: { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', timezone: 'Europe/Berlin', lat: 50.0379, lon: 8.5622 },
  MUC: { code: 'MUC', name: 'Munich Airport', city: 'Munich', timezone: 'Europe/Berlin', lat: 48.3537, lon: 11.7750 },
  AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', timezone: 'Europe/Amsterdam', lat: 52.3105, lon: 4.7683 },
  MAD: { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', timezone: 'Europe/Madrid', lat: 40.4983, lon: -3.5676 },
  FCO: { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', timezone: 'Europe/Rome', lat: 41.8003, lon: 12.2389 },
  ZRH: { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', timezone: 'Europe/Zurich', lat: 47.4647, lon: 8.5492 },
  // Asia
  NRT: { code: 'NRT', name: 'Narita International', city: 'Tokyo', timezone: 'Asia/Tokyo', lat: 35.7720, lon: 140.3929 },
  HND: { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', timezone: 'Asia/Tokyo', lat: 35.5494, lon: 139.7798 },
  ICN: { code: 'ICN', name: 'Incheon International', city: 'Seoul', timezone: 'Asia/Seoul', lat: 37.4602, lon: 126.4407 },
  SIN: { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', timezone: 'Asia/Singapore', lat: 1.3644, lon: 103.9915 },
  HKG: { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', timezone: 'Asia/Hong_Kong', lat: 22.3080, lon: 113.9185 },
  PEK: { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', timezone: 'Asia/Shanghai', lat: 40.0799, lon: 116.6031 },
  DXB: { code: 'DXB', name: 'Dubai International', city: 'Dubai', timezone: 'Asia/Dubai', lat: 25.2532, lon: 55.3657 },
  DEL: { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', timezone: 'Asia/Kolkata', lat: 28.5562, lon: 77.1000 },
  BKK: { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', timezone: 'Asia/Bangkok', lat: 13.6900, lon: 100.7501 },
  // Oceania
  SYD: { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', timezone: 'Australia/Sydney', lat: -33.9461, lon: 151.1772 },
};

export function getAirport(code: string): Airport | undefined {
  return airports[code.toUpperCase()];
}

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase();
  if (q.length === 0) return [];
  return Object.values(airports).filter(
    a => a.code.toLowerCase().includes(q) ||
         a.name.toLowerCase().includes(q) ||
         a.city.toLowerCase().includes(q)
  ).slice(0, 10);
}
