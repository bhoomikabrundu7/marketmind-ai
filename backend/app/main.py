from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.session import engine, Base
from backend.app.api.endpoints import analysis, companies, simulator, auth, watchlist, portfolio
from backend.app.core.config import settings

# Initialize all database tables on application startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Explicit CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Register Endpoint Routers
app.include_router(analysis.router, prefix=f"{settings.API_V1_STR}/stocks", tags=["Stock Analysis"])
app.include_router(companies.router, prefix=f"{settings.API_V1_STR}/companies", tags=["Companies"])
app.include_router(simulator.router, prefix=f"{settings.API_V1_STR}/simulator", tags=["Investment Simulator"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(watchlist.router, prefix=f"{settings.API_V1_STR}/watchlists", tags=["Watchlists"])
app.include_router(portfolio.router, prefix=f"{settings.API_V1_STR}/portfolios", tags=["Portfolios"])