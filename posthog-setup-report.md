<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project.

**Changes made:**

- **`instrumentation-client.ts`** (new) — Initializes PostHog on the client side using Next.js 15.3+ instrumentation. Enables session replay, error tracking via `capture_exceptions`, and routes all PostHog traffic through the local `/ingest` reverse proxy.
- **`next.config.ts`** — Added PostHog reverse proxy rewrites (`/ingest/static/*` and `/ingest/*`) and `skipTrailingSlashRedirect: true` so analytics requests are sent through the Next.js server rather than directly to PostHog, improving ad-blocker resilience.
- **`.env.local`** — Created with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables. Listed in `.gitignore`.
- **`components/ExploreBtn.tsx`** — Added `posthog.capture('explore_events_clicked')` in the existing click handler to track homepage CTA engagement.
- **`components/EventCard.tsx`** — Converted to a client component (`'use client'`) and added `posthog.capture('event_card_clicked')` with rich properties (`event_title`, `event_slug`, `event_date`, `event_location`) to track which events users click through to.
- **`components/Navbar.tsx`** — Converted to a client component (`'use client'`) and added `posthog.capture('nav_link_clicked')` with a `label` property on each nav link.

| Event | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the 'Explore Events' CTA button on the homepage hero | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on a featured event card to view event details | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link in the top navbar | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/385325/dashboard/1477174
- **Explore Events CTA clicks over time:** https://us.posthog.com/project/385325/insights/RpXyZn4z
- **Event card clicks over time:** https://us.posthog.com/project/385325/insights/0YVeVta7
- **Homepage to event detail conversion funnel:** https://us.posthog.com/project/385325/insights/3OCN8cTh
- **Most clicked events by title:** https://us.posthog.com/project/385325/insights/ETvXxoa7
- **Nav link clicks by destination:** https://us.posthog.com/project/385325/insights/wi31muGu

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
