# StockMind

A full-stack inventory management system with real demand forecasting , built to go beyond basic CRUD and actually predict what a business needs to reorder, using both a classical statistical model and a neural network trained on sales history.

I built this as a portfolio project to practice building something end-to-end: a real backend with authentication and business logic, a React frontend with proper state management, an actual machine learning feature (not a toy), and full containerization for deployment.

**[Live Demo](#)** — **(https://stockmind-rho.vercel.app/)**

---

## What it does

- **Inventory management** — add, edit, delete, search, sort, and filter products, with per-user data isolation (every user only ever sees their own inventory)
- **Low-stock alerts** — automatically flags items at or below their reorder point
- **Demand forecasting, two ways:**
  - A linear regression baseline (NumPy) fit to each item's sales history
  - An LSTM neural network (TensorFlow/Keras) trained per-item, predicting the next 7 days
  - Both are shown side by side, so you can compare a simple statistical model against a neural network on the same real data
- **Secure authentication** — JWT-based sessions, bcrypt password hashing, and a full email verification flow (signed, expiring tokens; a user can't log in until they've verified their email)
- **Fully containerized** — Docker + Docker Compose spins up the backend, frontend, and PostgreSQL database as three coordinated services

---

## Why the forecasting works the way it does

New inventory items don't have any sales history — there's no way around that "cold start" problem for a portfolio project with no real customers yet. Rather than fake a finished feature, I built a synthetic sales data generator (trend + weekly seasonality + random noise) to create realistic-looking history to train and demonstrate the forecasting models against. This is the same thing you'd do in a real job before enough production data exists  it's a documented, deliberate choice, not a shortcut.

I built the linear regression baseline first, on purpose, as a safety net  if the LSTM (a much bigger, riskier undertaking) ran out of time or failed to train well, the app would still ship with a genuinely working forecasting feature. The LSTM ended up working too, and comparing the two became a feature in its own right.

One real bug worth mentioning: early on, my LSTM was predicting values wildly lower than the actual sales data (e.g. predicting ~2 units/day against real data averaging 30-50). I found this by comparing the two models' outputs side by side and noticing the gap was too large to be a legitimate disagreement between approaches. The cause was feeding raw sales counts straight into the network without normalizing them first  the model never converged properly within the training budget. Scaling values to a 0-1 range before training (and scaling predictions back afterward) fixed it, and I added an automated test specifically to catch this class of bug if it ever regresses.

---

## Tech Stack

**Backend:** Python, Flask (application factory pattern), PostgreSQL, SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-Bcrypt, Flask-Mail, itsdangerous, TensorFlow/Keras, NumPy, pandas, pytest

**Frontend:** React (Vite), React Router, Redux Toolkit, Tailwind CSS, Axios

**Infrastructure:** Docker, Docker Compose, PostgreSQL

---

## Project Structure

```
inventory-ai/
├── backend/
│   ├── app/
│   │   ├── models/          # User, InventoryItem, SalesRecord
│   │   ├── routes/          # auth, inventory (CRUD + forecast endpoints)
│   │   └── services/        # business logic, (value, error) tuple pattern throughout
│   ├── scripts/              # synthetic sales data generation, demo data seeding
│   ├── tests/                 # pytest suite, isolated in-memory SQLite for tests
│   ├── migrations/           # Alembic migration history
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── components/       # NavBar, StatsCards, InventoryTable, ForecastPanel, etc.
│       ├── pages/             # LandingPage, Dashboard, Login/Register, VerifyEmail
│       ├── features/          # Redux slice for inventory state
│       └── api/                # Axios instance with JWT interceptor
│   └── Dockerfile
└── docker-compose.yml
```

---

## API Overview

All inventory and forecast routes require a valid JWT (obtained via login) and are automatically scoped to the authenticated user.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, triggers a verification email |
| POST | `/api/auth/login` | Log in (blocked until email is verified) |
| GET | `/api/auth/verify/<token>` | Verify an account via emailed link |
| POST | `/api/auth/resend-verification` | Resend the verification email |
| GET | `/api/inventory/` | List the current user's items |
| POST | `/api/inventory/` | Create an item |
| GET / PUT / PATCH / DELETE | `/api/inventory/<id>` | Read, fully update, partially update, or delete an item |
| GET | `/api/inventory/<id>/forecast` | 7-day demand forecast (linear regression) |
| GET | `/api/inventory/<id>/forecast/lstm` | 7-day demand forecast (LSTM) |

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

---

## Known Limitations & Next Steps

Being upfront about what's genuinely incomplete or simplified, rather than presenting the project as more finished than it is:

- **The LSTM retrains from scratch on every single forecast request.** There's no model caching yet  fine for a demo, a real performance problem at any meaningful scale. Caching trained models per item (and only retraining when new sales data arrives) is the natural next step.
- **No user-facing way to log a real sale yet.** Sales history currently only comes from the synthetic data generator and demo seed script  a `POST /api/inventory/<id>/sales` endpoint and a small UI for it is a reasonable next addition.
- **No bulk import.** Adding inventory items is one at a time through the UI; CSV/Excel bulk upload was scoped conceptually but not built.
- **No CI/CD pipeline.** This was a deliberate scope cut, not an oversight  I chose to build a working, honestly-tested Docker setup over a rushed, unreliable pipeline.
- **No Google/OAuth sign-in.** Email/password with verification is the only auth method currently.

---

## What I'd Do Differently

If starting over, I'd write the automated test suite earlier ; a test-isolation bug (a database config override that didn't take effect in time) once caused my local development database to actually get wiped during a test run. It was fully recoverable through migration history, but it was a genuinely useful lesson in verifying test isolation actually works, rather than assuming it does because the code reads correctly.
