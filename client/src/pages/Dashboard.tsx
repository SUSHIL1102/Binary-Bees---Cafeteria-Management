import { useState, useEffect } from "react";
import {
  getTimeSlots,
  getAvailability,
  createReservation,
  getMyReservations,
  cancelReservation,
  type ReservationItem,
} from "../api/client";
import SeatMap from "../components/SeatMap";

function formatDate(d: string) {
  return new Date(d + "Z").toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Step = 1 | 2 | 3;

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [availability, setAvailability] = useState<{
    date: string;
    timeSlot: string;
    totalSeats: number;
    taken: number;
    available: number;
    takenSeatNumbers: number[];
  } | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<{
    id: string;
    date: string;
    timeSlot: string;
    seatNumbers: number[];
  } | null>(null);
  const [myReservations, setMyReservations] = useState<ReservationItem[]>([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    getTimeSlots().then((res) => {
      if (res.data && res.data.length) {
        setTimeSlots(res.data);
        if (!timeSlot) setTimeSlot(res.data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!timeSlot) return;
    getAvailability(date, timeSlot).then((res) => {
      if (res.data) setAvailability(res.data);
      else setAvailability(null);
    });
  }, [date, timeSlot]);

  const fetchMyReservations = async () => {
    setLoadingList(true);
    const res = await getMyReservations();
    setLoadingList(false);
    if (res.data) setMyReservations(res.data);
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const handleStep1Next = () => {
    setMessage(null);
    setSelectedSeatNumbers([]);
    if (availability && availability.available >= numberOfPeople) setStep(2);
    else setMessage({ type: "error", text: "Not enough seats for this slot. Pick another date or time." });
  };

  const handleToggleSeat = (seatNumber: number) => {
    setSelectedSeatNumbers((prev) =>
      prev.includes(seatNumber) ? prev.filter((n) => n !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleConfirmBooking = async () => {
    setMessage(null);
    setLoading(true);
    const res = await createReservation(
      date,
      timeSlot,
      numberOfPeople,
      selectedSeatNumbers.length === numberOfPeople ? selectedSeatNumbers : undefined
    );
    setLoading(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    if (res.data) {
      setConfirmedReservation(res.data);
      setStep(3);
      fetchMyReservations();
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this reservation?")) return;
    const res = await cancelReservation(id);
    if (res.status === 204) {
      setMessage({ type: "success", text: "Reservation cancelled." });
      if (confirmedReservation?.id === id) setConfirmedReservation(null);
      fetchMyReservations();
      if (date && timeSlot) getAvailability(date, timeSlot).then((r) => r.data && setAvailability(r.data));
    } else {
      setMessage({ type: "error", text: res.error ?? "Failed to cancel" });
    }
  };

  const startNewBooking = () => {
    setStep(1);
    setConfirmedReservation(null);
    setMessage(null);
  };

  const hasEnoughSeats = availability && availability.available >= numberOfPeople;
  const alreadyBookedThisSlot = myReservations.some((r) => r.date === date && r.timeSlot === timeSlot);

  // Progress indicator component
  const ProgressSteps = () => (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: "1rem",
      marginBottom: "2rem",
      padding: "1rem",
      background: "rgba(192, 138, 74, 0.05)",
      borderRadius: "var(--radius)",
      border: "1px solid rgba(192, 138, 74, 0.15)"
    }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: step >= s ? "linear-gradient(135deg, var(--accent) 0%, #b37a3f 100%)" : "var(--surface)",
            border: step >= s ? "2px solid var(--accent)" : "2px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: step >= s ? "var(--bg)" : "var(--muted)",
            fontWeight: "700",
            fontSize: "0.9rem",
            transition: "all 0.3s ease",
            boxShadow: step === s ? "0 0 0 4px rgba(192, 138, 74, 0.2)" : "none"
          }}>
            {step > s ? "✓" : s}
          </div>
          <span style={{
            fontSize: "0.85rem",
            color: step >= s ? "var(--text)" : "var(--muted)",
            fontWeight: step === s ? "600" : "400"
          }}>
            {s === 1 ? "Details" : s === 2 ? "Seats" : "Confirm"}
          </span>
          {s < 3 && (
            <div style={{
              width: "40px",
              height: "2px",
              background: step > s ? "var(--accent)" : "var(--border)",
              marginLeft: "0.5rem",
              transition: "all 0.3s ease"
            }} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      {/* Header with gradient */}
      <div style={{
        textAlign: "center",
        marginBottom: "2rem",
        padding: "2rem 1rem",
        background: "linear-gradient(135deg, rgba(192, 138, 74, 0.1) 0%, rgba(95, 143, 115, 0.05) 100%)",
        borderRadius: "var(--radius)",
        border: "1px solid rgba(192, 138, 74, 0.2)"
      }}>
        <h1 style={{ marginBottom: "0.5rem" }}>☕ Reserve Your Seat</h1>
        <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
          Choose your preferred date, time slot, and seats. Enjoy your meal in comfort!
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {step < 3 && <ProgressSteps />}

      {/* Step 1: Date, time slot, number of people */}
      {step === 1 && (
        <div className="card">
          <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}></span>
            Select Date, Time & Party Size
          </h2>
          
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

          <div className="form-group">
            <label htmlFor="timeSlot">Time Slot (1 hour)</label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "0.65rem 0.9rem", 
                border: "1px solid var(--border)", 
                borderRadius: "var(--radius)", 
                background: "var(--bg)", 
                color: "var(--text)",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)"
              }}
            >
              {timeSlots.map((s) => (
                <option key={s} value={s}>
                  {s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numberOfPeople">Number of People</label>
            <input
              id="numberOfPeople"
              type="number"
              min={1}
              max={100}
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(Number(e.target.value) || 1)}
              style={{ 
                width: "100%", 
                padding: "0.65rem 0.9rem", 
                border: "1px solid var(--border)", 
                borderRadius: "var(--radius)", 
                background: "var(--bg)", 
                color: "var(--text)",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)"
              }}
            />
          </div>

          {availability && (
            <div style={{
              padding: "1rem",
              background: hasEnoughSeats 
                ? "linear-gradient(135deg, rgba(95, 143, 115, 0.1) 0%, rgba(95, 143, 115, 0.05) 100%)"
                : "linear-gradient(135deg, rgba(194, 95, 90, 0.1) 0%, rgba(194, 95, 90, 0.05) 100%)",
              borderRadius: "var(--radius)",
              border: `1px solid ${hasEnoughSeats ? "rgba(95, 143, 115, 0.3)" : "rgba(194, 95, 90, 0.3)"}`,
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: hasEnoughSeats ? "var(--success)" : "var(--error)" }}>
                  {availability.available}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>seats available</div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--muted)" }}>
                  {availability.taken}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>seats taken</div>
              </div>
            </div>
          )}

          {alreadyBookedThisSlot ? (
            <div style={{
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(209, 162, 95, 0.15) 0%, rgba(209, 162, 95, 0.05) 100%)",
              border: "1px solid var(--warning)",
              borderRadius: "var(--radius)",
              color: "var(--warning)",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <span style={{ fontSize: "1.25rem" }}></span>
              <span>You already have a reservation for this date and time slot.</span>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStep1Next}
              disabled={!availability || !hasEnoughSeats}
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
            >
              Next – Choose Seats →
            </button>
          )}
        </div>
      )}

      {/* Step 2: Seat map + confirm */}
      {step === 2 && (
        <div className="card">
          <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}></span>
            Choose Your Seats
          </h2>
          
          <div style={{
            padding: "1rem",
            background: "linear-gradient(135deg, rgba(192, 138, 74, 0.1) 0%, rgba(192, 138, 74, 0.05) 100%)",
            borderRadius: "var(--radius)",
            border: "1px solid rgba(192, 138, 74, 0.2)",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Date & Time</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text)" }}>
                  {formatDate(date)}, {timeSlot}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Party Size</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--accent)" }}>
                  {numberOfPeople} {numberOfPeople > 1 ? "people" : "person"}
                </div>
              </div>
            </div>
          </div>

          {availability && (
            <>
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
                marginBottom: "1rem",
                fontSize: "0.9rem"
              }}>
                <div style={{ color: "var(--success)" }}>
                  <strong>{availability.available}</strong> available
                </div>
                <div style={{ color: "var(--error)" }}>
                  <strong>{availability.taken}</strong> taken
                </div>
              </div>
              
              <SeatMap
                takenSeatNumbers={availability.takenSeatNumbers}
                selectedSeatNumbers={selectedSeatNumbers}
                onToggleSeat={handleToggleSeat}
                maxSelection={numberOfPeople}
              />
              
              {selectedSeatNumbers.length > 0 && (
                <div style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "linear-gradient(135deg, rgba(192, 138, 74, 0.15) 0%, rgba(192, 138, 74, 0.05) 100%)",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(192, 138, 74, 0.3)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                    Selected Seats
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--accent)" }}>
                    #{selectedSeatNumbers.sort((a, b) => a - b).join(", #")}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button 
              type="button" 
              className="btn" 
              onClick={() => { setStep(1); setSelectedSeatNumbers([]); }}
              style={{ flex: "0 0 auto", minWidth: "100px" }}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmBooking}
              disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
              style={{ flex: "1", padding: "0.85rem", fontSize: "1rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ marginRight: "0.5rem" }} />
                  Booking...
                </>
              ) : selectedSeatNumbers.length === numberOfPeople ? (
                `Confirm Booking ✓`
              ) : (
                `Select ${numberOfPeople - selectedSeatNumbers.length} More Seat${numberOfPeople - selectedSeatNumbers.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Booking confirmed */}
      {step === 3 && confirmedReservation && (
        <div className="card" style={{
          background: "linear-gradient(145deg, rgba(95, 143, 115, 0.1) 0%, var(--surface) 100%)",
          borderColor: "rgba(95, 143, 115, 0.3)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>✓</div>
            <h2 style={{ marginTop: 0, marginBottom: "0.5rem", color: "var(--success)" }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: "var(--muted)" }}>Your reservation has been successfully confirmed.</p>
          </div>

          <div style={{
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            padding: "1.5rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Date</span>
                <span style={{ fontWeight: "600", fontSize: "1.05rem" }}>{formatDate(confirmedReservation.date)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Time Slot</span>
                <span style={{ fontWeight: "600", fontSize: "1.05rem" }}>{confirmedReservation.timeSlot}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Seats</span>
                <span style={{ fontWeight: "600", fontSize: "1.05rem", color: "var(--accent)" }}>
                  #{confirmedReservation.seatNumbers.join(", #")}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleCancel(confirmedReservation.id)}
              style={{ flex: "1", minWidth: "160px" }}
            >
              Cancel Reservation
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={startNewBooking}
              style={{ flex: "1", minWidth: "160px" }}
            >
              Make Another Booking
            </button>
          </div>
        </div>
      )}

      {/* My reservations */}
      <div className="card">
        <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}></span>
          My Reservations
        </h2>
        
        {loadingList ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
            <div className="spinner" style={{ width: "32px", height: "32px", borderWidth: "3px", margin: "0 auto 1rem" }} />
            <p>Loading reservations...</p>
          </div>
        ) : myReservations.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem", 
            color: "var(--muted)",
            background: "rgba(192, 138, 74, 0.05)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem", opacity: 0.5 }}>🪑</div>
            <p>No reservations yet. Make your first booking above!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {myReservations.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                  padding: "1rem",
                  background: "linear-gradient(145deg, rgba(192, 138, 74, 0.05) 0%, transparent 100%)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(192, 138, 74, 0.4)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    {formatDate(r.date)}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                    {r.timeSlot} · Seat{r.seatNumbers.length > 1 ? "s" : ""} <span style={{ color: "var(--accent)", fontWeight: "600" }}>#{r.seatNumbers.join(", #")}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleCancel(r.id)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: "2rem", 
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.85rem", 
        color: "var(--muted)",
        background: "rgba(192, 138, 74, 0.05)",
        borderRadius: "var(--radius)",
        border: "1px solid rgba(192, 138, 74, 0.1)"
      }}>
        <p style={{ margin: "0 0 0.5rem 0" }}>
          Need help? Check our <a href="/api-docs" target="_blank" rel="noopener noreferrer">API Documentation</a>
        </p>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Capacity: 100 seats per hour slot
        </p>
      </div>
    </div>
  );
}