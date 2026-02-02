import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/client";

type LoginMode = "choose" | "demo" | "ibm";

const CenterWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="container"
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("choose");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleDemoSubmit = async (e: React.FormEvent) => {
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
    } catch {
      setError("Cannot reach server. Is the backend running on http://localhost:3001?");
    } finally {
      setLoading(false);
    }
  };

  const handleIbmLogin = () => {
    setError("");
    window.location.href = "/api/auth/w3/login";
  };

  if (mode === "choose") {
    return (
      <CenterWrapper>
        <div className="card" style={{ maxWidth: 420, width: "100%" }}>
          <h1 style={{ marginTop: 0 }}>Cafeteria Seat Reservation</h1>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Choose how you want to sign in.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: "1rem", textAlign: "left" }}
              onClick={() => setMode("demo")}
            >
              <strong>Demo user</strong>
              <br />
              <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Sign in with email and name (local testing)
              </span>
            </button>

            <button
              type="button"
              className="btn"
              style={{ padding: "1rem", textAlign: "left" }}
              onClick={() => setMode("ibm")}
            >
              <strong>IBM employee</strong>
              <br />
              <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                Sign in with w3 SSO
              </span>
            </button>
          </div>
        </div>
      </CenterWrapper>
    );
  }

  if (mode === "ibm") {
    return (
      <CenterWrapper>
        <div className="card" style={{ maxWidth: 400, width: "100%" }}>
          <h1 style={{ marginTop: 0 }}>IBM w3 SSO</h1>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            You will be redirected to the company login page.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "0.5rem" }}
            onClick={handleIbmLogin}
          >
            Continue with w3 SSO
          </button>

          <button
            type="button"
            className="btn"
            style={{ width: "100%" }}
            onClick={() => {
              setMode("choose");
              setError("");
            }}
          >
            Back
          </button>
        </div>
      </CenterWrapper>
    );
  }

  // demo mode
  return (
    <CenterWrapper>
      <div className="card" style={{ maxWidth: 400, width: "100%" }}>
        <h1 style={{ marginTop: 0 }}>Demo user</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Sign in with any email and name for local testing.
        </p>

        <form onSubmit={handleDemoSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            className="btn"
            style={{ width: "100%" }}
            onClick={() => {
              setMode("choose");
              setError("");
            }}
          >
            Back
          </button>
        </form>
      </div>
    </CenterWrapper>
  );
}
