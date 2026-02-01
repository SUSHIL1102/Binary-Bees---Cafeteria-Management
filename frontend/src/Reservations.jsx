import { useEffect, useState } from "react";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/reservations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReservations();
  }, [token]);

  const createReservation = async () => {
    if (!date || !seatNumber) {
      alert("Date and seat number required");
      return;
    }

    const res = await fetch("http://localhost:4000/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date, seatNumber: Number(seatNumber) })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to reserve");
      return;
    }

    setDate("");
    setSeatNumber("");
    fetchReservations();
  };

  const deleteReservation = async (id) => {
    await fetch(`http://localhost:4000/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReservations();
  };

  return (
    <div>
      {/* Reservation Form */}
      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20
      }}>
        <h3 style={{ marginBottom: 12 }}>🪑 Reserve a Seat</h3>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />

          <input
            type="number"
            placeholder="Seat No"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />

          <button
            onClick={createReservation}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              cursor: "pointer"
            }}
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 16
      }}>
        <h3 style={{ marginBottom: 12 }}>📋 My Reservations</h3>

        {loading ? (
          <p>Loading...</p>
        ) : reservations.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No reservations yet</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reservations.map((r) => (
              <li
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  background: "#f9fafb",
                  borderRadius: 6,
                  marginBottom: 8
                }}
              >
                <span>
                  📅 {r.date} &nbsp; | &nbsp; 🪑 {r.seatNumber}
                </span>
                <button
                  onClick={() => deleteReservation(r.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontSize: 16
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Reservations;
