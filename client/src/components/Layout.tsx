import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <span className="nav-logo">BB</span>
            <span className="nav-brand-text">
              Binary Bees
              <span className="nav-brand-sub">Cafeteria seat reservations</span>
            </span>
          </Link>
        </div>
        <div className="nav-right">
          <span className="user">
            {employee?.name ?? employee?.email}
          </span>
          <button
            type="button"
            className="btn"
            onClick={handleLogout}
            style={{ marginLeft: "0.75rem" }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
