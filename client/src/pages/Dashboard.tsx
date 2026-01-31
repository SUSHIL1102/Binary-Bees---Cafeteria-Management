import { useState, useEffect } from "react";
import {
  getAvailability,
  createReservation,
  getMyReservations,
  cancelReservation,
} from "../api/client";

function formatDate(d: string) {
  return new Date(d + "Z").toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [availability, setAvailability] = useState<{
    date: string;
    totalSeats: number;
    taken: number;
    available: number;
    takenSeatNumbers: number[];
  } | null>(null);
  const [myReservations, setMyReservations] = useState<
    Array<{ id: string; date: string; seatNumber: number }>
  >([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingReserve, setLoadingReserve] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const fetchAvailability = async (d: string) => {
    const res = await getAvailability(d);
    if (res.data) setAvailability(res.data);
    else setAvailability(null);
  };

  const fetchMyReservations = async () => {
    setLoadingList(true);
    const res = await getMyReservations();
    setLoadingList(false);
    if (res.data) setMyReservations(res.data);
  };

  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoadingReserve(true);
    const res = await createReservation(date);
    setLoadingReserve(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    if (res.data) {
      setMessage({ type: "success", text: `Seat #${res.data.seatNumber} reserved for ${date}` });
      fetchAvailability(date);
      fetchMyReservations();
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this reservation?")) return;
    const res = await cancelReservation(id);
    if (res.status === 204) {
      setMessage({ type: "success", text: "Reservation cancelled." });
      fetchMyReservations();
      fetchAvailability(date);
    } else {
      setMessage({ type: "error", text: res.error ?? "Failed to cancel" });
    }
  };

  const myReservationForDate = myReservations.find((r) => r.date === date);

  return (
    <div className="container">
      <h1>Reserve a seat</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        One reservation per employee per day. Capacity: 100 seats.
      </p>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Availability</h2>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
        {availability && (
          <>
            <p>
              <span className="badge badge-success">{availability.available} available</span>
              <span style={{ marginLeft: "0.5rem", color: "var(--muted)" }}>
                {availability.taken} / {availability.totalSeats} taken
              </span>
            </p>
            {myReservationForDate ? (
              <p style={{ color: "var(--success)" }}>
                You have seat #{myReservationForDate.seatNumber} for this date.
              </p>
            ) : availability.available > 0 ? (
              <form onSubmit={handleReserve}>
                <button type="submit" className="btn btn-primary" disabled={loadingReserve}>
                  {loadingReserve ? "Reserving…" : "Reserve a seat"}
                </button>
              </form>
            ) : (
              <p style={{ color: "var(--warning)" }}>No seats available for this date.</p>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>My reservations</h2>
        {loadingList ? (
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        ) : myReservations.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No reservations yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {myReservations.map((r) => (
              <li
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>
                  {formatDate(r.date)} — Seat #{r.seatNumber}
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleCancel(r.id)}
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "var(--muted)" }}>
        API docs: <a href="/api-docs" target="_blank" rel="noopener noreferrer">Swagger UI</a> (run server and open from backend URL, e.g. http://localhost:3001/api-docs)
      </p>
    </div>
  );
}
