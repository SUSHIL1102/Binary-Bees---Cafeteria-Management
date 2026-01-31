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
    <>
      <nav className="nav">
        <Link to="/">Cafeteria Seat Reservation</Link>
        <div>
          <span className="user">{employee?.name ?? employee?.email}</span>
          <button type="button" className="btn" onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
}
