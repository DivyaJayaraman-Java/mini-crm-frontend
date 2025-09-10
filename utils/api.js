// utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL; // set in Vercel env

export const api = async (endpoint, method = "GET", body = null, auth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
};
