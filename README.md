# Travel Optimizer

**The Best Flight For You**

A web app that ranks flight options by converting all your preferences into dollar-equivalent penalties added to the ticket price. Flights are ranked by **effective cost** — ticket price + sum of all preference penalties — so every trade-off is weighed against price in a single score.

Live at: [travel-optimizer-99t.pages.dev](https://travel-optimizer-99t.pages.dev)

## How It Works

1. **Set your preferences** — Open the Preferences panel and configure dollar penalties across seven categories: general settings, cabin class, timing, airports, stops, airlines, and aircraft type.
2. **Search for flights** — Enter origin, destination, and travel date.
3. **Compare results** — Flights are ranked by effective cost. Expand any flight card to see the full penalty breakdown showing exactly why each flight scored the way it did.

### Scoring Engine

For each flight, the app computes:

```
effective_cost = ticket_price + Σ(preference_penalties)
```

Seven penalty categories:
- **Airport** — Penalty for using non-preferred airports (dollar + time cost)
- **Airline** — Tiered: preferred ($0), acceptable, avoid, unlisted
- **Cabin class** — Based on rules (e.g., economy on an overnight = penalty)
- **Stops/layovers** — Per stop, plus per hour beyond a threshold
- **Aircraft** — Bonus for preferred types (e.g., A350), penalty for others
- **Departure time** — Early/late departure penalties
- **Travel time** — Excess time converted to dollars at a configurable $/hr rate

### Jet Lag Optimization

Flights crossing 3+ timezones trigger special rules:
- Departure/arrival times evaluated relative to destination timezone
- A350-class aircraft get bonuses (better cabin pressure = less jet lag)
- Red-eye flights in economy get significant penalties
- Connection timing checked against destination sleep windows

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build**: Vite 7
- **Testing**: Vitest (21 unit tests)
- **Hosting**: Cloudflare Pages
- **Data**: Mock flight data (V1)
- **Persistence**: localStorage for preferences and feedback

## Development

```bash
npm install
npm run dev       # Start dev server at localhost:5173
npm run build     # Production build
npm run test      # Run tests
npm run preview   # Preview production build
```

## Deployment

```bash
npm run build
wrangler pages deploy dist --project-name=travel-optimizer
```

## Future Roadmap

- Real flight data API integration (Amadeus, SerpApi, or Skyscanner)
- User accounts and authentication
- Hotel search with preference-based scoring
- Car rental integration
- Multi-city itinerary support
- Loyalty program point valuation

## License

(c) 2026 Debbi Gibbs
