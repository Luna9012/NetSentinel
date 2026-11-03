import psutil
import time

def get_cpu_usage():
    return psutil.cpu_percent(interval=1)


def get_memory_usage():
    memory = psutil.virtual_memory()

    return {
        "total": memory.total,
        "used": memory.used,
        "available": memory.available,
        "percent": memory.percent
    }
def get_disk_usage():
    disk = psutil.disk_usage("/")

    return {
        "total": disk.total,
        "used": disk.used,
        "free": disk.free,
        "percent": disk.percent
    }
def get_network_usage():
    network = psutil.net_io_counters()

    return {
        "bytes_sent": network.bytes_sent,
        "bytes_received": network.bytes_recv,
        "packets_sent": network.packets_sent,
        "packets_received": network.packets_recv
    }
def get_uptime():
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time

    return {
        "uptime_seconds": int(uptime_seconds)
    }
def disk_usage():
    disk = psutil.desk_usage("C:\\")

    return {
        "total":disk.total,
        "used": disk.used,
        "free":disk.free,
        "percent":disk.percent
    }