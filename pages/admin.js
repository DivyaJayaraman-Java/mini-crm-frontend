import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const AdminPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    if (!token || !user || user.role !== "admin") router.replace("/login");
    else fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading users...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Admin – Manage Users</h2>

        {/* Search + Filter */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search by name/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="rep">Rep</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* User Table */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="rep">Rep</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.noData} colSpan="4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  page: {
    minHeight: "100vh",
    padding: "1.5rem",
    fontFamily: "'Inter', Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "600",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#1e3a8a",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.8rem",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    background: "#ffffff",
    cursor: "pointer",
  },
  card: {
    background: "#ffffff",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "500px",
  },
  th: {
    background: "#3b82f6",
    color: "#ffffff",
    padding: "10px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  tr: {
    transition: "background 0.2s",
  },
  td: {
    padding: "10px",
    fontSize: "0.85rem",
    color: "#1e3a8a",
    borderBottom: "1px solid #e2e8f0",
  },
  noData: {
    padding: "12px",
    textAlign: "center",
    color: "#64748b",
  },
  select: {
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem",
    cursor: "pointer",
    background: "#f8fafc",
  },
  deleteBtn: {
    background: "#6c8ef5ff",
    color: "#ffffff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
};

export default AdminPage;
