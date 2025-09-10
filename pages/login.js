import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Login = () => {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rep", // default role for signup
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        // Signup request
        await axios.post("http://localhost:5000/api/auth/signup", formData);
        alert("Signup successful! Please login.");
        setIsSignup(false);
      } else {
        // Login request
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = res.data;

        // Save token & user in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/leads");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#0d6efd",
          }}
        >
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="rep">Sales Rep</option>
                <option value="manager">Manager</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: "none",
              border: "none",
              color: "#0d6efd",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isSignup ? "Login here" : "Sign up here"}
          </button>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "1rem",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Login;
