import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  const [scanTarget, setScanTarget] = useState("127.0.0.1/32");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);

  async function fetchData() {
    try {
      const [metricsResponse, alertsResponse, historyResponse] =
        await Promise.all([
          fetch(`${API_URL}/metrics`),
          fetch(`${API_URL}/alerts`),
          fetch(`${API_URL}/metrics/history`),
        ]);

      if (
        !metricsResponse.ok ||
        !alertsResponse.ok ||
        !historyResponse.ok
      ) {
        throw new Error("Failed to fetch dashboard data");
      }

      const metricsData = await metricsResponse.json();
      const alertsData = await alertsResponse.json();
      const historyData = await historyResponse.json();

      setMetrics(metricsData);
      setAlerts(alertsData.alerts ?? []);
      setHistory(
        Array.isArray(historyData) ? [...historyData].reverse() : []
      );
      setError("");
    } catch (err) {
      console.error("NetSentinel fetch error:", err);
      setError(
        "Cannot connect to NetSentinel backend. Is FastAPI running?"
      );
    }
  }

  async function runScan(event) {
    event.preventDefault();

    setScanning(true);
    setScanError("");
    setScanResult(null);

    try {
      const response = await fetch(
        `${API_URL}/scan?target=${encodeURIComponent(scanTarget.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Network scan failed"
        );
      }

      setScanResult(data);
    } catch (err) {
      console.error("NetSentinel scan error:", err);
      setScanError(err.message || "Unable to run network scan.");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    fetchData();

    const timer = setInterval(fetchData, 5000);

    return () => clearInterval(timer);
  }, []);

  const cards = metrics
    ? [
        {
          title: "CPU Usage",
          value: `${metrics.cpu}%`,
          detail: "Current processor usage",
        },
        {
          title: "Memory Usage",
          value: `${metrics.memory.percent}%`,
          detail: "RAM utilization",
        },
        {
          title: "Disk Usage",
          value: `${metrics.disk.percent}%`,
          detail: "Disk space utilized",
        },
        {
          title: "Network Sent",
          value: formatBytes(metrics.network.bytes_sent),
          detail: "Total bytes sent",
        },
        {
          title: "Network Received",
          value: formatBytes(metrics.network.bytes_received),
          detail: "Total bytes received",
        },
        {
          title: "System Uptime",
          value: formatUptime(metrics.uptime.uptime_seconds),
          detail: "Time since last boot",
        },
      ]
    : [];

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">N</span>
          <div>
            <h1>NetSentinel</h1>
            <p>Network & Infrastructure Monitoring</p>
          </div>
        </div>

        <div className="status">
          <span
            className={metrics ? "status-dot" : "status-dot offline"}
          />
          {metrics ? "System Online" : "Connecting..."}
        </div>
      </header>

      <section className="welcome">
        <p className="eyebrow">OVERVIEW</p>
        <h2>Infrastructure Dashboard</h2>
        <p>
          Monitor your system health and network activity in real time.
        </p>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="metrics-grid">
        {cards.map((card) => (
          <article className="metric-card" key={card.title}>
            <p className="card-title">{card.title}</p>
            <h3>{card.value}</h3>
            <p className="card-detail">{card.detail}</p>
          </article>
        ))}

        {!metrics && !error && (
          <p className="loading">Loading system metrics...</p>
        )}
      </section>

      {/* Network Scanner */}
      <section className="panel scanner-panel">
        <div className="panel-heading">
          <div>
            <h2>Network Scanner</h2>
            <p>
              Discover active hosts on a network you own or are authorized
              to scan.
            </p>
          </div>
        </div>

        <form className="scanner-form" onSubmit={runScan}>
          <input
            type="text"
            value={scanTarget}
            onChange={(event) => setScanTarget(event.target.value)}
            placeholder="Enter IP or CIDR, e.g. 192.168.1.0/24"
            aria-label="Network scan target"
            required
          />

          <button type="submit" disabled={scanning}>
            {scanning ? "Scanning..." : "Start Scan"}
          </button>
        </form>

        {scanError && (
          <div className="error-banner">{scanError}</div>
        )}

        {scanResult && (
          <div className="scan-results">
            <div className="scan-summary">
              <span>
                <strong>Target:</strong> {scanResult.target}
              </span>
              <span>
                <strong>Hosts found:</strong> {scanResult.hosts_found}
              </span>
              <span>
                <strong>Status:</strong> {scanResult.status}
              </span>
            </div>

            {scanResult.hosts?.length > 0 ? (
              <table className="scan-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Hostname</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {scanResult.hosts.map((host) => (
                    <tr key={host.ip}>
                      <td>{host.ip}</td>
                      <td>{host.hostname || "Unknown"}</td>
                      <td>
                        <span className="host-online">Online</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">
                No active hosts were discovered.
              </p>
            )}
          </div>
        )}
      </section>

      {/* System Alerts */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>System Alerts</h2>
            <p>Threshold-based monitoring</p>
          </div>

          <span className="alert-count">{alerts.length} active</span>
        </div>

        {alerts.length === 0 ? (
          <p className="empty-state">
            {metrics
              ? "All monitored metrics are within configured thresholds."
              : "Waiting for alert data..."}
          </p>
        ) : (
          alerts.map((alert, index) => (
            <div
              className="alert-row"
              key={`${alert.metric}-${index}`}
            >
              <span className="alert-symbol">!</span>
              <div>
                <strong>
                  {alert.metric} — {alert.severity}
                </strong>
                <p>
                  {alert.message} ({alert.value}%)
                </p>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Performance History */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Performance History</h2>
            <p>Recent CPU, memory, and disk utilization</p>
          </div>

          <span className="alert-count">
            {history.length} readings
          </span>
        </div>

        <div className="history-chart">
          {history.length === 0 ? (
            <p className="empty-state">
              Waiting for historical readings...
            </p>
          ) : (
            ["cpu_percent", "memory_percent", "disk_percent"].map(
              (metric) => (
                <div className="chart-row" key={metric}>
                  <div className="chart-label">
                    <span>
                      {metric.replace("_percent", "").toUpperCase()}
                    </span>
                    <strong>
                      {Number(
                        history[history.length - 1]?.[metric] ?? 0
                      ).toFixed(1)}
                      %
                    </strong>
                  </div>

                  <div className="chart-visual">
                    <div
                      className="chart-scale"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        width: "48px",
                        minWidth: "48px",
                        height: "120px",
                        flexShrink: 0,
                      }}
                    >
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>

                    <div className="chart-bars">
                      {history.slice(-30).map((reading, index) => {
                        const value = Number(reading[metric]) || 0;

                        return (
                          <div
                            key={`${metric}-${reading.id ?? index}`}
                            className={`chart-bar ${metric}`}
                            style={{
                              height: `${Math.max(
                                0,
                                Math.min(100, value)
                              )}%`,
                            }}
                            title={`${reading.timestamp}: ${value}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </section>

      <footer>
        <span>NetSentinel · Monitoring your infrastructure</span>
        <button onClick={fetchData}>Refresh metrics</button>
      </footer>
    </main>
  );
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }

  return `${value.toFixed(1)} ${units[unit]}`;
}

function formatUptime(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

export default App;
