# FYFProject (Find Your Funny)

A full-stack web app for discovering, creating, and signing up for live comedy events (stand-up, improv, open mic) near you — with a humor-profile recommendation system that matches users to similar comedy fans and surfaces events whose audience taste matches theirs.

- **Backend**: Flask + SQLAlchemy (PostgreSQL) + JWT auth + CORS
- **Location**: Geocoding + Haversine distance + nearby-event matching
- **Recommendations**: Comedian-swipe onboarding → per-user humor vector (23 trait dimensions) → cosine-similarity match across users and event audiences
- **Frontend**: React 18 + Vite + React Router 7 + Tailwind CSS + Axios

The backend serves the API under `/api` and can also serve the built frontend from the same Flask process for a single-origin deployment.

## Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+ (20 fine)
- **npm**: bundled with Node
- **PostgreSQL**: a reachable database (local Postgres, Supabase, Neon, etc.)
- **Geocoder API key**: required at backend startup (`GEOCODER_API_KEY` env var)

## Quick start (development)

Run the backend and frontend in two terminals. The Vite dev server proxies `/api` and `/geo` to the backend.

### 1) Backend

From [Backend/](Backend/):

```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Create a `.env` file in [Backend/](Backend/) with at least:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fyf
GEOCODER_API_KEY=your_geocoder_key
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me-too
```

Then start the server:

```bash
python main.py
```

Backend runs on `http://127.0.0.1:5000` and creates all tables on first run.

### 2) Frontend

From [frontend/](frontend/):

```bash
npm install
npm run dev
```

Vite dev server runs on `http://127.0.0.1:5173` and proxies API calls to `http://localhost:5000` (override with `VITE_BACKEND_URL`).

## Production build (single origin)

Flask is configured to serve the frontend from [frontend/build/](frontend/build/) (see [Backend/config.py](Backend/config.py)). Vite's default output is `dist/`, so build with an override:

```bash
cd frontend
npm install
npx vite build --outDir build
```

Then run the backend (from [Backend/](Backend/)):

```bash
python main.py
```

Open `http://127.0.0.1:5000` — Flask serves both the API and the static frontend.

## Project structure

```text
FYFProject-main/
  Backend/
    main.py                       Flask app entry + auth/users/events/geo/feed routes
    config.py                     App config (DB URI, JWT, CORS, static dir)
    models.py                     SQLAlchemy models + HUMOR_CATEGORIES (23 traits)
    blacklist.py                  JWT revocation set
    requirements.txt
    Location/                     Geocoding + distance + proximity matching
      geocoder.py
      distance_service.py
      matching_service.py
    Recommend/                    Humor-profile recommendation system
      onboarding_routes.py        /api/onboarding/* — comedian swipe set + submit
      recommendation_routes.py    /api/recommend/*  — user similarity + profile updates
      event_humor_routes.py       /api/events/recommendations/me
      humor_profile_service.py    quiz vector, social blending, recompute
      comedian_service.py         comedian trait vector helpers
      event_humor_service.py      event audience scoring
      similarity.py               cosine similarity
    instance/                     Flask instance dir
  frontend/
    index.html
    vite.config.js                Dev proxy: /api, /geo → backend
    src/
      main.jsx
      App.jsx
      pages/                      Home, Events, EventDetail, CreateEvent, EditEvent,
                                  NearMe, Feed, Onboarding, Login, Register, UserProfile
      components/                 Navbar, Footer, EventCard, CategoryTabs,
                                  ComedianPicker, Protected
      context/AuthContext.jsx
      lib/api.js                  Axios client
  tests/                          Pytest suite
  test_reports/                   Test output (pytest XML, iteration JSON)
  memory/                         Project docs (PRD, etc.)
```

## Environment variables

**Backend** (`Backend/.env`):
- `DATABASE_URL` — **required**, SQLAlchemy URI (e.g. `postgresql://user:pw@host:5432/db`)
- `GEOCODER_API_KEY` — **required**, used by [Location/geocoder.py](Backend/Location/geocoder.py)
- `SECRET_KEY` — Flask secret (defaults to a dev placeholder)
- `JWT_SECRET_KEY` — JWT signing secret (defaults to a dev placeholder)
- `PORT` — Flask port (default `5000`)

**Frontend** (optional):
- `VITE_BACKEND_URL` — used by the Vite dev proxy for `/api` and `/geo` (default `http://localhost:5000`)

## API overview

All routes are JSON. Auth uses `Authorization: Bearer <token>` with tokens issued at login/register.

### Auth (`/api/auth`)
- `POST /api/auth/register` — create account, returns `{ token, user }`
- `POST /api/auth/login` — returns `{ token, user }`
- `GET  /api/auth/me` (JWT) — current user
- `POST /api/auth/logout` (JWT) — revokes the current token

### Users & follows
- `GET  /api/users/search?q=&role=&limit=` (JWT) — search users by name/username
- `GET  /api/users/<id>` — public profile
- `GET  /api/users/<id>/followers` — list followers
- `GET  /api/users/<id>/following` — list users they follow
- `GET  /api/users/<id>/events/created` — events organized by user
- `GET  /api/users/<id>/events/signedup` — events the user signed up for
- `GET  /api/users/<id>/follow-status` (JWT) — `{ following: bool }`
- `POST /api/follow` (JWT) — body `{ targetUserId }` (also recomputes humor profile)
- `DELETE /api/follow` (JWT) — body `{ targetUserId }`

### Events
- `GET  /api/events?q=&city=&category=` — list/filter events
- `POST /api/events` (JWT) — create event (auto-geocodes venue)
- `GET  /api/events/<id>` — event detail
- `PUT  /api/events/<id>` (JWT, organizer-only) — update
- `DELETE /api/events/<id>` (JWT, organizer-only) — delete
- `GET  /api/events/<id>/signups` (JWT optional) — signup list (organizer sees extra fields)
- `GET  /api/events/<id>/my-signup` (JWT) — `{ signedUp: bool }`
- `POST /api/events/<id>/signup` (JWT) — sign up (also promotes user to COMIC role)
- `DELETE /api/events/<id>/signup` (JWT) — cancel signup
- `GET  /api/events/nearby-public?lat=&lon=&radius_km=&limit=` — public proximity search
- `GET  /api/feed` (JWT) — events created by, or signed up for, users you follow

### Geocoding (`/api/geo`)
- `POST /api/geo/forward` — body `{ address }` → `{ latitude, longitude }`
- `POST /api/geo/reverse` — body `{ latitude, longitude }` → `{ city, state, country, zipCode }`

### Onboarding (`/api/onboarding`)
Comedian-swipe quiz that seeds the user's humor profile.
- `GET  /api/onboarding/status` (JWT) — `{ hasProfile, skipped }`
- `GET  /api/onboarding/swipe-set` (JWT) — 20 random comedians with trait vectors
- `POST /api/onboarding/submit` (JWT) — body `{ likes: [id], passes: [id], skipped }` → builds quiz vector

### Recommendations (`/api/recommend`)
- `GET  /api/recommend/users?limit=` (JWT) — users ranked by cosine similarity, excluding ones you already follow
- `POST /api/recommend/profile/quiz` (JWT) — body `{ quiz_vector }` — save a quiz vector directly
- `POST /api/recommend/profile/recompute` (JWT) — re-blend quiz vector with following's vectors (60/40)
- `GET  /api/events/recommendations/me` (JWT) — per-event audience-match scores

### Humor model
The humor profile is a 23-dimensional vector over [HUMOR_CATEGORIES](Backend/models.py): `aggressive, alternative, anecdotal, anti_humor, dark, blue, character, cringe, improv, insult, musical, observational, one_liner, physical, prank, prop, screwball, shock, sketch, surreal, topical, ventriloquism, wit`. The `final_vector` mixes the user's onboarding `quiz_vector` (60%) with the average `final_vector` of users they follow (40%), and is recomputed on follow/unfollow.

## Tests

Pytest suite lives in [tests/](tests/). Run from the project root:

```bash
pytest
```

Reports are written to [test_reports/](test_reports/) (`pytest_results.xml` and per-iteration JSON).

## Troubleshooting

- **Backend won't start: `KeyError: 'DATABASE_URL'` / `'GEOCODER_API_KEY'`** — both are required at startup; add them to `Backend/.env`.
- **Frontend loads but API 404s** — make sure the backend is running on port 5000 (or set `VITE_BACKEND_URL`).
- **Single-origin serve shows blank page** — Vite outputs to `dist/` by default; build with `--outDir build` so Flask can find it (see Production build above).
- **Port already in use** — start the backend with `PORT=5001 python main.py` and update `VITE_BACKEND_URL` accordingly.
- **Recommendations come back empty** — the user needs a humor profile; complete `/api/onboarding/submit` (or call `/api/recommend/profile/quiz` directly) first.
- **Geocoding errors** — registration falls back to lat/lon `0.0` if geocoding fails; event creation falls back to city-level geocoding before failing.

## Notes

- This is a development setup. Don't use the Flask dev server in production — front it with a WSGI server (gunicorn, waitress) and a real frontend host.
- Default secrets in [Backend/config.py](Backend/config.py) are placeholders; set `SECRET_KEY` and `JWT_SECRET_KEY` for any non-local deployment.
