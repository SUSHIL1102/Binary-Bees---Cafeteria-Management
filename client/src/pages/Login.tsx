import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/client";

type LoginMode = "choose" | "demo" | "ibm";

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
    } catch (_e) {
      setError("Cannot reach server. Is the backend running on http://localhost:3001?");
    } finally {
      setLoading(false);
    }
  };

  const handleIbmLogin = () => {
    setError("");
    // Redirect to backend w3 SSO login; backend will redirect to w3, then back to /auth/callback with token
    window.location.href = "/api/auth/w3/login";
  };

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="auth-hero-tagline">
          <span className="auth-hero-tagline-dot" />
          Smart cafeteria bookings
        </div>
        <h1 className="auth-hero-heading">Reserve your perfect cafeteria spot in seconds.</h1>
        <p className="auth-hero-subtitle">
          Avoid the rush, sit with your team, and keep track of your reservations with a clear, visual seat map.
        </p>
      </section>

      <section className="auth-panel-wrapper">
        <div className="auth-panel">
          {mode === "choose" && (
            <div className="card">
              <h1 className="auth-panel-title">Sign in to reserve seats</h1>
              <p className="auth-panel-subtitle">
                Choose how you want to sign in and start booking cafeteria seats for you and your team.
              </p>
              <div className="auth-mode-list">
                <button
                  type="button"
                  className="btn auth-mode-card"
                  onClick={() => setMode("demo")}
                >
                  <div className="auth-mode-title">
                    Demo user
                    <span className="auth-mode-pill">Great for testing</span>
                  </div>
                  <div className="auth-mode-description">
                    Sign in with any email and name to quickly try the app in a local or demo environment.
                  </div>
                </button>
                <button
                  type="button"
                  className="btn auth-mode-card"
                  onClick={() => setMode("ibm")}
                >
                  <div className="auth-mode-title">
                    IBM employee
                  </div>
                  <div className="auth-mode-description">
                    Use your corporate w3 SSO account to sign in securely through the company login page.
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "ibm" && (
            <div className="card">
              <h1 className="auth-panel-title">Sign in with w3 SSO</h1>
              <p className="auth-panel-subtitle">
                You will be redirected to the IBM w3 login page to authenticate with your company credentials.
              </p>
              {error && <div className="alert alert-error">{error}</div>}
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "0.5rem" }}
                onClick={handleIbmLogin}
              >
                Continue to w3 SSO
              </button>
              <div className="auth-back-link">
                Prefer another option?
                <button
                  type="button"
                  className="auth-back-link-button"
                  onClick={() => {
                    setMode("choose");
                    setError("");
                  }}
                >
                  Go back to sign-in methods
                </button>
              </div>
            </div>
          )}

          {mode === "demo" && (
            <div className="card">
              <h1 className="auth-panel-title">Demo user sign-in</h1>
              <p className="auth-panel-subtitle">
                Use any email and name to explore the full reservation experience in a safe demo mode.
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                >
                  {loading ? "Signing in…" : "Sign in as demo user"}
                </button>
              </form>
              <div className="auth-back-link">
                Want to switch method?
                <button
                  type="button"
                  className="auth-back-link-button"
                  onClick={() => {
                    setMode("choose");
                    setError("");
                  }}
                >
                  Choose a different sign-in
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
