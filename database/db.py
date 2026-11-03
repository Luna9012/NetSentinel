import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("netsentinel.db")


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def create_table():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                cpu_percent REAL,
                memory_percent REAL,
                disk_percent REAL,
                bytes_sent INTEGER,
                bytes_received INTEGER,
                uptime_seconds INTEGER
            )
        """)

def save_metrics(cpu, memory, disk, network, uptime):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO metrics_history (
                cpu_percent,
                memory_percent,
                disk_percent,
                bytes_sent,
                bytes_received,
                uptime_seconds
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                cpu,
                memory["percent"],
                disk["percent"],
                network["bytes_sent"],
                network["bytes_received"],
                uptime["uptime_seconds"]
            )
        )
