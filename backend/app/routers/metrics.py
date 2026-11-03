import sys
import sqlite3
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.db import save_metrics
from fastapi import APIRouter
from app.services.monitor import (
    get_cpu_usage, 
    get_memory_usage, 
    get_disk_usage,
    get_network_usage,
    get_uptime)

router = APIRouter()


@router.get("/metrics")
def all_metrics():
    cpu = get_cpu_usage()
    memory = get_memory_usage()
    disk = get_disk_usage()
    network = get_network_usage()
    uptime = get_uptime()

    save_metrics(cpu, memory, disk, network, uptime)

    return {
        "cpu": cpu,
        "memory": memory,
        "disk": disk,
        "network": network,
        "uptime": uptime
    }

@router.get("/metrics/history")
def metrics_history():
    db_path = Path(__file__).resolve().parents[3] / "database" / "netsentinel.db"

    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT *
            FROM metrics_history
            ORDER BY timestamp DESC
            LIMIT 20
            """
        ).fetchall()

    return [dict(row) for row in rows]
