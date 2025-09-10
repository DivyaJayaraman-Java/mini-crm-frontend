import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Leads = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return router.replace("/login");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.replace("/login");

    const u = JSON.parse(storedUser);
    setUser(u);
    fetchLeads(u);
  }, []);

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/leads`,
  headers: { Authorization: `Bearer ${token}` },
});

  const fetchLeads = async (u) => {
    try {
      const res = await api.get("/");
      let data = res.data;

      // Reps see only their leads
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
      console.error(err);
      alert("Failed to fetch leads");
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
      console.error(err);
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
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  const handleConvert = async (lead) => {
    const value = prompt("Enter opportunity value:", "0");
    if (value === null) return;
    try {
      const res = await api.post(`/${lead._id}/convert`, {
        value: Number(value),
      });
      const updatedLead = res.data.lead;
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l._id === updatedLead._id ? updatedLead : l))
      );
      alert("Lead converted to opportunity!");
    } catch (err) {
      console.error(err);
      alert("Failed to convert lead");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "#0d6efd";
      case "Contacted":
        return "#6f42c1";
      case "Qualified":
        return "#198754";
      case "Converted":
        return "#fd7e14";
      default:
        return "#6c757d";
    }
  };

  if (!user) return null; // Prevent render before user is set

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ color: "#0d6efd" }}>Leads</h1>
      </div>

      {/* Add Lead button for reps */}
      {user.role === "rep" && !showForm && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#0d6efd",
              color: "#fff",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span style={{ fontWeight: "bold" }}>+</span> Add Lead
          </button>
        </div>
      )}

      {/* Add/Edit Lead Form */}
      {user.role === "rep" && showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              flex: "1 1 200px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              flex: "1 1 200px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              flex: "1 1 150px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#0d6efd",
              color: "#fff",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {editingId ? "Update Lead" : "Add Lead"}
          </button>
        </form>
      )}

      {/* Leads Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#0d6efd",
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <th
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Phone
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Rep
              </th>
              {user.role === "rep" && (
                <th
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr
                key={lead._id}
                style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                }}
              >
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {lead.name}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {lead.email}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {lead.phone}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      backgroundColor: getStatusColor(lead.status),
                      color: "#fff",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {lead.ownerId?.name || "N/A"}
                </td>
                {user.role === "rep" && (
                  <td
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(lead)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #0d6efd",
                        color: "#0d6efd",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #dc3545",
                        color: "#dc3545",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    {lead.status !== "Converted" && (
                      <button
                        onClick={() => handleConvert(lead)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #198754",
                          color: "#198754",
                          cursor: "pointer",
                        }}
                      >
                        Convert
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
