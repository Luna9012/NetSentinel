from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return{
        "status": "healthy",
        "application": "NetSentinel",
        "version":"1.0.0"
    }