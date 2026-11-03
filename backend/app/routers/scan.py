from fastapi import APIRouter
from app.services.scanner import run_scan

router = APIRouter()

@router.get("/scan")
def scan(target: str):
    return run_scan(target)