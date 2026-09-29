# StockMind

A full-stack inventory management system with real demand forecasting , built to go beyond basic CRUD and actually predict what a business needs to reorder, using both a classical statistical model and a neural network trained on sales history.

I built this as a portfolio project to practice building something end-to-end: a real backend with authentication and business logic, a React frontend with proper state management, an actual machine learning feature (not a toy), and full containerization for deployment.

**[Live Demo](#)** — **(https://stockmind-rosy.vercel.app/)**

---

## What it does

- **Inventory management** — add, edit, delete, search, sort, and filter products, with per-user data isolation (every user only ever sees their own inventory). A dashboard summarises item count, low-stock items and total inventory value
- **Sales logging that actually moves stock** — log a sale from an item's forecast view; stock decrements, a sale larger than current stock is rejected, and both forecasts refresh immediately
- **Bulk import from CSV / Excel** — upload a `.csv` or `.xlsx`, map your columns to the inventory fields (auto-matched, manually adjustable), preview, then import. Duplicate SKUs (in the database or within the file) are skipped and every bad row is reported instead of failing the whole upload. A sample template can be downloaded from the import dialog
- **Export** — download your inventory as CSV or Excel
- **Low-stock alerts** — flags items at or below their reorder point, and an "Email me this report" button sends the list to your inbox
- **Demand forecasting, two ways:**
  - A linear regression baseline (NumPy) fit to each item's sales history
  - An LSTM neural network (TensorFlow/Keras) trained per-item, predicting the next 7 days
  - Both are shown side by side, so you can compare a simple statistical model against a neural network on the same real data
- **Secure authentication** — JWT-based sessions, bcrypt password hashing, and a full email verification flow (signed, expiring tokens; a user can't log in until they've verified their email). Verification links use the origin the user signed up from, checked against an allowlist so a crafted request can't point a link at another site. Login, registration and resend-verification are rate limited
- **Polished, accessible UI** — responsive layout from phone to desktop, toast notifications, a styled delete-confirmation dialog, keyboard-accessible modals (Escape to close, focus trapping, focus restore), labelled form fields, and `prefers-reduced-motion` support
- **Fully containerized** — Docker + Docker Compose spins up the backend, frontend, and PostgreSQL database as three coordinated services

---

## Why the forecasting works the way it does

New inventory items don't have any sales history — there's no way around that "cold start" problem for a portfolio project with no real customers yet. Rather than fake a finished feature, I built a synthetic sales data generator (trend + weekly seasonality + random noise) to create realistic-looking history to train and demonstrate the forecasting models against. This is the same thing you'd do in a real job before enough production data exists  it's a documented, deliberate choice, not a shortcut.

I built the linear regression baseline first, on purpose, as a safety net  if the LSTM (a much bigger, riskier undertaking) ran out of time or failed to train well, the app would still ship with a genuinely working forecasting feature. The LSTM ended up working too, and comparing the two became a feature in its own right.

One real bug worth mentioning: early on, my LSTM was predicting values wildly lower than the actual sales data (e.g. predicting ~2 units/day against real data averaging 30-50). I found this by comparing the two models' outputs side by side and noticing the gap was too large to be a legitimate disagreement between approaches. The cause was feeding raw sales counts straight into the network without normalizing them first  the model never converged properly within the training budget. Scaling values to a 0-1 range before training (and scaling predictions back afterward) fixed it, and I added an automated test specifically to catch this class of bug if it ever regresses.

---

## Tech Stack

**Backend:** Python, Flask (application factory pattern), PostgreSQL, SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-Bcrypt, Flask-Mail, Flask-Limiter, itsdangerous, openpyxl, TensorFlow/Keras, NumPy, pandas, pytest

**Frontend:** React 19 (Vite), React Router, Redux Toolkit, Tailwind CSS v4, Axios, Recharts, lucide-react

**Infrastructure:** Docker, Docker Compose, PostgreSQL; deployed on Render (backend) and Vercel (frontend)

---

## Project Structure

```
inventory-ai/
├── backend/
│   ├── app/
│   │   ├── models/          # User, InventoryItem, SalesRecord
│   │   ├── routes/          # auth, inventory (CRUD, sales, forecasts), import, export, alerts
│   │   └── services/        # business logic, (value, error) tuple pattern throughout
│   ├── scripts/              # synthetic sales data generation, demo data seeding
│   ├── tests/                 # pytest suite, isolated in-memory SQLite for tests
│   ├── migrations/           # Alembic migration history
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── components/       # NavBar, StatsCards, InventoryTable, ForecastModal, ImportModal, etc.
│       ├── pages/             # LandingPage, Dashboard, Login/Register, VerifyEmail
│       ├── features/          # Redux slice for inventory state
│       ├── hooks/             # useToast, useModalA11y
│       └── api/                # Axios instance with JWT interceptor
│   └── Dockerfile
└── docker-compose.yml
```

---

## API Overview

All inventory, forecast, import, export and alert routes require a valid JWT (obtained via login) and are automatically scoped to the authenticated user.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, triggers a verification email |
| POST | `/api/auth/login` | Log in (blocked until email is verified) |
| GET | `/api/auth/verify/<token>` | Verify an account via emailed link |
| POST | `/api/auth/resend-verification` | Resend the verification email |
| GET | `/api/inventory/` | List the current user's items |
| POST | `/api/inventory/` | Create an item |
| GET / PUT / PATCH / DELETE | `/api/inventory/<id>` | Read, fully update, partially update, or delete an item |
| POST | `/api/inventory/<id>/sales` | Log a sale (decrements stock; rejected if it exceeds current stock) |
| GET | `/api/inventory/<id>/forecast` | 7-day demand forecast (linear regression) |
| GET | `/api/inventory/<id>/forecast/lstm` | 7-day demand forecast (LSTM, needs at least 30 days of sales) |
| POST | `/api/inventory/import/preview` | Upload a CSV/XLSX, get its headers and sample rows |
| POST | `/api/inventory/import/commit` | Import rows using a column mapping; skips duplicate SKUs and reports bad rows |
| GET | `/api/inventory/export?format=csv` or `xlsx` | Download the current user's inventory |
| POST | `/api/inventory/alerts/low-stock` | Email the current user their low-stock report |
| GET | `/api/auth/me` | Current user's profile |
| GET | `/api/health` | Health check |

---

## Running Locally

### With Docker (recommended)

```bash
git clone https://github.com/ayushmaansingh77/inventory-ai.git
cd inventory-ai
cp .env.example .env   # fill in real values
docker-compose up --build
```

Then, once running:
```bash
docker-compose exec backend uv run flask db upgrade
docker-compose exec backend uv run python -m scripts.seed_demo_data
```

Frontend: `http://localhost:3000` — Backend: `http://localhost:5000`

### Configuration

Copy `backend/.env.example` to `backend/.env` and fill it in. The email settings matter most:

- `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` — SMTP credentials. The example file explains how to switch from a Mailtrap sandbox to real Gmail delivery (use a Google App Password, not your account password).
- `MAIL_DEFAULT_SENDER` — the "From" address; with Gmail it must match `MAIL_USERNAME`.
- `FRONTEND_URL` — the public URL of the frontend, used in emailed verification links (in production, e.g. your Vercel URL, without a trailing slash).
- `ALLOWED_FRONTEND_ORIGINS` — optional, comma-separated extra origins allowed in verification links (e.g. preview deployments). With `FLASK_ENV=development`, localhost and private-network addresses are also accepted so links work from a phone on the same wifi.
- `MAIL_SUPPRESS_SEND=true` — disables real sending (used by the test suite).

The backend's first start takes several seconds because TensorFlow and NumPy are slow to import.

### Without Docker

**Backend:**
```bash
cd backend
uv venv
uv sync
cp .env.example .env   # fill in real values
uv run flask db upgrade
uv run python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Tests and checks

```bash
cd backend && .venv/Scripts/python.exe -m pytest   # or: uv run pytest
cd frontend && npm run build && npm run lint
```

The backend suite covers the auth-link logic, forecasting (including the LSTM cache), sales logging, import, export and alerts against an isolated in-memory SQLite database. There is no frontend test suite yet; the UI is checked by build + lint and manual testing.

---

## Known Limitations & Next Steps

Being upfront about what's genuinely incomplete or simplified, rather than presenting the project as more finished than it is:

- **Verification and alert emails don't send from the hosted backend on Render's free tier.** Render blocks outbound SMTP ports, so Gmail SMTP works locally but not there, regardless of credentials. The fix is to send through an HTTPS email API (e.g. Resend) instead of SMTP; not done yet.
- **Rate limiting uses in-memory storage.** Limits reset on restart and aren't shared across workers; a multi-worker deployment would point Flask-Limiter at Redis.
- **The LSTM is cached per item, but not persisted.** Trained models are kept in an in-process LRU cache and invalidated when an item's sales change, so a restart retrains on first request.
- **No frontend test suite.** The UI is verified by build, lint and manual testing rather than automated tests.
- **No CI/CD pipeline.** This was a deliberate scope cut, not an oversight  I chose to build a working, honestly-tested Docker setup over a rushed, unreliable pipeline.
- **No Google/OAuth sign-in.** Email/password with verification is the only auth method currently.

---

## What I'd Do Differently

If starting over, I'd write the automated test suite earlier ; a test-isolation bug (a database config override that didn't take effect in time) once caused my local development database to actually get wiped during a test run. It was fully recoverable through migration history, but it was a genuinely useful lesson in verifying test isolation actually works, rather than assuming it does because the code reads correctly.
