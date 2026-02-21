# Travel Optimizer — Product Spec

## Overview

A web-based application that helps users plan flights based on a set of trade-off preferences. An AI-powered travel agent that ranks flight options by converting all preferences into a unified dollar-equivalent "cost" — so every trade-off (airport choice, airline, seat class, jet lag impact) is weighed against price in a single score.

Eventually expands to hotels, car rentals, etc. V1 is flights only.

---

## Core Concept: Dollar-Weighted Trade-offs

Every user preference is expressed as a dollar cost added to the base ticket price. This creates a single "effective cost" for ranking flights. Examples:

- Departing from JFK instead of Newark: **+$100 and +2 hours** per leg
- Non-preferred airline: user-configurable penalty (e.g., +$50)
- Non-preferred aircraft type: user-configurable penalty
- Red-eye without business class: penalty
- Long layover: penalty per hour

The app presents flights ranked by **lowest effective cost** (ticket price + all preference penalties).

---

## User Preferences (Persistent Profile)

Users set these once and can update anytime. Each preference should have a configurable dollar penalty or priority weight.

| Preference | Details |
|---|---|
| **Home airport** | Primary (e.g., EWR) and alternates with cost/time penalties (e.g., JFK = +$100, +2hrs per leg) |
| **Airline preference** | Tiered: preferred (e.g., United/Star Alliance), acceptable (e.g., American/OneWorld), avoid |
| **Class of service** | Economy, Premium Economy, Business, First. Rules like "Business if overnight" |
| **Seating** | Window, aisle, middle; exit row preference |
| **Stops** | Nonstop preferred, 1-stop acceptable, penalty per connection |
| **Aircraft type** | Prefer specific types (e.g., Airbus A350 for better cabin pressure/air filtration → less jet lag) |
| **Departure time** | General preference (e.g., no early departures) with timezone-aware exceptions (see Jet Lag) |
| **Price sensitivity** | Max budget, or a soft ceiling with diminishing returns |

---

## Trip Parameters (Per Search)

| Field | Details |
|---|---|
| Departure city | City or airport code |
| Arrival city | City or airport code |
| Departure date | Date picker |
| Return date | Date picker (optional for one-way) |
| Number of travelers | Integer |
| Trip type | Round-trip or one-way |

---

## Scoring Engine

For each candidate flight itinerary, compute:

```
effective_cost = ticket_price + Σ(preference_penalties)
```

### Penalty Categories

1. **Airport penalty** — Added per leg if using non-preferred airport. Includes both dollar cost and time cost (convert time to dollars at a user-set rate, e.g., $50/hr).

2. **Airline penalty** — $0 for preferred tier, configurable penalty for secondary tier, higher for non-preferred.

3. **Class penalty** — Based on rules (e.g., overnight flight in economy when user prefers business on overnights).

4. **Stop/layover penalty** — Per stop, plus per hour of layover beyond a threshold.

5. **Aircraft penalty** — Penalty for non-preferred aircraft types. Bonus (negative penalty) for specifically preferred types like A350.

6. **Departure time penalty** — Penalty for early departures, with timezone-aware exception (see below).

7. **Total travel time** — Convert excess travel time (vs. the shortest available option) to a dollar penalty.

---

## Jet Lag Optimization Rules

These rules should be applied especially for flights crossing 3+ timezones:

1. **Schedule around destination timezone** — Departure time should be evaluated relative to what time it will be at the destination. Early departures are acceptable if arriving at a reasonable destination-local time.

2. **Prefer A350 (or similar)** — Aircraft with better cabin pressure (lower effective altitude), higher humidity, and better air filtration reduce jet lag. Apply a bonus/penalty accordingly.

3. **Overnight flight class rule** — If the flight is overnight (red-eye), strongly prefer business/first class for sleep quality. Economy on a red-eye gets a significant penalty.

4. **Arrival time optimization** — Prefer arriving in the late afternoon/early evening local time when heading east; prefer arriving in the morning when heading west.

5. **Connection timing** — Avoid connections that disrupt sleep windows relative to destination timezone.

---

## Results Display

Present a **rank-ordered list** of flight options showing:

- Flight details (airline, flight number, aircraft type, times, duration)
- Base ticket price
- Effective cost (with breakdown of penalties on expand/hover)
- Jet lag score or rating
- Visual indicators for preference matches (✓ preferred airline, ✓ nonstop, ✓ A350, etc.)

Users should be able to:
- Sort by effective cost, price, duration, or departure time
- Filter results post-search
- Click to see penalty breakdown for any option
- Click through to book (deep link to airline or booking site)

---

## Open Design Decisions

These should be resolved during development:

- **Flight data source**: Amadeus API, Google Flights (via SerpApi), Skyscanner API, or mock data for MVP?
- **Tech stack**: Framework, database, hosting — defer to available tools
- **Authentication**: User accounts with saved preferences vs. local storage for MVP?
- **Dollar-per-hour rate**: Should users set a personal $/hr value for converting time penalties to dollars? (Suggested default: $50/hr)
- **Default penalty values**: Ship with sensible defaults that users can override

---

## Customer Use Case (Reference)

> User lives in New York City, planning a 5-day trip to San Francisco. User logs onto the website, enters personal preferences (window seat, business class, no stops, etc.). App delivers a rank-ordered list of suitable flight plans, scored by effective cost including all preference trade-offs.

---

## Ted's Default Preference Profile (For Testing)

Use this as a seed/test profile:

- **Home airport**: EWR (Newark). JFK = +$100 +2hrs per leg. LGA = avoid.
- **Airlines**: Preferred = United / Star Alliance. Secondary = American / OneWorld.
- **Class**: Business if overnight. Otherwise flexible.
- **Departure time**: No very early flights UNLESS destination timezone is earlier than departure timezone — then schedule around destination time.
- **Aircraft**: Prefer Airbus A350 (cabin pressure, air filtration, jet lag reduction).
- **Priority**: Total travel time first, then price.

---

## Future Roadmap (Post-V1)

- Hotel search and booking with similar preference-based scoring
- Car rental integration
- Multi-city/complex itinerary support
- Calendar integration (suggest trips based on open dates)
- Loyalty program point valuation (compare cash vs. miles pricing)
- Collaborative trip planning (multiple travelers with different preferences)
