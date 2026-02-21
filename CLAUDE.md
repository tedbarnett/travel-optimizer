# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

V1 MVP — functional with mock flight data. Deployed to Cloudflare Pages.

- **Live URL**: https://travel-optimizer-99t.pages.dev
- **Repo**: https://github.com/tedbarnett/travel-optimizer

## What This Project Is

A web app that ranks flight options by converting all user preferences (airport, airline, seat class, jet lag impact, layover time, aircraft type) into dollar-equivalent penalties added to the ticket price. Flights are ranked by **effective cost** = ticket price + sum of all preference penalties.

V1 is flights only. Hotels, car rentals, and multi-city itineraries are post-V1.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build**: Vite 7
- **Testing**: Vitest (21 tests in `src/engine/__tests__/scorer.test.ts`)
- **Hosting**: Cloudflare Pages (deployed via `wrangler pages deploy dist`)
- **Data**: Mock flight data generated in `src/data/mockFlights.ts`
- **Preferences**: Persisted in localStorage via `src/hooks/usePreferences.ts`
- **Feedback**: Stored in localStorage

## Project Structure

```
src/
  App.tsx                    # Main app layout, dialogs (About, Feedback), hamburger menu
  main.tsx                   # Entry point
  index.css                  # Sky gradient background, frosted glass panel styles
  types/index.ts             # All TypeScript types
  components/
    SearchForm.tsx            # Airport autocomplete, date pickers, trip type
    PreferencesEditor.tsx     # Tabbed preferences (General, Cabin, Timing, Airports, Stops, Airlines, Aircraft)
    FlightCard.tsx            # Individual flight result with penalty breakdown
    ResultsList.tsx           # Flight results list
    SortBar.tsx               # Sort by effective cost, price, duration, departure
    FilterPanel.tsx           # Nonstop, max price, airline filters
  data/
    defaults.ts              # Default preference values (business class, EWR home, etc.)
    airports.ts              # Airport database with search
    airlines.ts              # Airline database with alliance info
    aircraft.ts              # Aircraft type database
    mockFlights.ts           # Mock flight generator
  engine/
    scorer.ts                # Main scoring: effective_cost = price + Σ(penalties)
    jetlag.ts                # Jet lag rules for 3+ timezone crossings
    timezone.ts              # Timezone utilities
    penalties/               # One file per penalty category
      airport.ts, airline.ts, cabinClass.ts, stops.ts,
      aircraft.ts, departureTime.ts, travelTime.ts
    __tests__/
      scorer.test.ts         # 21 unit tests
  hooks/
    usePreferences.ts        # localStorage persistence for user preferences
```

## Key Architecture Concepts

### Scoring Engine (Core Logic)
The central algorithm in `src/engine/scorer.ts` computes `effective_cost = ticket_price + Σ(preference_penalties)` across seven penalty categories. Each penalty module in `src/engine/penalties/` converts a qualitative preference into a dollar amount.

### Jet Lag Optimization
Flights crossing 3+ timezones trigger special rules in `src/engine/jetlag.ts`: departure/arrival time evaluated relative to destination timezone, A350-class aircraft get bonuses, red-eye flights in economy get significant penalties, and connection timing is checked against destination sleep windows.

### User Preference Profile
Preferences stored in localStorage with configurable dollar penalties. Defaults defined in `src/data/defaults.ts`: EWR home airport, United/Star Alliance preferred, business class preferred, A350 aircraft preference.

## Commands

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # TypeScript check + Vite production build
npm run test      # Run Vitest tests
npm run preview   # Preview production build locally
```

## Deployment

```bash
npm run build && wrangler pages deploy dist --project-name=travel-optimizer
```

## UI Notes

- Sky-blue to pink gradient background (morning sky theme)
- Frosted glass panels for preferences and search
- Search form has slightly grey background so white popups stand out
- Hamburger menu (top-right) with About, Feedback, and Login (grayed out)
- Collapsible preferences accordion above the search form
- Footer: (c)2026 Debbi Gibbs
