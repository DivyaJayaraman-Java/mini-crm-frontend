import { useRouter } from "next/router";
import { useState } from "react";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "rep" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call backend signup API
    const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "manager") router.push("/dashboard");
      else router.push("/leads");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="rep">Sales Rep</option>
        <option value="manager">Manager</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
