import type { SearchParams, FlightItinerary, FlightSegment, CabinClass } from '../types';
import { airports } from './airports';

// Seeded random for deterministic results per search
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Rough distance in miles between two airports
function distanceMiles(a: string, b: string): number {
  const ap1 = airports[a];
  const ap2 = airports[b];
  if (!ap1 || !ap2) return 2000;
  const R = 3959;
  const dLat = (ap2.lat - ap1.lat) * Math.PI / 180;
  const dLon = (ap2.lon - ap1.lon) * Math.PI / 180;
  const lat1 = ap1.lat * Math.PI / 180;
  const lat2 = ap2.lat * Math.PI / 180;
  const a2 = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

type RouteConfig = {
  airlineCodes: string[];
  aircraftCodes: string[];
  hubAirports: string[];
};

function getRouteConfig(origin: string, destination: string): RouteConfig {
  const isDomestic = airports[origin]?.timezone.startsWith('America/') && airports[destination]?.timezone.startsWith('America/');
  const isTransatlantic = (airports[origin]?.timezone.startsWith('America/') && airports[destination]?.timezone.startsWith('Europe/')) ||
                          (airports[origin]?.timezone.startsWith('Europe/') && airports[destination]?.timezone.startsWith('America/'));
  const isTranspacific = (airports[origin]?.timezone.startsWith('America/') && (airports[destination]?.timezone.startsWith('Asia/') || airports[destination]?.timezone.startsWith('Australia/'))) ||
                         ((airports[origin]?.timezone.startsWith('Asia/') || airports[origin]?.timezone.startsWith('Australia/')) && airports[destination]?.timezone.startsWith('America/'));

  if (isDomestic) {
    return {
      airlineCodes: ['UA', 'AA', 'DL', 'B6', 'WN', 'NK', 'AS', 'F9'],
      aircraftCodes: ['B738', 'A321', 'B739', 'A320', 'B757', 'E175'],
      hubAirports: ['ORD', 'DFW', 'ATL', 'DEN', 'IAH', 'CLT', 'PHX', 'MSP'],
    };
  }
  if (isTransatlantic) {
    return {
      airlineCodes: ['UA', 'AA', 'DL', 'BA', 'LH', 'AF', 'KL'],
      aircraftCodes: ['B777', 'A350', 'B787', 'A330', 'B767'],
      hubAirports: ['ORD', 'IAD', 'BOS', 'JFK'],
    };
  }
  if (isTranspacific) {
    return {
      airlineCodes: ['UA', 'AA', 'DL', 'NH', 'JL', 'SQ', 'CX', 'KE'],
      aircraftCodes: ['B777', 'A350', 'B787', 'A380'],
      hubAirports: ['LAX', 'SFO', 'ORD', 'NRT', 'ICN'],
    };
  }
  return {
    airlineCodes: ['UA', 'AA', 'DL', 'EK', 'BA', 'LH'],
    aircraftCodes: ['B777', 'A350', 'B787', 'A380', 'A330'],
    hubAirports: ['JFK', 'ORD', 'DXB', 'LHR', 'FRA'],
  };
}

// Get nearby alternative airports
function getAlternateOrigins(origin: string): string[] {
  const groups: Record<string, string[]> = {
    EWR: ['JFK', 'LGA'],
    JFK: ['EWR', 'LGA'],
    LGA: ['EWR', 'JFK'],
    SFO: ['OAK', 'SJC'],
    OAK: ['SFO', 'SJC'],
    SJC: ['SFO', 'OAK'],
    LAX: ['SAN'],
    ORD: ['MDW'],
    MDW: ['ORD'],
    DCA: ['IAD'],
    IAD: ['DCA'],
    LHR: ['LGW'],
    LGW: ['LHR'],
    NRT: ['HND'],
    HND: ['NRT'],
  };
  return groups[origin] || [];
}

function formatTime(date: Date): string {
  return date.toISOString().replace('.000Z', '');
}

function addMinutes(dateStr: string, mins: number): Date {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

export function generateMockFlights(params: SearchParams): FlightItinerary[] {
  const { origin, destination, departureDate } = params;
  const seed = hashString(`${origin}-${destination}-${departureDate}`);
  const rand = seededRandom(seed);
  const dist = distanceMiles(origin, destination);
  const config = getRouteConfig(origin, destination);

  const flights: FlightItinerary[] = [];
  let id = 0;

  const baseDurationMin = Math.round((dist / 500) * 60); // ~500mph cruise
  const isLongHaul = dist > 3000;
  const cabinOptions: CabinClass[] = isLongHaul ? ['economy', 'premium_economy', 'business'] : ['economy'];

  // Generate nonstop flights
  const nonstopCount = isLongHaul ? Math.floor(rand() * 3) + 2 : Math.floor(rand() * 4) + 3;
  for (let i = 0; i < nonstopCount; i++) {
    const airline = config.airlineCodes[Math.floor(rand() * config.airlineCodes.length)];
    const acft = config.aircraftCodes[Math.floor(rand() * config.aircraftCodes.length)];
    const cabin = cabinOptions[Math.floor(rand() * cabinOptions.length)];
    const depHour = 6 + Math.floor(rand() * 16); // 6am to 10pm
    const depMin = Math.floor(rand() * 4) * 15;
    const jitter = Math.round((rand() - 0.5) * 30);
    const dur = baseDurationMin + jitter;

    const depTime = `${departureDate}T${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}:00`;
    const arrTime = formatTime(addMinutes(depTime, dur));
    const flightNum = `${airline}${100 + Math.floor(rand() * 900)}`;

    const basePrice = Math.round(dist * (0.08 + rand() * 0.06));
    const cabinMultiplier = cabin === 'business' ? 3.5 + rand() : cabin === 'premium_economy' ? 1.6 + rand() * 0.4 : 1;
    const price = Math.round(basePrice * cabinMultiplier);

    const segment: FlightSegment = {
      flightNumber: flightNum,
      airlineCode: airline,
      aircraftCode: acft,
      departureAirport: origin,
      arrivalAirport: destination,
      departureTime: depTime,
      arrivalTime: arrTime,
      durationMinutes: dur,
      cabinClass: cabin,
    };

    flights.push({
      id: `f${id++}`,
      segments: [segment],
      totalDurationMinutes: dur,
      stops: 0,
      price,
      departureAirport: origin,
      arrivalAirport: destination,
      departureTime: depTime,
      arrivalTime: arrTime,
    });
  }

  // Generate 1-stop connecting flights
  const connectCount = Math.floor(rand() * 4) + 3;
  for (let i = 0; i < connectCount; i++) {
    const hub = config.hubAirports.filter(h => h !== origin && h !== destination)[
      Math.floor(rand() * (config.hubAirports.length - 1))
    ] || 'ORD';
    const airline = config.airlineCodes[Math.floor(rand() * config.airlineCodes.length)];
    const acft1 = config.aircraftCodes[Math.floor(rand() * config.aircraftCodes.length)];
    const acft2 = config.aircraftCodes[Math.floor(rand() * config.aircraftCodes.length)];
    const cabin = cabinOptions[Math.floor(rand() * cabinOptions.length)];
    const depHour = 6 + Math.floor(rand() * 14);
    const depMin = Math.floor(rand() * 4) * 15;

    const dist1 = distanceMiles(origin, hub);
    const dist2 = distanceMiles(hub, destination);
    const dur1 = Math.round((dist1 / 500) * 60) + Math.round((rand() - 0.5) * 20);
    const layover = 60 + Math.floor(rand() * 180); // 1-4 hours
    const dur2 = Math.round((dist2 / 500) * 60) + Math.round((rand() - 0.5) * 20);

    const depTime1 = `${departureDate}T${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}:00`;
    const arrTime1 = formatTime(addMinutes(depTime1, dur1));
    const depTime2 = formatTime(addMinutes(depTime1, dur1 + layover));
    const arrTime2 = formatTime(addMinutes(depTime1, dur1 + layover + dur2));

    const basePrice = Math.round((dist1 + dist2) * (0.06 + rand() * 0.04));
    const cabinMultiplier = cabin === 'business' ? 3.2 + rand() : cabin === 'premium_economy' ? 1.5 + rand() * 0.3 : 1;
    const price = Math.round(basePrice * cabinMultiplier * (0.8 + rand() * 0.2)); // connections are cheaper

    const seg1: FlightSegment = {
      flightNumber: `${airline}${100 + Math.floor(rand() * 900)}`,
      airlineCode: airline,
      aircraftCode: acft1,
      departureAirport: origin,
      arrivalAirport: hub,
      departureTime: depTime1,
      arrivalTime: arrTime1,
      durationMinutes: dur1,
      cabinClass: cabin,
    };
    const seg2: FlightSegment = {
      flightNumber: `${airline}${100 + Math.floor(rand() * 900)}`,
      airlineCode: airline,
      aircraftCode: acft2,
      departureAirport: hub,
      arrivalAirport: destination,
      departureTime: depTime2,
      arrivalTime: arrTime2,
      durationMinutes: dur2,
      cabinClass: cabin,
    };

    const totalDur = dur1 + layover + dur2;
    flights.push({
      id: `f${id++}`,
      segments: [seg1, seg2],
      totalDurationMinutes: totalDur,
      stops: 1,
      price,
      departureAirport: origin,
      arrivalAirport: destination,
      departureTime: depTime1,
      arrivalTime: arrTime2,
    });
  }

  // Generate red-eye flights (for long-haul/transatlantic)
  if (isLongHaul) {
    for (let i = 0; i < 2; i++) {
      const airline = config.airlineCodes[Math.floor(rand() * config.airlineCodes.length)];
      const acft = config.aircraftCodes[Math.floor(rand() * config.aircraftCodes.length)];
      const cabin = cabinOptions[Math.floor(rand() * cabinOptions.length)];
      const depHour = 20 + Math.floor(rand() * 4); // 8pm - midnight
      const dur = baseDurationMin + Math.round((rand() - 0.5) * 30);

      const depTime = `${departureDate}T${String(depHour).padStart(2, '0')}:${String(Math.floor(rand() * 4) * 15).padStart(2, '0')}:00`;
      const arrTime = formatTime(addMinutes(depTime, dur));
      const flightNum = `${airline}${100 + Math.floor(rand() * 900)}`;

      const basePrice = Math.round(dist * (0.07 + rand() * 0.05));
      const cabinMultiplier = cabin === 'business' ? 3.5 + rand() : cabin === 'premium_economy' ? 1.6 + rand() * 0.4 : 1;
      const price = Math.round(basePrice * cabinMultiplier);

      flights.push({
        id: `f${id++}`,
        segments: [{
          flightNumber: flightNum,
          airlineCode: airline,
          aircraftCode: acft,
          departureAirport: origin,
          arrivalAirport: destination,
          departureTime: depTime,
          arrivalTime: arrTime,
          durationMinutes: dur,
          cabinClass: cabin,
        }],
        totalDurationMinutes: dur,
        stops: 0,
        price,
        departureAirport: origin,
        arrivalAirport: destination,
        departureTime: depTime,
        arrivalTime: arrTime,
      });
    }
  }

  // Generate flights from alternate airports
  const alts = getAlternateOrigins(origin);
  for (const altOrigin of alts.slice(0, 2)) {
    const airline = config.airlineCodes[Math.floor(rand() * config.airlineCodes.length)];
    const acft = config.aircraftCodes[Math.floor(rand() * config.aircraftCodes.length)];
    const cabin: CabinClass = 'economy';
    const depHour = 8 + Math.floor(rand() * 10);
    const altDist = distanceMiles(altOrigin, destination);
    const dur = Math.round((altDist / 500) * 60) + Math.round((rand() - 0.5) * 20);

    const depTime = `${departureDate}T${String(depHour).padStart(2, '0')}:${String(Math.floor(rand() * 4) * 15).padStart(2, '0')}:00`;
    const arrTime = formatTime(addMinutes(depTime, dur));
    const price = Math.round(altDist * (0.07 + rand() * 0.05));

    flights.push({
      id: `f${id++}`,
      segments: [{
        flightNumber: `${airline}${100 + Math.floor(rand() * 900)}`,
        airlineCode: airline,
        aircraftCode: acft,
        departureAirport: altOrigin,
        arrivalAirport: destination,
        departureTime: depTime,
        arrivalTime: arrTime,
        durationMinutes: dur,
        cabinClass: cabin,
      }],
      totalDurationMinutes: dur,
      stops: 0,
      price,
      departureAirport: altOrigin,
      arrivalAirport: destination,
      departureTime: depTime,
      arrivalTime: arrTime,
    });
  }

  return flights;
}
