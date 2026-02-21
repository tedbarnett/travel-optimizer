import type { Aircraft } from '../types';

export const aircraft: Record<string, Aircraft> = {
  A350: { code: 'A350', name: 'Airbus A350', cabinPressureAltitude: 6000, hasHighHumidity: true, hasBetterFiltration: true },
  A380: { code: 'A380', name: 'Airbus A380', cabinPressureAltitude: 6000, hasHighHumidity: true, hasBetterFiltration: true },
  B787: { code: 'B787', name: 'Boeing 787 Dreamliner', cabinPressureAltitude: 6000, hasHighHumidity: true, hasBetterFiltration: true },
  A330: { code: 'A330', name: 'Airbus A330', cabinPressureAltitude: 6900, hasHighHumidity: false, hasBetterFiltration: false },
  B777: { code: 'B777', name: 'Boeing 777', cabinPressureAltitude: 6900, hasHighHumidity: false, hasBetterFiltration: false },
  B767: { code: 'B767', name: 'Boeing 767', cabinPressureAltitude: 7900, hasHighHumidity: false, hasBetterFiltration: false },
  B757: { code: 'B757', name: 'Boeing 757', cabinPressureAltitude: 7900, hasHighHumidity: false, hasBetterFiltration: false },
  A321: { code: 'A321', name: 'Airbus A321', cabinPressureAltitude: 7800, hasHighHumidity: false, hasBetterFiltration: false },
  A320: { code: 'A320', name: 'Airbus A320', cabinPressureAltitude: 7800, hasHighHumidity: false, hasBetterFiltration: false },
  B738: { code: 'B738', name: 'Boeing 737-800', cabinPressureAltitude: 7800, hasHighHumidity: false, hasBetterFiltration: false },
  B739: { code: 'B739', name: 'Boeing 737-900', cabinPressureAltitude: 7800, hasHighHumidity: false, hasBetterFiltration: false },
  E175: { code: 'E175', name: 'Embraer E175', cabinPressureAltitude: 7800, hasHighHumidity: false, hasBetterFiltration: false },
  CRJ9: { code: 'CRJ9', name: 'CRJ-900', cabinPressureAltitude: 8000, hasHighHumidity: false, hasBetterFiltration: false },
};

export function getAircraft(code: string): Aircraft | undefined {
  return aircraft[code.toUpperCase()];
}
