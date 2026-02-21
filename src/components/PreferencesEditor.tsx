import { useState } from 'react';
import type { Preferences, AirportPreference, AirlineTier, CabinClass, Alliance } from '../types';
import { airlines } from '../data/airlines';
import { airports } from '../data/airports';

interface Props {
  preferences: Preferences;
  onChange: (prefs: Preferences) => void;
  onLoadDefaults: () => void;
}

type Tab = 'airports' | 'airlines' | 'cabin' | 'stops' | 'aircraft' | 'timing' | 'general';

const tabs: { key: Tab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'cabin', label: 'Cabin' },
  { key: 'timing', label: 'Timing' },
  { key: 'airports', label: 'Airports' },
  { key: 'stops', label: 'Stops' },
  { key: 'airlines', label: 'Airlines' },
  { key: 'aircraft', label: 'Aircraft' },
];

function DollarInput({ label, value, onChange, tooltip }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-sm text-gray-700" title={tooltip}>{label}</label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-400">$</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
        />
      </div>
    </div>
  );
}

export default function PreferencesEditor({ preferences, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const prefs = preferences;
  const update = (partial: Partial<Preferences>) => onChange({ ...prefs, ...partial });

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'airports' && <AirportsTab prefs={prefs} update={update} />}
        {activeTab === 'airlines' && <AirlinesTab prefs={prefs} update={update} />}
        {activeTab === 'cabin' && <CabinTab prefs={prefs} update={update} />}
        {activeTab === 'stops' && <StopsTab prefs={prefs} update={update} />}
        {activeTab === 'aircraft' && <AircraftTab prefs={prefs} update={update} />}
        {activeTab === 'timing' && <TimingTab prefs={prefs} update={update} />}
        {activeTab === 'general' && <GeneralTab prefs={prefs} update={update} />}
      </div>
    </div>
  );
}

function AirportsTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  const addAlternate = () => {
    update({ alternateAirports: [...prefs.alternateAirports, { code: '', dollarPenalty: 0, timePenaltyMinutes: 0 }] });
  };
  const updateAlt = (i: number, changes: Partial<AirportPreference>) => {
    const next = [...prefs.alternateAirports];
    next[i] = { ...next[i], ...changes };
    update({ alternateAirports: next });
  };
  const removeAlt = (i: number) => {
    update({ alternateAirports: prefs.alternateAirports.filter((_, j) => j !== i) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Home Airport</label>
        <select
          value={prefs.homeAirport}
          onChange={e => update({ homeAirport: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {Object.values(airports).map(a => (
            <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Alternate Airports</label>
        {prefs.alternateAirports.map((alt, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <select
              value={alt.code}
              onChange={e => updateAlt(i, { code: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Select...</option>
              {Object.values(airports).map(a => (
                <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
              ))}
            </select>
            <span className="text-xs text-gray-500">+$</span>
            <input
              type="number"
              value={alt.dollarPenalty}
              onChange={e => updateAlt(i, { dollarPenalty: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-xs text-gray-500">+</span>
            <input
              type="number"
              value={alt.timePenaltyMinutes}
              onChange={e => updateAlt(i, { timePenaltyMinutes: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-xs text-gray-500">min</span>
            <button onClick={() => removeAlt(i)} className="text-red-400 hover:text-red-600 text-sm">x</button>
          </div>
        ))}
        <button onClick={addAlternate} className="text-xs text-blue-600 hover:underline mt-1">+ Add</button>
      </div>
    </div>
  );
}

function AirlinesTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  const setTier = (code: string, tier: AirlineTier) => {
    const existing = prefs.airlines.filter(a => a.code !== code);
    update({ airlines: [...existing, { code, tier }] });
  };
  const getTier = (code: string): AirlineTier | 'none' => {
    const found = prefs.airlines.find(a => a.code === code);
    return found?.tier || 'none';
  };

  const alliances: Alliance[] = ['Star Alliance', 'Oneworld', 'SkyTeam', 'None'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <DollarInput label="Acceptable airline penalty" value={prefs.acceptableAirlinePenalty}
          onChange={v => update({ acceptableAirlinePenalty: v })} />
        <DollarInput label="Avoid airline penalty" value={prefs.avoidAirlinePenalty}
          onChange={v => update({ avoidAirlinePenalty: v })} />
        <DollarInput label="Unlisted airline penalty" value={prefs.nonPreferredAirlinePenalty}
          onChange={v => update({ nonPreferredAirlinePenalty: v })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Alliances</label>
        <div className="flex gap-2">
          {alliances.filter(a => a !== 'None').map(alliance => (
            <label key={alliance} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.preferredAlliances.includes(alliance)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...prefs.preferredAlliances, alliance]
                    : prefs.preferredAlliances.filter(a => a !== alliance);
                  update({ preferredAlliances: next });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{alliance}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Airline Tiers</label>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {Object.values(airlines).map(airline => (
            <div key={airline.code} className="flex items-center gap-3 text-sm">
              <span className="w-40 truncate">{airline.name}</span>
              <span className="text-xs text-gray-400 w-24">{airline.alliance}</span>
              {(['preferred', 'acceptable', 'avoid', 'none'] as const).map(tier => (
                <label key={tier} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`airline-${airline.code}`}
                    checked={getTier(airline.code) === tier}
                    onChange={() => {
                      if (tier === 'none') {
                        update({ airlines: prefs.airlines.filter(a => a.code !== airline.code) });
                      } else {
                        setTier(airline.code, tier);
                      }
                    }}
                    className="border-gray-300"
                  />
                  <span className="text-xs text-gray-600 capitalize">{tier}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CabinTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  const cabins: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cabin</label>
        <select
          value={prefs.preferredCabin}
          onChange={e => update({ preferredCabin: e.target.value as CabinClass })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {cabins.map(c => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={prefs.businessIfOvernight}
          onChange={e => update({ businessIfOvernight: e.target.checked })}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Prefer business class for overnight flights</span>
      </label>
      <DollarInput label="Economy on overnight penalty" value={prefs.overnightEconomyPenalty}
        onChange={v => update({ overnightEconomyPenalty: v })} />
    </div>
  );
}

function StopsTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  return (
    <div className="space-y-2">
      <DollarInput label="Nonstop bonus (negative = reward)" value={prefs.nonstopBonus}
        onChange={v => update({ nonstopBonus: v })} />
      <DollarInput label="Penalty per stop" value={prefs.perStopPenalty}
        onChange={v => update({ perStopPenalty: v })} />
      <DollarInput label="Penalty per layover hour" value={prefs.perLayoverHourPenalty}
        onChange={v => update({ perLayoverHourPenalty: v })} />
      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-gray-700">Layover threshold (min before penalty)</label>
        <input
          type="number"
          value={prefs.layoverThresholdMinutes}
          onChange={e => update({ layoverThresholdMinutes: parseInt(e.target.value) || 0 })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
        />
      </div>
    </div>
  );
}

function AircraftTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  const allAircraft = ['A350', 'A380', 'B787', 'A330', 'B777', 'B767', 'B757', 'A321', 'A320', 'B738', 'B739', 'E175', 'CRJ9'];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Aircraft</label>
        <div className="flex flex-wrap gap-2">
          {allAircraft.map(code => (
            <label key={code} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.preferredAircraft.includes(code)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...prefs.preferredAircraft, code]
                    : prefs.preferredAircraft.filter(c => c !== code);
                  update({ preferredAircraft: next });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{code}</span>
            </label>
          ))}
        </div>
      </div>
      <DollarInput label="Preferred aircraft bonus (negative)" value={prefs.aircraftBonus}
        onChange={v => update({ aircraftBonus: v })} />
      <DollarInput label="Non-preferred aircraft penalty" value={prefs.nonPreferredAircraftPenalty}
        onChange={v => update({ nonPreferredAircraftPenalty: v })} />
    </div>
  );
}

function TimingTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  return (
    <div className="space-y-2">
      <DollarInput label="Early departure penalty" value={prefs.earlyDeparturePenalty}
        onChange={v => update({ earlyDeparturePenalty: v })} />
      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-gray-700">Early departure threshold (hour, 0-23)</label>
        <input
          type="number"
          min={0} max={23}
          value={prefs.earlyDepartureThreshold}
          onChange={e => update({ earlyDepartureThreshold: parseInt(e.target.value) || 0 })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
        />
      </div>
      <DollarInput label="Late departure penalty" value={prefs.lateDeparturePenalty}
        onChange={v => update({ lateDeparturePenalty: v })} />
      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-gray-700">Late departure threshold (hour, 0-23)</label>
        <input
          type="number"
          min={0} max={23}
          value={prefs.lateDepartureThreshold}
          onChange={e => update({ lateDepartureThreshold: parseInt(e.target.value) || 0 })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
        />
      </div>
    </div>
  );
}

function GeneralTab({ prefs, update }: { prefs: Preferences; update: (p: Partial<Preferences>) => void }) {
  return (
    <div className="space-y-2">
      <DollarInput label="Dollar per hour (time → money conversion)" value={prefs.dollarPerHour}
        onChange={v => update({ dollarPerHour: v })} />
      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-gray-700">Max budget (empty = no limit)</label>
        <input
          type="number"
          value={prefs.maxBudget ?? ''}
          onChange={e => update({ maxBudget: e.target.value ? parseInt(e.target.value) : null })}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
          placeholder="No limit"
        />
      </div>
    </div>
  );
}
