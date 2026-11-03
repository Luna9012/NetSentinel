from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.home import router as home_router
from app.routers.health import router as health_router
from app.routers.scan import router as scan_router
from app.routers.metrics import router as metrics_router
from app.routers.alerts import router as alerts_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home_router)
app.include_router(health_router)
app.include_router(scan_router)
app.include_router(metrics_router)
app.include_router(alerts_router)