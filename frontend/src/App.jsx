import { useState, useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────
const getScoreBg = (score) => {
  if (score >= 80) return "bg-red-100 border border-red-300 text-red-700";
  if (score >= 40) return "bg-yellow-100 border border-yellow-300 text-yellow-700";
  if (score === 0) return "bg-gray-100 border border-gray-300 text-gray-500";
  return "bg-green-100 border border-green-300 text-green-700";
};

const getAttackBadge = (attackType) => {
  const critical = ["ROOT_ATTACK", "PRIVILEGE_ESCALATION", "SUCCESS_AFTER_FAILURES"];
  const high = ["BRUTE_FORCE", "NEW_USER_CREATED"];
  if (critical.includes(attackType)) return "bg-red-100 border border-red-300 text-red-700";
  if (high.includes(attackType)) return "bg-orange-100 border border-orange-300 text-orange-700";
  return "bg-gray-100 border border-gray-300 text-gray-900";
};

// ── SVG Icons ─────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ThreatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const RiskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const LiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 010 8.49" />
    <path d="M7.76 7.76a6 6 0 000 8.49" />
    <path d="M20.07 4.93a10 10 0 010 14.14" />
    <path d="M3.93 4.93a10 10 0 000 14.14" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BanIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

// ── Blacklist Modal ───────────────────────────────────────────
const BlacklistModal = ({ ip, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(ip, reason || "Manually blacklisted from dashboard");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Blacklist IP</h3>
        <p className="text-gray-400 text-sm mb-5">
          This will add <span className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{ip}</span> to the blacklist.
        </p>

        <label className="block text-xs font-medium text-gray-600 uppercase tracking-widest mb-2">
          Reason (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Repeated brute force attacks"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-colors mb-5"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Blacklisting..." : "Blacklist IP"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accent, sub }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-xs uppercase tracking-widest font-medium">{title}</span>
      <span className={`${accent}`}>{icon}</span>
    </div>
    <p className={`text-4xl font-bold tracking-tight ${accent}`}>{value}</p>
    {sub && <p className="text-gray-400 text-xs">{sub}</p>}
  </div>
);

// ── Alert Row ─────────────────────────────────────────────────
const AlertRow = ({ alert, blacklistedIPs, onBlacklist }) => {
  const isBlacklisted = blacklistedIPs.has(alert.ip);

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
      <td className="py-3.5 px-5">
        <span className="font-mono text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
          {alert.ip}
        </span>
      </td>
      <td className="py-3.5 px-5">
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm font-medium">{alert.city}</span>
          <span className="text-gray-400 text-xs">{alert.country}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className={`text-sm font-bold px-2.5 py-1 rounded font-mono ${getScoreBg(alert.abuseScore)}`}>
          {alert.abuseScore}/100
        </span>
      </td>
      <td className="py-3.5 px-5">
        <span className="text-gray-900 text-sm font-semibold">{alert.attempts}</span>
        <span className="text-gray-400 text-xs ml-1">attempts</span>
      </td>
      <td className="py-3.5 px-5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${getAttackBadge(alert.attackType)}`}>
          {alert.attackType?.replace(/_/g, " ")}
        </span>
      </td>
      <td className="py-3.5 px-5">
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm">{new Date(alert.timestamp).toLocaleDateString()}</span>
          <span className="text-gray-400 text-xs">{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${alert.resolved
          ? "bg-green-50 border-green-300 text-green-700"
          : "bg-red-50 border-red-300 text-red-600"
          }`}>
          {alert.resolved ? "Resolved" : "Active"}
        </span>
      </td>
      <td className="py-3.5 px-5">
        {isBlacklisted ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
            <BanIcon /> Blacklisted
          </span>
        ) : (
          <button
            onClick={() => onBlacklist(alert.ip)}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <BanIcon /> Blacklist
          </button>
        )}
      </td>
    </tr>
  );
};

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [blacklistedIPs, setBlacklistedIPs] = useState(new Set());
  const [modalIP, setModalIP] = useState(null);
  const [toast, setToast] = useState(null);
  const wsRef = useRef(null);

  // ── Fetch alerts ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => { if (data.success) setAlerts(data.data); })
      .catch((err) => console.error("Failed to fetch alerts:", err));
  }, []);

  // ── Fetch existing blacklist ──────────────────────────────────
  useEffect(() => {
    fetch("/api/blacklist")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBlacklistedIPs(new Set(data.data.map((b) => b.ip)));
        }
      })
      .catch((err) => console.error("Failed to fetch blacklist:", err));
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connect = () => {
      const wsUrl = window.location.protocol === "https:"
        ? `wss://${window.location.host}`
        : `ws://${window.location.hostname}:3000`;

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "new_alert") {
          setAlerts((prev) => [message.data, ...prev]);
          setLiveCount((prev) => prev + 1);
        }
      };
      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // ── Blacklist handler ─────────────────────────────────────────
  const handleBlacklistConfirm = async (ip, reason) => {
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setBlacklistedIPs((prev) => new Set([...prev, ip]));
        setToast({ type: "success", message: `${ip} has been blacklisted` });
      } else {
        setToast({ type: "error", message: "Failed to blacklist IP" });
      }
    } catch {
      setToast({ type: "error", message: "Network error — try again" });
    }
    setModalIP(null);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Stats ─────────────────────────────────────────────────────
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  const highRiskAlerts = alerts.filter((a) => a.abuseScore >= 80).length;

  const filteredAlerts = alerts.filter((a) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !a.resolved) ||
      (filter === "critical" && a.abuseScore >= 80);
    const matchesSearch =
      !search ||
      a.ip?.toLowerCase().includes(search.toLowerCase()) ||
      a.country?.toLowerCase().includes(search.toLowerCase()) ||
      a.attackType?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      {/* ── Blacklist Modal ─────────────────────────────────── */}
      {modalIP && (
        <BlacklistModal
          ip={modalIP}
          onConfirm={handleBlacklistConfirm}
          onCancel={() => setModalIP(null)}
        />
      )}

      {/* ── Toast Notification ──────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold ${toast.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
          }`}>
          {toast.message}
        </div>
      )}

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldIcon />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">LogShield</h1>
              <p className="text-gray-400 text-xs mt-0.5 uppercase tracking-wide">SSH Security Monitor</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-gray-400 text-xs uppercase tracking-widest">System</p>
              <p className="text-gray-800 text-sm font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${connected
              ? "border-blue-200 bg-blue-50 text-blue-600"
              : "border-red-200 bg-red-50 text-red-600"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-blue-500 animate-pulse" : "bg-red-500"}`} />
              {connected ? "Live" : "Offline"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats ───────────────────────────────────────── */}
        <section>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-medium">Overview</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Alerts" value={totalAlerts} icon={<AlertIcon />} accent="text-gray-900" sub="All time records" />
            <StatCard title="Active Threats" value={activeAlerts} icon={<ThreatIcon />} accent="text-yellow-600" sub="Unresolved incidents" />
            <StatCard title="High Risk IPs" value={highRiskAlerts} icon={<RiskIcon />} accent="text-red-600" sub="Abuse score ≥ 80" />
            <StatCard title="Live Alerts" value={liveCount} icon={<LiveIcon />} accent="text-blue-600" sub="This session" />
          </div>
        </section>

        {/* ── Table ───────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Attack Log</h2>
              <p className="text-gray-400 text-xs mt-0.5">{filteredAlerts.length} records shown</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search IP, country, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg pl-8 pr-4 py-2 w-52 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>

              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                {["all", "active", "critical"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 capitalize transition-colors ${filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["IP Address", "Location", "Abuse Score", "Attempts", "Attack Type", "Time", "Status", "Action"].map((h) => (
                    <th key={h} className="py-3 px-5 text-left text-gray-400 text-xs uppercase tracking-widest font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShieldIcon />
                        <p className="text-gray-400 text-sm">No attacks detected</p>
                        <p className="text-gray-300 text-xs">System is monitoring — stay alert</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <AlertRow
                      key={alert._id}
                      alert={alert}
                      blacklistedIPs={blacklistedIPs}
                      onBlacklist={(ip) => setModalIP(ip)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredAlerts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-gray-400 text-xs">Showing {filteredAlerts.length} of {totalAlerts} alerts</p>
              <p className="text-gray-400 text-xs">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          )}
        </section>

      </main>

      <footer className="border-t border-gray-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-gray-400 text-xs">LogShield · SSH Security Monitor</p>
          <p className="text-gray-400 text-xs">
            {connected ? "● Monitoring active" : "○ Monitor offline"}
          </p>
        </div>
      </footer>
    </div>
  );
}