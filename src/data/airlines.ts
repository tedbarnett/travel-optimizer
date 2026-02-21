import type { Airline } from '../types';

export const airlines: Record<string, Airline> = {
  // Star Alliance
  UA: { code: 'UA', name: 'United Airlines', alliance: 'Star Alliance' },
  LH: { code: 'LH', name: 'Lufthansa', alliance: 'Star Alliance' },
  NH: { code: 'NH', name: 'ANA', alliance: 'Star Alliance' },
  AC: { code: 'AC', name: 'Air Canada', alliance: 'Star Alliance' },
  SQ: { code: 'SQ', name: 'Singapore Airlines', alliance: 'Star Alliance' },
  SK: { code: 'SK', name: 'SAS', alliance: 'Star Alliance' },
  // Oneworld
  AA: { code: 'AA', name: 'American Airlines', alliance: 'Oneworld' },
  BA: { code: 'BA', name: 'British Airways', alliance: 'Oneworld' },
  JL: { code: 'JL', name: 'Japan Airlines', alliance: 'Oneworld' },
  QF: { code: 'QF', name: 'Qantas', alliance: 'Oneworld' },
  CX: { code: 'CX', name: 'Cathay Pacific', alliance: 'Oneworld' },
  // SkyTeam
  DL: { code: 'DL', name: 'Delta Air Lines', alliance: 'SkyTeam' },
  AF: { code: 'AF', name: 'Air France', alliance: 'SkyTeam' },
  KL: { code: 'KL', name: 'KLM', alliance: 'SkyTeam' },
  KE: { code: 'KE', name: 'Korean Air', alliance: 'SkyTeam' },
  // No Alliance
  B6: { code: 'B6', name: 'JetBlue', alliance: 'None' },
  WN: { code: 'WN', name: 'Southwest Airlines', alliance: 'None' },
  NK: { code: 'NK', name: 'Spirit Airlines', alliance: 'None' },
  F9: { code: 'F9', name: 'Frontier Airlines', alliance: 'None' },
  AS: { code: 'AS', name: 'Alaska Airlines', alliance: 'Oneworld' },
  EK: { code: 'EK', name: 'Emirates', alliance: 'None' },
};

export function getAirline(code: string): Airline | undefined {
  return airlines[code.toUpperCase()];
}
