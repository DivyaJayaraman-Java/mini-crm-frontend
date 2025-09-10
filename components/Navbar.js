import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navLinks = () => {
    if (!user) return [];
    if (user.role === "admin") return [{ label: "Admin", path: "/admin" }];
    return [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Leads", path: "/leads" },
      { label: "Opportunities", path: "/opportunities" },
    ];
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div
        className="logo"
        onClick={() => {
          if (!user) router.push("/login");
          else if (user.role === "admin") router.push("/admin");
          else router.push("/dashboard");
        }}
      >
        Mini CRM
      </div>

      {/* Hamburger Menu */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Links & User */}
      <div className={`nav-right ${menuOpen ? "open" : ""}`}>
        <div className="links">
          {navLinks().map((link) => (
            <span
              key={link.path}
              className="nav-link"
              onClick={() => {
                router.push(link.path);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </span>
          ))}
        </div>

        <div className="user-buttons">
          {user ? (
            <>
              <div className="role-badge">{user.role.toUpperCase()}</div>
              <div className="logout-btn" onClick={handleLogout}>
                Logout
              </div>
            </>
          ) : (
            <div className="login-btn" onClick={() => router.push("/login")}>
              Login
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .navbar {
          background: #fff;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .logo {
          font-weight: 700;
          font-size: 1.2rem;
          color: #1b73f6;
          cursor: pointer;
        }

        .hamburger {
          display: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .links {
          display: flex;
          gap: 1rem;
        }

        .nav-link {
          color: #1b73f6;
          font-weight: 500;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          border-radius: 5px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: #e0f0ff;
          color: #0d47a1;
        }

        .user-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .role-badge {
          background: #1b73f6;
          color: #fff;
          padding: 0.3rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85rem;
        }

        .logout-btn,
        .login-btn {
          background: #fff;
          color: #1b73f6;
          padding: 0.3rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          border: 1px solid #1b73f6;
          transition: all 0.2s ease;
        }

        .logout-btn:hover,
        .login-btn:hover {
          background: #1b73f6;
          color: #fff;
        }

        @media (max-width: 768px) {
          .hamburger {
            display: block;
          }

          .nav-right {
            display: ${menuOpen ? "flex" : "none"};
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }

          .links {
            flex-direction: column;
            width: 100%;
          }

          .nav-link {
            width: 100%;
          }

          .user-buttons {
            justify-content: flex-start;
            width: 100%;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
