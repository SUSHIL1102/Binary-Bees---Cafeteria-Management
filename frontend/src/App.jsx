import { useEffect, useState } from "react";
import Reservations from "./Reservations";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token && userParam) {
      localStorage.setItem("token", token);
      const parsedUser = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem("user", JSON.stringify(parsedUser));
      setUser(parsedUser);
      window.history.replaceState({}, document.title, "/");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = () => {
    window.location.href = "http://localhost:4000/auth/login";
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e5e7eb, #f9fafb)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        background: "#ffffff",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: 24,
          fontSize: 22,
          fontWeight: 600
        }}>
          🍽️ Cafeteria Seat Management
        </h2>

        {!user ? (
          <button
            onClick={login}
            style={{
              width: "100%",
              padding: 12,
              background: "#2563eb",
              color: "white",
              borderRadius: 8,
              border: "none",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Login with W3 SSO
          </button>
        ) : (
          <>
            {/* Employee Card */}
            <div style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
              marginBottom: 20
            }}>
              <h3 style={{ marginBottom: 8 }}>👤 Employee Details</h3>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>W3 ID:</b> {user.w3id}</p>
            </div>

            <Reservations />

            <button
              onClick={logout}
              style={{
                marginTop: 20,
                width: "100%",
                padding: 10,
                background: "#dc2626",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
