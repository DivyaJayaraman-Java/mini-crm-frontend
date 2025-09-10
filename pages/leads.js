import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Leads = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // token safely for both SSR and client
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // axios instance
  const api = axios.create({
    baseURL: `${API_URL}/api/leads`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    if (!token) return router.replace("/login");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.replace("/login");

    const u = JSON.parse(storedUser);
    setUser(u);
    fetchLeads(u);
  }, [token]);

  const fetchLeads = async (u) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data;

      // reps only see their own leads
      if (u.role === "rep") {
        data = data.filter(
          (lead) =>
            lead.ownerId?._id === u._id ||
            lead.ownerId?._id === u.id ||
            lead.ownerId === u._id ||
            lead.ownerId === u.id
        );
      }

      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      alert("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/${editingId}`, formData);
      else await api.post("/", formData);

      setFormData({ name: "", email: "", phone: "" });
      setEditingId(null);
      setShowForm(false);
      fetchLeads(user);
    } catch (err) {
      console.error("Failed to save lead:", err);
      alert("Failed to save lead");
    }
  };

  const handleEdit = (lead) => {
    setFormData({ name: lead.name, email: lead.email, phone: lead.phone });
    setEditingId(lead._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/${id}`);
      fetchLeads(user);
    } catch (err) {
      console.error("Failed to delete lead:", err);
      alert("Failed to delete lead");
    }
  };

  const handleConvert = async (lead) => {
    const value = prompt("Enter opportunity value:", "0");
    if (value === null) return;
    try {
      const res = await api.post(`/${lead._id}/convert`, { value: Number(value) });
      const updatedLead = res.data.lead;
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l._id === updatedLead._id ? updatedLead : l))
      );
      alert("Lead converted to opportunity!");
    } catch (err) {
      console.error("Failed to convert lead:", err);
      alert("Failed to convert lead");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "#0d6efd";
      case "Contacted": return "#6f42c1";
      case "Qualified": return "#198754";
      case "Converted": return "#fd7e14";
      default: return "#6c757d";
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#0d6efd", marginBottom: "1rem" }}>Leads</h1>

      {user.role === "rep" && !showForm && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button onClick={() => setShowForm(true)} style={{ background: "#0d6efd", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Add Lead</button>
        </div>
      )}

      {user.role === "rep" && showForm && (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={inputStyle} />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={inputStyle} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>{editingId ? "Update Lead" : "Add Lead"}</button>
        </form>
      )}

      {loading ? (
        <p>Loading leads...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px", border: "1px solid #ccc" }}>
            <thead>
              <tr style={{ background: "#0d6efd", color: "#fff" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Rep</th>
                {user.role === "rep" && <th style={thStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <tr key={lead._id} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                  <td style={tdStyle}>{lead.name}</td>
                  <td style={tdStyle}>{lead.email}</td>
                  <td style={tdStyle}>{lead.phone}</td>
                  <td style={tdStyle}><span style={{ padding: "0.25rem 0.75rem", borderRadius: "12px", backgroundColor: getStatusColor(lead.status), color: "#fff", fontWeight: "500", fontSize: "0.85rem" }}>{lead.status}</span></td>
                  <td style={tdStyle}>{lead.ownerId?.name || "N/A"}</td>
                  {user.role === "rep" && (
                    <td style={{ ...tdStyle, display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleEdit(lead)} style={actionBtnStyle("#0d6efd")}>Edit</button>
                      <button onClick={() => handleDelete(lead._id)} style={actionBtnStyle("#dc3545")}>Delete</button>
                      {lead.status !== "Converted" && <button onClick={() => handleConvert(lead)} style={actionBtnStyle("#198754")}>Convert</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles
const inputStyle = { flex: "1 1 200px", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" };
const buttonStyle = { background: "#0d6efd", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" };
const thStyle = { padding: "0.75rem", border: "1px solid #ddd", textAlign: "left" };
const tdStyle = { padding: "0.5rem", border: "1px solid #ccc" };
const actionBtnStyle = (color) => ({ padding: "0.25rem 0.5rem", borderRadius: "4px", border: `1px solid ${color}`, color: color, cursor: "pointer" });

export default Leads;
