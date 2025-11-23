import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TEMP: naive login — replace with proper auth later
    if (form.username === "admin" && form.password === "admin") {
      // store token later
      navigate("/admin");
    } else {
      alert("Invalid credentials. Use admin / admin for now.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full border p-2 rounded" />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full border p-2 rounded" />
          <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
