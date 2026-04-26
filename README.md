# FYFProject (Find Your Funny)

A full-stack web app for discovering, creating, and signing up for live comedy events (stand-up, improv, open mic) near you.

- **Backend**: Flask + SQLAlchemy (SQLite) + JWT auth + CORS, with a Location module for geocoding and proximity search
- **Frontend**: React 18 + Vite + React Router 7 + Tailwind CSS + Axios

The backend serves the API under `/api` (and `/location`) and can also serve the built frontend from the same Flask process for a single-origin deployment.

## Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+ (20 fine)
- **npm**: bundled with Node

## Quick start (development)

Run the backend and frontend in two terminals. The Vite dev server proxies `/api` and `/geo` to the backend.

### 1) Backend

From `Backend/`:

```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python main.py
```

Backend runs on `http://127.0.0.1:5000` and creates `Backend/instance/mydatabase.db` on first run.

### 2) Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Vite dev server runs on `http://127.0.0.1:5173` and proxies API calls to `http://localhost:5000` (override with `VITE_BACKEND_URL`).

## Production build (single origin)

Flask is configured to serve the frontend from `frontend/build/` (see [Backend/config.py](Backend/config.py)). Vite's default output is `dist/`, so build with an override:

```bash
cd frontend
npm install
npx vite build --outDir build
```

Then run the backend (from `Backend/`):

```bash
python main.py
```

Open `http://127.0.0.1:5000` — Flask serves both the API and the static frontend.

## Project structure

```text
FYFProject-main/
  Backend/
    main.py                 Flask routes (auth, users, events, geo)
    config.py               App config + DB + CORS setup
    models.py               SQLAlchemy models (User, Events, Venue, signup_List, ...)
    blacklist.py            JWT revocation set
    requirements.txt
    Location/               Geocoding + distance + matching services
      routes.py             /location/* blueprint
      geocoder.py
      distance_service.py
      matching_service.py
    instance/mydatabase.db  SQLite DB (auto-created)
  frontend/
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      pages/                Home, Events, EventDetail, CreateEvent,
                            NearMe, Login, Register, UserProfile
      components/           Navbar, Footer, EventCard, CategoryTabs, Protected
      context/AuthContext.jsx
      lib/api.js            Axios client
  tests/                    Pytest suite
  test_reports/             Test output (pytest XML, iteration JSON)
  memory/                   Project docs (PRD, etc.)
```

## Environment variables

**Backend** (all optional):
- `PORT` — Flask port (default `5000`)
- `SECRET_KEY` — Flask secret (default is dev-only)
- `JWT_SECRET_KEY` — JWT signing secret (default is dev-only)

**Frontend** (optional):
- `VITE_BACKEND_URL` — used by the Vite dev proxy for `/api` and `/geo` (default `http://localhost:5000`)

## API overview

All routes are JSON. Auth uses `Authorization: Bearer <token>` with tokens issued at login/register.

### Auth (`/api/auth`)
- `POST /api/auth/register` — create account, returns `{ token, user }`
- `POST /api/auth/login` — returns `{ token, user }`
- `GET  /api/auth/me` — current user (JWT)
- `POST /api/auth/logout` — revokes the current token (JWT)

### Users
- `GET  /api/users/<id>` — public profile
- `GET  /api/users/<id>/events/created` — events organized by user
- `GET  /api/users/<id>/events/signedup` — events the user signed up for
- `GET  /api/users/<id>/follow-status` (JWT) — `{ following: bool }`
- `POST /api/follow` (JWT) — body `{ targetUserId }`
- `DELETE /api/follow` (JWT) — body `{ targetUserId }`

### Events
- `GET  /api/events?q=&city=&category=` — list/filter events
- `POST /api/events` (JWT) — create event (auto-geocodes venue)
- `GET  /api/events/<id>` — event detail
- `PUT  /api/events/<id>` (JWT, organizer-only) — update
- `DELETE /api/events/<id>` (JWT, organizer-only) — delete
- `GET  /api/events/<id>/signups` (JWT optional) — signup list (organizer sees more fields)
- `GET  /api/events/<id>/my-signup` (JWT) — `{ signedUp: bool }`
- `POST /api/events/<id>/signup` (JWT) — sign up (also promotes user to COMIC role)
- `DELETE /api/events/<id>/signup` (JWT) — cancel signup
- `GET  /api/events/nearby-public?lat=&lon=&limit=` — public proximity search

### Geocoding (`/api/geo` and `/location`)
- `POST /api/geo/reverse` — body `{ latitude, longitude }` → city/state/country/zipCode
- `POST /location/geocode` — body `{ address }` → `{ latitude, longitude }`
- `POST /location/rev_geocode` — body `{ latitude, longitude }` → `{ address }`
- `POST /location/distance` — body `{ point1: [lat,lon], point2: [lat,lon] }` → km
- `POST /location/events/nearby` — body `{ user_lat, user_lon, events }` → matches

## Tests

Pytest suite lives in `tests/`. Run from the project root:

```bash
pytest
```

Reports are written to `test_reports/` (`pytest_results.xml` and per-iteration JSON).

## Troubleshooting

- **Frontend loads but API 404s** — make sure the backend is running on port 5000 (or set `VITE_BACKEND_URL`).
- **Single-origin serve shows blank page** — Vite outputs to `dist/` by default; build with `--outDir build` so Flask can find it (see Production build above).
- **Port already in use** — start the backend with `PORT=5001 python main.py` and update `VITE_BACKEND_URL` accordingly.
- **Reset local DB** — stop the backend and delete `Backend/instance/mydatabase.db`.
- **Geocoding errors** — the geocoder uses an external service; account creation falls back to lat/lon `0.0` if it fails.

## Notes

- This is a development setup. Don't use the Flask dev server in production — front it with a WSGI server (gunicorn, waitress) and a real frontend host.
- Default secrets in `config.py` are placeholders; set `SECRET_KEY` and `JWT_SECRET_KEY` for any non-local deployment.
