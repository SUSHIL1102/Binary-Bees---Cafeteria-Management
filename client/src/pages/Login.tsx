import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email.trim(), name.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data?.token && res.data?.employee) {
        setAuth(res.data.token, res.data.employee);
        navigate("/", { replace: true });
      }
    } catch (_e) {
      setError("Cannot reach server. Is the backend running on http://localhost:3001?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, marginTop: "3rem" }}>
        <h1 style={{ marginTop: 0 }}>Cafeteria Seat Reservation</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Sign in with your company credentials. (Local dev: use any email and name.)
        </p>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">{error}</div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          In production, this would use w3 SSO. See{" "}
          <a href="https://w3.ibm.com/w3publisher/w3idsso/boarding" target="_blank" rel="noopener noreferrer">
            w3 SSO boarding
          </a>.
        </p>
      </div>
    </div>
  );
}
