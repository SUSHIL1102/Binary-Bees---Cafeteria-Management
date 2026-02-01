import { useEffect, useState } from "react";

const TOTAL_SEATS = 100;

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch reservations
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

  // Seats already reserved for selected date
  const reservedSeatsForDate = reservations
    .filter(r => r.date === date)
    .map(r => r.seatNumber);

  // Create reservation
  const createReservation = async () => {
    setError("");

    if (!date || !selectedSeat) {
      setError("Please select a date and a seat.");
      return;
    }

    const res = await fetch("http://localhost:4000/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        date,
        seatNumber: selectedSeat
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Seat already booked.");
      return;
    }

    setSelectedSeat(null);
    fetchReservations();
  };

  // Delete reservation
  const deleteReservation = async (id) => {
    await fetch(`http://localhost:4000/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReservations();
  };

  return (
    <div>
      {/* Reserve Section */}
      <div style={card}>
        <h3 style={title}>🪑 Reserve a Seat</h3>

        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSeat(null);
            setError("");
          }}
          style={input}
        />

        {error && <div style={errorBanner}>{error}</div>}

        {date && (
          <>
            <p style={{ marginBottom: 8, fontSize: 14 }}>
              Select an available seat
            </p>

            <div style={seatGrid}>
              {[...Array(TOTAL_SEATS)].map((_, i) => {
                const seat = i + 1;
                const reserved = reservedSeatsForDate.includes(seat);
                const selected = seat === selectedSeat;

                return (
                  <button
                    key={seat}
                    disabled={reserved}
                    onClick={() => setSelectedSeat(seat)}
                    style={{
                      ...seatBtn,
                      background: reserved
                        ? "#e5e7eb"
                        : selected
                        ? "#2563eb"
                        : "#f9fafb",
                      color: selected ? "white" : "#111827",
                      cursor: reserved ? "not-allowed" : "pointer"
                    }}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>

            <button
              onClick={createReservation}
              disabled={!selectedSeat}
              style={{
                ...reserveBtn,
                opacity: selectedSeat ? 1 : 0.6
              }}
            >
              Reserve Seat {selectedSeat || ""}
            </button>
          </>
        )}
      </div>

      {/* My Reservations */}
      <div style={card}>
        <h3 style={title}>📋 My Reservations</h3>

        {loading ? (
          <p>Loading...</p>
        ) : reservations.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No reservations yet</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reservations.map(r => (
              <li key={r.id} style={listItem}>
                <span>
                  📅 {r.date} &nbsp; | &nbsp; 🪑 {r.seatNumber}
                </span>
                <button
                  onClick={() => deleteReservation(r.id)}
                  style={deleteBtn}
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

/* ================= STYLES ================= */

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  background: "#ffffff"
};

const title = {
  marginBottom: 12,
  fontSize: 18,
  fontWeight: 600
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db"
};

const seatGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(10, 1fr)",
  gap: 6,
  marginBottom: 16
};

const seatBtn = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
  transition: "all 0.2s ease"
};

const reserveBtn = {
  width: "100%",
  padding: 12,
  background: "#16a34a",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer"
};

const errorBanner = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  fontSize: 14
};

const listItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  background: "#f9fafb",
  borderRadius: 8,
  marginBottom: 8
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 16
};

export default Reservations;
