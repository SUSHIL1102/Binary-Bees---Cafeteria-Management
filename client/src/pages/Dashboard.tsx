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

  return (
    <div className="container">
      <h1>Reserve a seat</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Choose date, time slot (1 hour), and number of people. Capacity: 100 seats per slot.
      </p>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Step 1: Date, time slot, number of people */}
      {step === 1 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Select date, time & party size</h2>
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
            <label htmlFor="timeSlot">Time slot (1 hour)</label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}
            >
              {timeSlots.map((s) => (
                <option key={s} value={s}>{s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="numberOfPeople">Number of people</label>
            <input
              id="numberOfPeople"
              type="number"
              min={1}
              max={100}
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(Number(e.target.value) || 1)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}
            />
          </div>
          {availability && (
            <p style={{ marginBottom: "1rem", color: "var(--muted)" }}>
              {availability.available} seats available for this slot ({availability.taken} taken).
            </p>
          )}
          {alreadyBookedThisSlot ? (
            <p style={{ color: "var(--warning)" }}>You already have a reservation for this date and time slot.</p>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStep1Next}
              disabled={!availability || !hasEnoughSeats}
            >
              Next – Choose seats
            </button>
          )}
        </div>
      )}

      {/* Step 2: Seat map + confirm */}
      {step === 2 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Choose your seats</h2>
          <p>
            <strong>{date}</strong>, <strong>{timeSlot}</strong> (1 hour) · Select <strong>{numberOfPeople}</strong> seat{numberOfPeople > 1 ? "s" : ""}
          </p>
          {availability && (
            <>
              <p style={{ marginBottom: "0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                {availability.available} available · {availability.taken} taken
              </p>
              <SeatMap
                takenSeatNumbers={availability.takenSeatNumbers}
                selectedSeatNumbers={selectedSeatNumbers}
                onToggleSeat={handleToggleSeat}
                maxSelection={numberOfPeople}
              />
              {selectedSeatNumbers.length > 0 && (
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  Selected: #{selectedSeatNumbers.sort((a, b) => a - b).join(", #")}
                </p>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="button" className="btn" onClick={() => { setStep(1); setSelectedSeatNumbers([]); }}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmBooking}
              disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
            >
              {loading ? "Booking…" : `Confirm ${selectedSeatNumbers.length === numberOfPeople ? "booking" : `(${selectedSeatNumbers.length}/${numberOfPeople} seats)`}`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Booking confirmed, details + delete */}
      {step === 3 && confirmedReservation && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Booking confirmed</h2>
          <p style={{ color: "var(--success)" }}>Your reservation has been confirmed.</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
            <li><strong>Date:</strong> {formatDate(confirmedReservation.date)}</li>
            <li><strong>Time slot:</strong> {confirmedReservation.timeSlot} (1 hour)</li>
            <li><strong>Seats:</strong> #{confirmedReservation.seatNumbers.join(", #")}</li>
          </ul>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleCancel(confirmedReservation.id)}
            >
              Delete this reservation
            </button>
            <button type="button" className="btn btn-primary" onClick={startNewBooking}>
              Make another booking
            </button>
          </div>
        </div>
      )}

      {/* My reservations */}
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
                  flexWrap: "wrap",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>
                  {formatDate(r.date)} · {r.timeSlot} · Seat{r.seatNumbers.length > 1 ? "s" : ""} #{r.seatNumbers.join(", #")}
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
        API docs: <a href="/api-docs" target="_blank" rel="noopener noreferrer">Swagger UI</a>
      </p>
    </div>
  );
}







// import { useState, useEffect } from "react";
// import {
//   getTimeSlots,
//   getAvailability,
//   createReservation,
//   getMyReservations,
//   cancelReservation,
//   type ReservationItem,
// } from "../api/client";
// import SeatMap from "../components/SeatMap";

// function formatDate(d: string) {
//   return new Date(d + "Z").toLocaleDateString("en-IN", {
//     weekday: "short",
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// }

// type Step = 1 | 2 | 3;

// export default function Dashboard() {
//   const [step, setStep] = useState<Step>(1);
//   const [timeSlots, setTimeSlots] = useState<string[]>([]);
//   const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
//   const [timeSlot, setTimeSlot] = useState("");
//   const [numberOfPeople, setNumberOfPeople] = useState(1);

//   const [availability, setAvailability] = useState<{
//     date: string;
//     timeSlot: string;
//     totalSeats: number;
//     taken: number;
//     available: number;
//     takenSeatNumbers: number[];
//   } | null>(null);

//   const [confirmedReservation, setConfirmedReservation] = useState<{
//     id: string;
//     date: string;
//     timeSlot: string;
//     seatNumbers: number[];
//   } | null>(null);

//   const [myReservations, setMyReservations] = useState<ReservationItem[]>([]);
//   const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);
//   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [loadingList, setLoadingList] = useState(false);

//   // ------------------------
//   // Initial data
//   // ------------------------
//   useEffect(() => {
//     getTimeSlots().then((res) => {
//       if (res.data && res.data.length) {
//         setTimeSlots(res.data);
//         if (!timeSlot) setTimeSlot(res.data[0]);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (!timeSlot) return;
//     getAvailability(date, timeSlot).then((res) => {
//       if (res.data) setAvailability(res.data);
//       else setAvailability(null);
//     });
//   }, [date, timeSlot]);

//   const fetchMyReservations = async () => {
//     setLoadingList(true);
//     const res = await getMyReservations();
//     setLoadingList(false);
//     if (res.data) setMyReservations(res.data);
//   };

//   useEffect(() => {
//     fetchMyReservations();
//   }, []);

//   // ------------------------
//   // Step handlers
//   // ------------------------
//   const handleStep1Next = () => {
//     setMessage(null);
//     setSelectedSeatNumbers([]);
//     if (availability && availability.available >= numberOfPeople) {
//       setStep(2);
//     } else {
//       setMessage({
//         type: "error",
//         text: "Not enough seats for this slot. Pick another date or time.",
//       });
//     }
//   };

//   const handleToggleSeat = (seatNumber: number) => {
//     setSelectedSeatNumbers((prev) =>
//       prev.includes(seatNumber)
//         ? prev.filter((n) => n !== seatNumber)
//         : [...prev, seatNumber]
//     );
//   };

//   // ------------------------
//   // CREATE RESERVATION
//   // ------------------------
//   const handleConfirmBooking = async () => {
//     setMessage(null);
//     setLoading(true);

//     const res = await createReservation(
//       date,
//       timeSlot,
//       numberOfPeople,
//       selectedSeatNumbers.length === numberOfPeople
//         ? selectedSeatNumbers
//         : undefined
//     );

//     setLoading(false);

//     if (res.error || !res.data) {
//       setMessage({ type: "error", text: res.error ?? "Booking failed" });
//       return;
//     }

//     setConfirmedReservation(res.data.reservation);

//     setMessage({
//       type: "success",
//       text: `₹${res.data.managerCharge.amount} Blu Dollars deducted from ${res.data.managerCharge.managerName}'s account`,
//     });

//     setStep(3);
//     fetchMyReservations();
//   };

//   // ------------------------
//   // CANCEL RESERVATION
//   // ------------------------
//   const handleCancel = async (id: string) => {
//     if (!confirm("Cancel this reservation?")) return;

//     const res = await cancelReservation(id);

//     if (res.error || !res.data) {
//       setMessage({ type: "error", text: res.error ?? "Failed to cancel" });
//       return;
//     }

//     setMessage({
//       type: "success",
//       text: `₹${res.data.amount} Blu Dollars credited back to ${res.data.managerName}'s account`,
//     });

//     if (confirmedReservation?.id === id) {
//       setConfirmedReservation(null);
//     }

//     fetchMyReservations();

//     if (date && timeSlot) {
//       getAvailability(date, timeSlot).then(
//         (r) => r.data && setAvailability(r.data)
//       );
//     }
//   };

//   const startNewBooking = () => {
//     setStep(1);
//     setConfirmedReservation(null);
//     setMessage(null);
//   };

//   const hasEnoughSeats = availability && availability.available >= numberOfPeople;
//   const alreadyBookedThisSlot = myReservations.some(
//     (r) => r.date === date && r.timeSlot === timeSlot
//   );

//   // ------------------------
//   // RENDER
//   // ------------------------
//   return (
//     <div className="container">
//       <h1>Reserve a seat</h1>

//       <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
//         Choose date, time slot (1 hour), and number of people. Capacity: 100 seats per slot.
//       </p>

//       {message && (
//         <div className={`alert alert-${message.type}`}>
//           {message.text}
//         </div>
//       )}

//       {/* STEP 1 */}
//       {step === 1 && (
//         <div className="card">
//           <h2 style={{ marginTop: 0 }}>Select date, time & party size</h2>

//           <div className="form-group">
//             <label>Date</label>
//             <input
//               type="date"
//               value={date}
//               min={new Date().toISOString().slice(0, 10)}
//               onChange={(e) => setDate(e.target.value)}
//             />
//           </div>

//           <div className="form-group">
//             <label>Time slot (1 hour)</label>
//             <select
//               value={timeSlot}
//               onChange={(e) => setTimeSlot(e.target.value)}
//             >
//               {timeSlots.map((s) => (
//                 <option key={s} value={s}>
//                   {s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Number of people</label>
//             <input
//               type="number"
//               min={1}
//               max={100}
//               value={numberOfPeople}
//               onChange={(e) => setNumberOfPeople(Number(e.target.value) || 1)}
//             />
//           </div>

//           {availability && (
//             <p style={{ color: "var(--muted)" }}>
//               {availability.available} seats available ({availability.taken} taken)
//             </p>
//           )}

//           {alreadyBookedThisSlot ? (
//             <p style={{ color: "var(--warning)" }}>
//               You already have a reservation for this slot.
//             </p>
//           ) : (
//             <button
//               className="btn btn-primary"
//               disabled={!availability || !hasEnoughSeats}
//               onClick={handleStep1Next}
//             >
//               Next – Choose seats
//             </button>
//           )}
//         </div>
//       )}

//       {/* STEP 2 */}
//       {step === 2 && availability && (
//         <div className="card">
//           <h2>Choose your seats</h2>

//           <SeatMap
//             takenSeatNumbers={availability.takenSeatNumbers}
//             selectedSeatNumbers={selectedSeatNumbers}
//             onToggleSeat={handleToggleSeat}
//             maxSelection={numberOfPeople}
//           />

//           <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
//             <button className="btn" onClick={() => setStep(1)}>
//               Back
//             </button>
//             <button
//               className="btn btn-primary"
//               disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
//               onClick={handleConfirmBooking}
//             >
//               {loading ? "Booking…" : "Confirm booking"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* STEP 3 */}
//       {step === 3 && confirmedReservation && (
//         <div className="card">
//           <h2>Booking confirmed</h2>

//           <ul>
//             <li>Date: {formatDate(confirmedReservation.date)}</li>
//             <li>Time: {confirmedReservation.timeSlot}</li>
//             <li>Seats: #{confirmedReservation.seatNumbers.join(", #")}</li>
//           </ul>

//           <button
//             className="btn btn-danger"
//             onClick={() => handleCancel(confirmedReservation.id)}
//           >
//             Delete this reservation
//           </button>

//           <button
//             className="btn btn-primary"
//             style={{ marginLeft: "0.5rem" }}
//             onClick={startNewBooking}
//           >
//             Make another booking
//           </button>
//         </div>
//       )}

//       {/* MY RESERVATIONS */}
//       <div className="card">
//         <h2>My reservations</h2>

//         {loadingList ? (
//           <p>Loading…</p>
//         ) : myReservations.length === 0 ? (
//           <p>No reservations yet.</p>
//         ) : (
//           <ul>
//             {myReservations.map((r) => (
//               <li key={r.id}>
//                 {formatDate(r.date)} · {r.timeSlot} · #{r.seatNumbers.join(", #")}
//                 <button
//                   className="btn btn-danger"
//                   style={{ marginLeft: "0.5rem" }}
//                   onClick={() => handleCancel(r.id)}
//                 >
//                   Cancel
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
