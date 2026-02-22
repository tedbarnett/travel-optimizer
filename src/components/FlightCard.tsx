import { useState } from 'react';
import type { ScoredFlight, Preferences, PenaltyCategory } from '../types';
import { getAirline } from '../data/airlines';
import { getAircraft } from '../data/aircraft';
import { getAirport } from '../data/airports';

interface Props {
  scored: ScoredFlight;
  preferences: Preferences;
  rank: number;
}

const penaltyLabels: Record<PenaltyCategory, string> = {
  airport: 'Airport',
  airline: 'Airline',
  cabinClass: 'Cabin Class',
  stops: 'Stops / Layover',
  aircraft: 'Aircraft',
  departureTime: 'Departure Time',
  travelTime: 'Travel Time',
  jetLag: 'Jet Lag',
};

function formatTime(dateStr: string, timezone?: string): string {
  const d = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  if (timezone) opts.timeZone = timezone;
  return d.toLocaleTimeString('en-US', opts);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatDollar(amount: number): string {
  if (amount === 0) return '$0';
  const prefix = amount < 0 ? '-' : '+';
  return `${prefix}$${Math.abs(amount)}`;
}

export default function FlightCard({ scored, preferences, rank }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { flight, effectiveCost, penalties, totalPenalty, jetLagDetail } = scored;
  const firstSeg = flight.segments[0];
  const airline = getAirline(firstSeg.airlineCode);
  const acft = getAircraft(firstSeg.aircraftCode);

  // Badge checks
  const isPreferredAirline = preferences.airlines.some(a => a.code === firstSeg.airlineCode && a.tier === 'preferred');
  const isPreferredAircraft = preferences.preferredAircraft.includes(firstSeg.aircraftCode);
  const isNonstop = flight.stops === 0;
  const isHomeAirport = flight.departureAirport === preferences.homeAirport;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
            {rank}
          </div>

          {/* Flight info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{airline?.name || firstSeg.airlineCode}</span>
              <span className="text-sm text-gray-500">{firstSeg.flightNumber}</span>
              {flight.segments.length > 1 && (
                <span className="text-xs text-gray-400">+{flight.segments.length - 1} more</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono">
                {getAirport(flight.departureAirport)?.code || flight.departureAirport}
              </span>
              <span className="text-gray-900 font-medium">{formatTime(flight.departureTime, getAirport(flight.departureAirport)?.timezone)}</span>
              <span className="text-gray-400">→</span>
              <span className="font-mono">
                {getAirport(flight.arrivalAirport)?.code || flight.arrivalAirport}
              </span>
              <span className="text-gray-900 font-medium">{formatTime(flight.arrivalTime, getAirport(flight.arrivalAirport)?.timezone)}</span>
              <span className="text-gray-500 ml-1">{formatDuration(flight.totalDurationMinutes)}</span>
              <span className="text-gray-500">
                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-gray-500">{acft?.name || firstSeg.aircraftCode}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500 capitalize">{firstSeg.cabinClass.replace('_', ' ')}</span>
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {isPreferredAirline && <Badge color="green" label="Preferred Airline" />}
              {isPreferredAircraft && <Badge color="purple" label="Preferred Aircraft" />}
              {isNonstop && <Badge color="blue" label="Nonstop" />}
              {isHomeAirport && <Badge color="gray" label="Home Airport" />}
              {jetLagDetail && <JetLagBadge score={jetLagDetail.overallScore} />}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-gray-900">${effectiveCost}</div>
            <div className="text-sm text-gray-500">effective</div>
            <div className="text-sm text-gray-400 mt-1">
              ${flight.price} ticket
              {totalPenalty !== 0 && (
                <span className={totalPenalty > 0 ? 'text-red-500' : 'text-green-600'}>
                  {' '}{formatDollar(totalPenalty)}
                </span>
              )}
            </div>
            <button className="text-xs text-blue-600 mt-1 hover:underline">
              {expanded ? 'Hide details' : 'Show breakdown'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {/* Segments detail */}
          {flight.segments.length > 1 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Segments</div>
              {flight.segments.map((seg, i) => {
                const segAirline = getAirline(seg.airlineCode);
                const segAcft = getAircraft(seg.aircraftCode);
                return (
                  <div key={i} className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs">{seg.flightNumber}</span>
                    <span>{segAirline?.name}</span>
                    <span className="text-gray-400">|</span>
                    <span>{seg.departureAirport} {formatTime(seg.departureTime, getAirport(seg.departureAirport)?.timezone)} → {seg.arrivalAirport} {formatTime(seg.arrivalTime, getAirport(seg.arrivalAirport)?.timezone)}</span>
                    <span className="text-gray-400">|</span>
                    <span>{segAcft?.name}</span>
                    <span className="capitalize text-gray-500">{seg.cabinClass.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Penalty breakdown */}
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Penalty Breakdown</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {(Object.keys(penalties) as PenaltyCategory[]).map(key => {
              const val = penalties[key];
              if (val === 0) return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500">{penaltyLabels[key]}</span>
                  <span className="text-gray-400">$0</span>
                </div>
              );
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-700">{penaltyLabels[key]}</span>
                  <span className={val > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {formatDollar(val)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200">
            <span>Total Penalty</span>
            <span className={totalPenalty > 0 ? 'text-red-600' : totalPenalty < 0 ? 'text-green-600' : ''}>
              {formatDollar(totalPenalty)}
            </span>
          </div>

          {/* Jet lag detail */}
          {jetLagDetail && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Jet Lag Analysis</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Timezones crossed</span>
                  <span>{Math.abs(jetLagDetail.timezoneDelta)}h {jetLagDetail.direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Arrival time score</span>
                  <span>{jetLagDetail.arrivalTimeScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Preferred aircraft</span>
                  <span>{jetLagDetail.aircraftBonus ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Red-eye penalty</span>
                  <span>{jetLagDetail.redEyePenalty ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

function JetLagBadge({ score }: { score: number }) {
  let color = 'bg-red-100 text-red-700';
  if (score >= 80) color = 'bg-green-100 text-green-700';
  else if (score >= 60) color = 'bg-yellow-100 text-yellow-700';
  else if (score >= 40) color = 'bg-orange-100 text-orange-700';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      Jet Lag: {score}/100
    </span>
  );
}
