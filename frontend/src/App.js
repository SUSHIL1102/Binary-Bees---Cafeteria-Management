import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const userParam = params.get("user");

    // 🔥 THIS IS THE MISSING PART
    if (token && userParam) {
      localStorage.setItem("token", token);

      const parsedUser = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem("user", JSON.stringify(parsedUser));

      setUser(parsedUser);

      // clean URL
      window.history.replaceState({}, document.title, "/");
      return;
    }

    // page refresh case
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f3f4f6"
    }}>
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 8,
        width: 400
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Cafeteria Management
        </h2>

        {!user ? (
          <button
            onClick={login}
            style={{
              width: "100%",
              padding: 10,
              background: "#2563eb",
              color: "white",
              borderRadius: 4
            }}
          >
            Login with W3 SSO
          </button>
        ) : (
          <>
            <h3>Employee Details</h3>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>W3 ID:</b> {user.w3id}</p>

            <button
              onClick={logout}
              style={{
                marginTop: 16,
                width: "100%",
                padding: 10,
                background: "#dc2626",
                color: "white",
                borderRadius: 4
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
