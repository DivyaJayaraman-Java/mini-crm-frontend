// pages/opportunities.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Opportunities = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ value: 0 });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const u = JSON.parse(storedUser);
    setUser(u);
    fetchOpportunities(u);
  }, []);

  const api = axios.create({
    baseURL: "http://localhost:5000/api/opportunities",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchOpportunities = async (u) => {
    try {
      const res = await api.get("/");
      let data = res.data;
      if (u.role === "rep") {
        data = data.filter(
          (opp) => opp.ownerId === u.id || opp.ownerId === u._id
        );
      }
      setOpportunities(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch opportunities");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (opp) => {
    setEditingId(opp._id);
    setFormData({ value: opp.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/${editingId}`, { value: Number(formData.value) });
      setEditingId(null);
      setFormData({ value: 0 });
      fetchOpportunities(user);
    } catch (err) {
      console.error(err);
      alert("Failed to update opportunity");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ value: 0 });
  };

  // Inline stage updates
  const handleStageUpdate = async (oppId, newStage) => {
    try {
      await api.put(`/${oppId}`, { stage: newStage });
      setOpportunities((prev) =>
        prev.map((o) => (o._id === oppId ? { ...o, stage: newStage } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update stage");
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Opportunities</h1>

      {editingId && (
        <form onSubmit={handleUpdate} style={styles.editForm}>
          <input
            type="number"
            name="value"
            placeholder="Value"
            value={formData.value}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.primaryBtn}>
            Update
          </button>
          <button type="button" onClick={handleCancel} style={styles.secondaryBtn}>
            Cancel
          </button>
        </form>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Stage</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp._id} style={styles.tr}>
                <td style={styles.td}>{opp.title}</td>
                <td style={styles.td}>{opp.value.toLocaleString()}</td>
                <td style={styles.td}>
                  <select
                    style={styles.select}
                    value={opp.stage}
                    onChange={(e) => handleStageUpdate(opp._id, e.target.value)}
                  >
                    <option value="Discovery">Discovery</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button style={styles.primaryBtn} onClick={() => handleEdit(opp)}>
                    Edit Value
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styling ---
const styles = {
  page: {
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f9f9fb",
    minHeight: "100vh",
  },
  heading: {
    color: "#0d6efd",
    fontSize: "2rem",
    marginBottom: "1.5rem",
  },
  editForm: {
    marginBottom: "1.5rem",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "150px",
  },
  primaryBtn: {
    background: "#0d6efd",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#f0f0f0",
    color: "#333",
    padding: "0.5rem 1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  tableHeadRow: {
    background: "#0d6efd",
    color: "#fff",
    textAlign: "left",
  },
  th: {
    padding: "1rem",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "1rem",
    fontSize: "0.95rem",
    color: "#333",
  },
  select: {
    padding: "0.4rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
  },
};

export default Opportunities;
