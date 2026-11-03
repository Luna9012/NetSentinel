
from fastapi import APIRouter
from app.services.monitor import (
    get_cpu_usage,
    get_memory_usage,
    get_disk_usage
)

router = APIRouter()


@router.get("/alerts")
def get_alerts():
    alerts = []

    cpu = get_cpu_usage()
    memory = get_memory_usage()
    disk = get_disk_usage()

    if cpu > 80:
        alerts.append({
            "metric": "CPU",
            "value": cpu,
            "threshold": 80,
            "severity": "warning",
            "message": "CPU usage is high"
        })

    if memory["percent"] > 80:
        alerts.append({
            "metric": "Memory",
            "value": memory["percent"],
            "threshold": 80,
            "severity": "warning",
            "message": "Memory usage is high"
        })

    if disk["percent"] > 90:
        alerts.append({
            "metric": "Disk",
            "value": disk["percent"],
            "threshold": 90,
            "severity": "critical",
            "message": "Disk usage is critically high"
        })

    return {
        "alert_count": len(alerts),
        "alerts": alerts
    }
