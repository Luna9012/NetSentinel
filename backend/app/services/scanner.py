import ipaddress
import subprocess
import socket


def check_host(ip):
    result = subprocess.run(
        ["ping", "-n", "1", "-w", "500", str(ip)],
        capture_output=True,
        text=True
    )

    return result.returncode == 0
def get_hostname(ip):
    try:
        return socket.gethostbyaddr(str(ip))[0]
    except socket.herror:
        return "Unknown"


def run_scan(target: str):
    network = ipaddress.ip_network(target, strict=False)

    hosts = []

    for ip in network.hosts():
        if check_host(ip):
            hosts.append({
                "ip": str(ip),
                "hostname": get_hostname(ip)
            })

    return {
        "status": "completed",
        "target": target,
        "hosts_found": len(hosts),
        "hosts": hosts
    }