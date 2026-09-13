# MarketMind AI — Full-Stack Financial Research Platform

MarketMind AI is a full-stack, AI-powered financial research platform built with Next.js 14, FastAPI, PostgreSQL/SQLite, and Scikit-Learn. It provides automated stock analysis, anomaly detection, SHAP explainability, sentiment scoring from financial news, portfolio management, and dynamic investment simulation.

---

## Technical Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
* **Backend:** FastAPI, Uvicorn, Pydantic v2, SlowAPI (Rate Limiting)
* **Machine Learning & NLP:** Scikit-Learn (Random Forest, Isolation Forest), SHAP, NLTK/VADER, Pandas, NumPy
* **Data Sources:** Live financial data and metadata via `yfinance`
* **Database & ORM:** PostgreSQL / SQLite with SQLAlchemy ORM & Alembic Migrations
* **Authentication:** OAuth2 with Password Hashing (`passlib[bcrypt]`) & JWT Tokens (`pyjwt`)
* **Containerization:** Docker, Docker Compose, Multi-stage Node/Python builds

---

## Directory Structure

```text
├── backend/
│   ├── app/
│   │   ├── ai_engine/       # Isolation Forest & SHAP explainability drivers
│   │   ├── api/
│   │   │   └── endpoints/   # Analysis, Auth, Companies, Portfolio, Simulator, Watchlist
│   │   ├── core/            # Configuration & Security settings
│   │   ├── schemas/         # Pydantic request & response models
│   │   └── main.py          # FastAPI application entrypoint
│   └── Dockerfile
├── database/
│   ├── migrations/          # Alembic database migration scripts
│   ├── models.py            # SQLAlchemy database models (User, Watchlist, Portfolio, Simulation)
│   └── session.py           # Database engine & session dependency generator
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router pages
│   │   ├── components/      # Bento-UI component system (KPICard, PriceChart, RiskGauge, etc.)
│   │   ├── lib/             # API client methods & TypeScript interfaces
│   │   └── styles/          # Tailwind CSS global styles
│   └── Dockerfile
├── src/                     # Shared ML pipeline modules (preprocessing, sentiment, training)
├── docker-compose.yml       # Production container orchestration
├── alembic.ini              # Database migration configuration
├── requirements.txt         # Backend Python dependencies
└── README.md