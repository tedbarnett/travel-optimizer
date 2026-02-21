import { airports } from '../data/airports';

// Get UTC offset in hours for a timezone at a given date
export function getUtcOffsetHours(timezone: string, dateStr: string): number {
  const date = new Date(dateStr);
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = date.toLocaleString('en-US', { timeZone: timezone });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

// Get timezone delta between two airports in hours
export function getTimezoneDelta(originCode: string, destCode: string, dateStr: string): number {
  const origin = airports[originCode];
  const dest = airports[destCode];
  if (!origin || !dest) return 0;
  const originOffset = getUtcOffsetHours(origin.timezone, dateStr);
  const destOffset = getUtcOffsetHours(dest.timezone, dateStr);
  return destOffset - originOffset;
}

// Get hour in destination timezone from a departure datetime
export function getHourInTimezone(dateTimeStr: string, timezone: string): number {
  const date = new Date(dateTimeStr);
  const parts = date.toLocaleString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  return parseInt(parts.split(':')[0], 10);
}

// Determine direction of travel (east or west)
export function getDirection(timezoneDelta: number): 'east' | 'west' | 'none' {
  if (timezoneDelta > 1) return 'east';
  if (timezoneDelta < -1) return 'west';
  return 'none';
}
