# FYFProject (Find Your Funny)

Full‑stack web app with:
- **Backend**: Flask + SQLAlchemy + JWT auth (SQLite)
- **Frontend**: React (CRA + CRACO)

The backend serves the API under **`/api`** and (after building) serves the frontend from the same Flask server.

## Quick start (recommended: single server)

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+ (20 is fine)
- **npm**: comes with Node

### 1) Install + build the frontend
From `FYFProject-main/frontend`:

```bash
npm install
npm run build
```

### 2) Run the backend (serves API + frontend)
From `FYFProject-main/Backend`:

```bash
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python main.py
```

Open the app at:
- `http://127.0.0.1:5000`

## Project structure

```text
FYFProject-main/
  Backend/                 Flask app (API + serves frontend build)
    main.py
    config.py
    models.py
    requirements.txt
    instance/mydatabase.db  SQLite DB (auto-created/used locally)
  frontend/                React app (CRA/CRACO)
    src/
    build/                 Production build output (generated)
```

## Environment variables

Backend (optional):
- **`PORT`**: Flask port (default `5000`)
- **`SECRET_KEY`**: Flask secret key (default is dev-only)
- **`JWT_SECRET_KEY`**: JWT signing secret (default is dev-only)

Frontend (optional):
- **`REACT_APP_BACKEND_URL`**: If set, the frontend will call `${REACT_APP_BACKEND_URL}/api`.  
  If not set (recommended for single-server), it uses same-origin `/api`.

## API overview

Most-used routes:
- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (JWT required)
  - `POST /api/auth/logout` (JWT required)
- **Events**
  - `GET /api/events`
  - `POST /api/events` (JWT required)
  - `GET /api/events/<id>`
  - `PUT /api/events/<id>` (JWT required)
  - `DELETE /api/events/<id>` (JWT required)
  - `GET /api/events/nearby-public?lat=...&lon=...`

## Troubleshooting

- **`npm install` fails with peer dependency conflicts**
  - This project is pinned to dependency versions that work together; re-run `npm install` after pulling latest changes.

- **Port already in use**
  - If `5000` is busy, run backend with `PORT=5001` and open `http://127.0.0.1:5001`.

- **Database issues**
  - SQLite DB is stored under `Backend/instance/mydatabase.db`. For a clean local reset, stop the server and delete that file (you’ll lose local data).

## Notes
- This is a development setup. Do not use the Flask dev server for production.
