import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({ leads: {}, opportunities: {} });
  const [user, setUser] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return router.replace("/login");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.replace("/login");

    const u = JSON.parse(storedUser);
    setUser(u);

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
   const res = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      alert("Failed to fetch dashboard stats");
    }
  };

  const getBadgeColor = (key) => {
    const colors = {
      New: "#3b82f6",
      Contacted: "#6f42c1",
      Qualified: "#10b981",
      Proposal: "#f59e0b",
      Discovery: "#6366f1",
      Won: "#22c55e",
      Lost: "#ef4444",
    };
    return colors[key] || "#6b7280";
  };

  if (!user) return null;

  const handleCardClick = (type) => {
    if (type === "leads") router.push("/leads");
    if (type === "opportunities") router.push("/opportunities");
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>{user.role === "manager" ? "Manager" : "Sales Rep"} Dashboard</h2>

      <div style={styles.grid}>
        {/* Leads Card */}
        <div
          style={styles.card}
          onClick={() => handleCardClick("leads")}
        >
          <h3 style={styles.cardTitle}>Leads by Status</h3>
          {Object.keys(stats.leads).length === 0 ? (
            <p style={styles.empty}>No data</p>
          ) : (
            Object.entries(stats.leads).map(([status, count]) => (
              <div key={status} style={styles.item}>
                <span style={{ ...styles.badge, background: getBadgeColor(status) }} />
                <span style={styles.label}>{status}</span>
                <span style={styles.value}>{count}</span>
              </div>
            ))
          )}
        </div>

        {/* Opportunities Card */}
        <div
          style={styles.card}
          onClick={() => handleCardClick("opportunities")}
        >
          <h3 style={styles.cardTitle}>Opportunities by Stage</h3>
          {Object.keys(stats.opportunities).length === 0 ? (
            <p style={styles.empty}>No data</p>
          ) : (
            Object.entries(stats.opportunities).map(([stage, count]) => (
              <div key={stage} style={styles.item}>
                <span style={{ ...styles.badge, background: getBadgeColor(stage) }} />
                <span style={styles.label}>{stage}</span>
                <span style={styles.value}>{count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
    padding: "2rem 1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#111827",
    textAlign: "center",
  },
  grid: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "1rem",
    flex: "1 1 250px",
    maxWidth: "300px",
    minHeight: "200px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.8rem",
    color: "#1e3a8a",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.4rem",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    padding: "0.35rem 0.5rem",
    background: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "0.4rem",
  },
  badge: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    marginRight: "0.5rem",
  },
  label: {
    flex: 1,
    marginLeft: "0.3rem",
    color: "#374151",
  },
  value: {
    fontWeight: "600",
    color: "#111827",
  },
  empty: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
};

// Hover effect using inline style
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;
