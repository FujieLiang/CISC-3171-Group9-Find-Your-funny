# Find Your Funny — PRD

## Original Problem Statement
Build me a frontend for the attached backend files. The website will be a comedy event listing application called 'Find Your Funny' that will connect users to local events in their area and tell them where they can go to watch standup comedy. The platform is built to make open mic comedy more accessible to the masses but also helps users find stand up and improv events around the users location whether that be designated by the user or instantly assumed by the program. Users with created accounts will be able to make and list new events on the platform that will be openly available for signup by other created accounts.

## User Choices (2026-02)
- Backend: port Flask reference to FastAPI + MongoDB
- Geocoding: geocode.maps.co using the key from the attached geocoder.py
- Location detection: browser geolocation + reverse geocode
- Visual vibe: bold retro/vintage stand-up comedy club (brick, spotlight, marquee)
- Filters & category tabs added

## Architecture
- **Backend**: FastAPI + Motor (MongoDB). JWT (PyJWT) Bearer tokens. bcrypt password hashing. Token blacklist collection for logout. Haversine for distance. Synchronous `requests` to geocode.maps.co.
- **Frontend**: React 19 + Tailwind + Shadcn + sonner toasts + react-router-dom 7. AuthContext stores user; Bearer token in localStorage.
- **Collections**: `users`, `events`, `venues`, `signups`, `token_blacklist`. All IDs are string UUIDs; `_id` excluded from responses.

## User Personas
1. **Audience member** — wants to find nearby stand-up/improv tonight, RSVP fast.
2. **Comic** — signs up for open mic lists; auto-promoted to `role=2 (COMIC)` after first open-mic signup.
3. **Organizer** — creates events, views/manages signup list, edits or deletes their shows.

## Core Requirements (static)
- Location-aware event discovery (user-supplied OR browser-detected)
- Categories: STANDUP, IMPROV, OPEN_MIC
- Account CRUD with address (for lat/lon matching)
- Event CRUD scoped to organizer
- Signup flow with unique (event, user) constraint, cancelation, and organizer signup list

## Implemented (2026-02)
- Auth: register, login, logout (blacklist), me
- Events: CRUD with category + city + search filters, nearby (by user or by coords)
- Signups: sign up, cancel, my-signup check, organizer signup list
- Geo: reverse geocode endpoint
- Profile dashboard with created & signed-up tabs
- Retro/vintage UI: Abril Fatface headings, IBM Plex body/mono, oxblood/cream/marigold palette, ticket-stub cards w/ neobrutalist shadows, marquee bulb strip, spotlight gradients
- Full data-testid coverage; protected routes; toast feedback

## Tested (2026-02)
- Backend pytest suite at `/app/backend/tests/test_backend.py` — 27/27 pass
- Frontend Playwright flows — all critical paths pass (register → login → create → signup → cancel → organizer view → profile)

## P1 / Backlog
- Switch `requests` → `httpx.AsyncClient` in geocode helpers (non-blocking)
- Rate limit on `/auth/login` (5 fails / 15 min)
- Event edit page UI (route `/events/:id/edit` not yet wired; API is ready)
- Add an `events.start_time` index for the sort query
- Event cover images (upload + object storage)
- Map view (Leaflet) alongside list view
- Email reminders (24h before event)

## P2
- Social share (copy link, tweet intent)
- Organizer dashboard analytics (signup over time)
- "Attending tonight" public feed
