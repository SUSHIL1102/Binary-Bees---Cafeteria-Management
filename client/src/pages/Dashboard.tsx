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

//   const handleStep1Next = () => {
//     setMessage(null);
//     setSelectedSeatNumbers([]);
//     if (availability && availability.available >= numberOfPeople) setStep(2);
//     else setMessage({ type: "error", text: "Not enough seats for this slot. Pick another date or time." });
//   };

//   const handleToggleSeat = (seatNumber: number) => {
//     setSelectedSeatNumbers((prev) =>
//       prev.includes(seatNumber) ? prev.filter((n) => n !== seatNumber) : [...prev, seatNumber]
//     );
//   };

//   const handleConfirmBooking = async () => {
//     setMessage(null);
//     setLoading(true);
//     const res = await createReservation(
//       date,
//       timeSlot,
//       numberOfPeople,
//       selectedSeatNumbers.length === numberOfPeople ? selectedSeatNumbers : undefined
//     );
//     setLoading(false);
//     if (res.error) {
//       setMessage({ type: "error", text: res.error });
//       return;
//     }
//     if (res.data) {
//       setConfirmedReservation(res.data);
//       setStep(3);
//       fetchMyReservations();
//     }
//   };

//   const handleCancel = async (id: string) => {
//     if (!confirm("Cancel this reservation?")) return;
//     const res = await cancelReservation(id);
//     if (res.status === 204) {
//       setMessage({ type: "success", text: "Reservation cancelled." });
//       if (confirmedReservation?.id === id) setConfirmedReservation(null);
//       fetchMyReservations();
//       if (date && timeSlot) getAvailability(date, timeSlot).then((r) => r.data && setAvailability(r.data));
//     } else {
//       setMessage({ type: "error", text: res.error ?? "Failed to cancel" });
//     }
//   };

//   const startNewBooking = () => {
//     setStep(1);
//     setConfirmedReservation(null);
//     setMessage(null);
//   };

//   const hasEnoughSeats = availability && availability.available >= numberOfPeople;
//   const alreadyBookedThisSlot = myReservations.some((r) => r.date === date && r.timeSlot === timeSlot);

//   return (
//     <div className="container">
//       <h1>Reserve a seat</h1>
//       <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
//         Choose date, time slot (1 hour), and number of people. Capacity: 100 seats per slot.
//       </p>

//       {message && (
//         <div className={`alert alert-${message.type}`}>{message.text}</div>
//       )}

//       {/* Step 1: Date, time slot, number of people */}
//       {step === 1 && (
//         <div className="card">
//           <h2 style={{ marginTop: 0 }}>Select date, time & party size</h2>
//           <div className="form-group">
//             <label htmlFor="date">Date</label>
//             <input
//               id="date"
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               min={new Date().toISOString().slice(0, 10)}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="timeSlot">Time slot (1 hour)</label>
//             <select
//               id="timeSlot"
//               value={timeSlot}
//               onChange={(e) => setTimeSlot(e.target.value)}
//               style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}
//             >
//               {timeSlots.map((s) => (
//                 <option key={s} value={s}>{s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="numberOfPeople">Number of people</label>
//             <input
//               id="numberOfPeople"
//               type="number"
//               min={1}
//               max={100}
//               value={numberOfPeople}
//               onChange={(e) => setNumberOfPeople(Number(e.target.value) || 1)}
//               style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)" }}
//             />
//           </div>
//           {availability && (
//             <p style={{ marginBottom: "1rem", color: "var(--muted)" }}>
//               {availability.available} seats available for this slot ({availability.taken} taken).
//             </p>
//           )}
//           {alreadyBookedThisSlot ? (
//             <p style={{ color: "var(--warning)" }}>You already have a reservation for this date and time slot.</p>
//           ) : (
//             <button
//               type="button"
//               className="btn btn-primary"
//               onClick={handleStep1Next}
//               disabled={!availability || !hasEnoughSeats}
//             >
//               Next – Choose seats
//             </button>
//           )}
//         </div>
//       )}

//       {/* Step 2: Seat map + confirm */}
//       {step === 2 && (
//         <div className="card">
//           <h2 style={{ marginTop: 0 }}>Choose your seats</h2>
//           <p>
//             <strong>{date}</strong>, <strong>{timeSlot}</strong> (1 hour) · Select <strong>{numberOfPeople}</strong> seat{numberOfPeople > 1 ? "s" : ""}
//           </p>
//           {availability && (
//             <>
//               <p style={{ marginBottom: "0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>
//                 {availability.available} available · {availability.taken} taken
//               </p>
//               <SeatMap
//                 takenSeatNumbers={availability.takenSeatNumbers}
//                 selectedSeatNumbers={selectedSeatNumbers}
//                 onToggleSeat={handleToggleSeat}
//                 maxSelection={numberOfPeople}
//               />
//               {selectedSeatNumbers.length > 0 && (
//                 <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
//                   Selected: #{selectedSeatNumbers.sort((a, b) => a - b).join(", #")}
//                 </p>
//               )}
//             </>
//           )}
//           <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
//             <button type="button" className="btn" onClick={() => { setStep(1); setSelectedSeatNumbers([]); }}>
//               Back
//             </button>
//             <button
//               type="button"
//               className="btn btn-primary"
//               onClick={handleConfirmBooking}
//               disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
//             >
//               {loading ? "Booking…" : `Confirm ${selectedSeatNumbers.length === numberOfPeople ? "booking" : `(${selectedSeatNumbers.length}/${numberOfPeople} seats)`}`}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Step 3: Booking confirmed, details + delete */}
//       {step === 3 && confirmedReservation && (
//         <div className="card">
//           <h2 style={{ marginTop: 0 }}>Booking confirmed</h2>
//           <p style={{ color: "var(--success)" }}>Your reservation has been confirmed.</p>
//           <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0" }}>
//             <li><strong>Date:</strong> {formatDate(confirmedReservation.date)}</li>
//             <li><strong>Time slot:</strong> {confirmedReservation.timeSlot} (1 hour)</li>
//             <li><strong>Seats:</strong> #{confirmedReservation.seatNumbers.join(", #")}</li>
//           </ul>
//           <div style={{ display: "flex", gap: "0.5rem" }}>
//             <button
//               type="button"
//               className="btn btn-danger"
//               onClick={() => handleCancel(confirmedReservation.id)}
//             >
//               Delete this reservation
//             </button>
//             <button type="button" className="btn btn-primary" onClick={startNewBooking}>
//               Make another booking
//             </button>
//           </div>
//         </div>
//       )}

//       {/* My reservations */}
//       <div className="card">
//         <h2 style={{ marginTop: 0 }}>My reservations</h2>
//         {loadingList ? (
//           <p style={{ color: "var(--muted)" }}>Loading…</p>
//         ) : myReservations.length === 0 ? (
//           <p style={{ color: "var(--muted)" }}>No reservations yet.</p>
//         ) : (
//           <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//             {myReservations.map((r) => (
//               <li
//                 key={r.id}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   flexWrap: "wrap",
//                   padding: "0.5rem 0",
//                   borderBottom: "1px solid var(--border)",
//                 }}
//               >
//                 <span>
//                   {formatDate(r.date)} · {r.timeSlot} · Seat{r.seatNumbers.length > 1 ? "s" : ""} #{r.seatNumbers.join(", #")}
//                 </span>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={() => handleCancel(r.id)}
//                   style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem" }}
//                 >
//                   Cancel
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "var(--muted)" }}>
//         API docs: <a href="/api-docs" target="_blank" rel="noopener noreferrer">Swagger UI</a>
//       </p>
//     </div>
//   );
// }








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

// /* ------------------ helpers ------------------ */
// function formatDate(d: string) {
//   return new Date(d + "Z").toLocaleDateString("en-IN", {
//     weekday: "short",
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// }

// type Step = 1 | 2 | 3;

// /* ------------------ shared UI classes ------------------ */
// const glassCard =
//   "border border-white/30 bg-white/15 backdrop-blur-xl shadow-2xl rounded-xl p-4 sm:p-6";

// const primaryButton =
//   "bg-warm-600 text-black hover:bg-warm-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none";

// const secondaryButton =
//   "bg-white/80 text-black border border-warm-600 hover:bg-warm-100 transition-all duration-200 hover:shadow-md";

// const dangerButton =
//   "bg-red-500/90 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-lg";

// /* ================== COMPONENT ================== */
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

//   /* ------------------ effects ------------------ */
//   useEffect(() => {
//     getTimeSlots().then((res) => {
//       if (res.data?.length) {
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

//   /* ------------------ handlers ------------------ */
//   const handleStep1Next = () => {
//     setMessage(null);
//     setSelectedSeatNumbers([]);
//     if (availability && availability.available >= numberOfPeople) {
//       setStep(2);
//     } else {
//       setMessage({
//         type: "error",
//         text: "Not enough seats available for this slot.",
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

//     if (res.error) {
//       setMessage({ type: "error", text: res.error });
//       return;
//     }

//     if (res.data) {
//       setConfirmedReservation(res.data);
//       setStep(3);
//       fetchMyReservations();
//     }
//   };

//   const handleCancel = async (id: string) => {
//     if (!confirm("Cancel this reservation?")) return;
//     const res = await cancelReservation(id);
//     if (res.status === 204) {
//       setMessage({ type: "success", text: "Reservation cancelled." });
//       fetchMyReservations();
//     }
//   };

//   const startNewBooking = () => {
//     setStep(1);
//     setConfirmedReservation(null);
//     setMessage(null);
//   };

//   const hasEnoughSeats = availability && availability.available >= numberOfPeople;

//   /* ================== UI ================== */
//   return (
//     <div
//       className="relative min-h-screen w-full bg-cover bg-center"
//       style={{ backgroundImage: "url(/cafeteria-bg.jpg)" }}
//     >
//       {/* overlay */}
//       <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

//       {/* content */}
//       <div className="relative z-10 mx-auto max-w-5xl p-4 sm:p-6 space-y-6">

//         {/* header */}
//         <div className="text-center">
//           <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
//             Reserve a Seat
//           </h1>
//           <p className="mt-2 text-warm-100 text-sm sm:text-base">
//             Choose date, time slot & number of people
//           </p>
//         </div>

//         {message && (
//           <div
//             className={`rounded-md px-4 py-2 ${
//               message.type === "error"
//                 ? "bg-red-500/20 text-red-700"
//                 : "bg-green-500/20 text-green-700"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         {/* STEP 1 */}
//         {step === 1 && (
//           <div className={glassCard}>
//             <h2 className="text-xl sm:text-3xl font-semibold text-black mb-4">
//               Select date, time & party size
//             </h2>

//             <div className="grid gap-4 sm:grid-cols-3">
//               <div>
//                 <label className="text-black/70 text-xl">Date</label>
//                 <input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="w-full rounded-md border p-2 text-black/70"
//                 />
//               </div>

//               <div>
//                 <label className="text-xl text-black/70">Time slot</label>
//                 <select
//                   value={timeSlot}
//                   onChange={(e) => setTimeSlot(e.target.value)}
//                   className="w-full rounded-md border p-2 text-black/70"
//                 >
//                   {timeSlots.map((s) => (
//                     <option key={s} value={s}>
//                       {s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-xl text-black/70">People</label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={100}
//                   value={numberOfPeople}
//                   onChange={(e) => setNumberOfPeople(Number(e.target.value))}
//                   className="w-full rounded-md border p-2 text-black/70"
//                 />
//               </div>
//             </div>

//             {availability && (
//               <p className="mt-3 text-sm text-black/70">
//                 {availability.available} available · {availability.taken} taken
//               </p>
//             )}

//             <button
//               onClick={handleStep1Next}
//               disabled={!hasEnoughSeats}
//               className={`mt-4 w-full py-2 rounded-md bg-white border-2 ${primaryButton}`}
//             >
//               Next – Choose seats
//             </button>
//           </div>
//         )}

//         {/* STEP 2 */}
//         {step === 2 && (
//           <div className={glassCard}>
//             <h2 className="text-xl sm:text-4xl font-semibold text-black mb-2">
//               Choose your seats
//             </h2>

//             <SeatMap
//               takenSeatNumbers={availability?.takenSeatNumbers ?? []}
//               selectedSeatNumbers={selectedSeatNumbers}
//               onToggleSeat={handleToggleSeat}
//               maxSelection={numberOfPeople}
//             />

//             <div className="flex flex-col sm:flex-row gap-3 mt-4">
//               <button
//                 className={`py-2 px-4 rounded-md ${secondaryButton}`}
//                 onClick={() => setStep(1)}
//               >
//                 Back
//               </button>
//               <button
//                 className={`py-2 px-4 rounded-md bg-white border-1 ${primaryButton}`}
//                 onClick={handleConfirmBooking}
//                 disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
//               >
//                 {loading ? "Booking…" : "Confirm booking"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* STEP 3 */}
//         {step === 3 && confirmedReservation && (
//           <div className={glassCard}>
//             <h2 className="text-xl sm:text-2xl font-semibold text-black">
//               Booking confirmed 
//             </h2>

//             <ul className="mt-3 text-black/80 text-sm sm:text-base">
//               <li>Date: {formatDate(confirmedReservation.date)}</li>
//               <li>Time: {confirmedReservation.timeSlot}</li>
//               <li>Seats: #{confirmedReservation.seatNumbers.join(", #")}</li>
//             </ul>

//             <div className="flex flex-col sm:flex-row gap-3 mt-4">
//               <button
//                 onClick={() => handleCancel(confirmedReservation.id)}
//                 className={`py-2 px-4 rounded-md ${dangerButton}`}
//               >
//                 Cancel reservation
//               </button>
//               <button
//                 onClick={startNewBooking}
//                 className={`py-2 px-4 border-2 rounded-md ${primaryButton}`}
//               >
//                 Make another booking
//               </button>
//             </div>
//           </div>
//         )}

//         {/* MY RESERVATIONS */}
//         <div className={glassCard}>
//           <h2 className="text-xl sm:text-2xl font-semibold text-black mb-3">
//             My reservations
//           </h2>

//           {loadingList ? (
//             <p className="text-black/60">Loading…</p>
//           ) : myReservations.length === 0 ? (
//             <p className="text-black/60">No reservations yet.</p>
//           ) : (
//             <ul className="space-y-2">
//               {myReservations.map((r) => (
//                 <li
//                   key={r.id}
//                   className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b pb-2"
//                 >
//                   <span className="text-black/80 text-sm sm:text-base">
//                     {formatDate(r.date)} · {r.timeSlot} · #{r.seatNumbers.join(", #")}
//                   </span>
//                   <button
//                     onClick={() => handleCancel(r.id)}
//                     className={`px-3 py-1 rounded-md text-sm ${dangerButton}`}
//                   >
//                     Cancel
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }





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
import { toast } from "react-toastify";

/* ------------------ helpers ------------------ */
function formatDate(d: string) {
  return new Date(d + "Z").toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Step = 1 | 2 | 3;

/* ------------------ shared UI classes ------------------ */
const glassCard =
  "border border-white/30 bg-white/15 backdrop-blur-xl shadow-2xl rounded-xl p-4 sm:p-6";

const primaryButton =
  "bg-warm-600 text-black hover:bg-warm-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none";

const secondaryButton =
  "bg-white/80 text-black border border-warm-600 hover:bg-warm-100 transition-all duration-200 hover:shadow-md";

const dangerButton =
  "bg-red-500/90 text-white hover:bg-red-600 transition-all duration-200 hover:shadow-lg";

/* ================== COMPONENT ================== */
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
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  /* ------------------ effects ------------------ */
  useEffect(() => {
    getTimeSlots().then((res) => {
      if (res.data?.length) {
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

  /* ------------------ handlers ------------------ */
  const handleStep1Next = () => {
    setSelectedSeatNumbers([]);
    if (availability && availability.available >= numberOfPeople) {
      setStep(2);
    } else {
      toast.error("Not enough seats available for this slot.");
    }
  };

  const handleToggleSeat = (seatNumber: number) => {
    setSelectedSeatNumbers((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // const handleConfirmBooking = async () => {
  //   setLoading(true);
  //   const toastId = toast.loading("Booking seats…");

  //   const res = await createReservation(
  //     date,
  //     timeSlot,
  //     numberOfPeople,
  //     selectedSeatNumbers.length === numberOfPeople
  //       ? selectedSeatNumbers
  //       : undefined
  //   );

  //   setLoading(false);
  //   toast.dismiss(toastId);

  //   if (res.error) {
  //     toast.error(res.error);
  //     return;
  //   }

  //   if (res.data) {
  //     const { reservation, managerCharge } = res.data;

  //     toast.success(
  //       <>
  //         <strong>Seat booked successfully </strong>
  //         <br />
  //         ₹{managerCharge.amount} deducted from{" "}
  //         <strong>{managerCharge.managerName}</strong>
  //       </>
  //     );

  //     setConfirmedReservation(reservation);
  //     setStep(3);
  //     fetchMyReservations();
  //   }
  // };

  const handleConfirmBooking = async () => {
  setLoading(true);
  const toastId = toast.loading("Booking seats…");

  const res = await createReservation(
    date,
    timeSlot,
    numberOfPeople,
    selectedSeatNumbers.length === numberOfPeople
      ? selectedSeatNumbers
      : undefined
  );

  toast.dismiss(toastId);
  setLoading(false);

  if (res.error || !res.data) {
    toast.error(res.error ?? "Booking failed");
    return;
  }

  //  ONLY check success for CREATE
  if ("success" in res.data && res.data.success !== true) {
    toast.error("Booking failed");
    return;
  }

  const { reservation, managerCharge } = res.data;

  toast.success(
    <>
      <strong>Seat booked successfully </strong>
      <br />
      ₹{managerCharge.amount} deducted from{" "}
      <strong>{managerCharge.managerName}</strong>
    </>
  );

  setConfirmedReservation(reservation);
  setStep(3);
  fetchMyReservations();
};



  // const handleCancel = async (id: string) => {
  //   if (!confirm("Cancel this reservation?")) return;

  //   const res = await cancelReservation(id);

  //   if (!res) {
  //     toast.error("Failed to cancel reservation");
  //     return;
  //   }

  //   toast.info(
  //     <>
  //       <strong>Reservation cancelled</strong>
  //       <br />
  //       ₹{res.amount} credited back to{" "}
  //       <strong>{res.managerName}</strong>
  //     </>
  //   );

  //   fetchMyReservations();
  //   if (confirmedReservation?.id === id) {
  //     setConfirmedReservation(null);
  //     setStep(1);
  //   }
  // };


  const handleCancel = async (id: string) => {
  if (!confirm("Cancel this reservation?")) return;

  const res = await cancelReservation(id);

  if (res.error || !res.data) {
    toast.error("Failed to cancel reservation");
    return;
  }

  toast.info(
    <>
      <strong>Reservation cancelled</strong>
      <br />
      ₹{res.data.amount} credited back to{" "}
      <strong>{res.data.managerName}</strong>
    </>
  );

  fetchMyReservations();

  if (confirmedReservation?.id === id) {
    setConfirmedReservation(null);
    setStep(1);
  }
};


  const startNewBooking = () => {
    setStep(1);
    setConfirmedReservation(null);
  };

  const hasEnoughSeats = availability && availability.available >= numberOfPeople;

  /* ================== UI ================== */
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url(/cafeteria-bg.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      <div className="relative z-10 mx-auto max-w-5xl p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            Reserve a Seat
          </h1>
          <p className="mt-2 text-warm-100 text-sm sm:text-base">
            Choose date, time slot & number of people
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className={glassCard}>
            <h2 className="text-xl sm:text-3xl font-semibold text-black mb-4">
              Select date, time & party size
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border p-2 text-black"
              />

              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="rounded-md border p-2 text-black"
              >
                {timeSlots.map((s) => (
                  <option key={s} value={s}>
                    {s} – {String(Number(s.slice(0, 2)) + 1).padStart(2, "0")}:00
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                max={100}
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                className="rounded-md border p-2 text-black"
              />
            </div>

            <button
              onClick={handleStep1Next}
              disabled={!hasEnoughSeats}
              className={`mt-4 w-full py-2 rounded-md border-2 ${primaryButton}`}
            >
              Next – Choose seats
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={glassCard}>
            <h2 className="text-xl sm:text-3xl font-semibold text-black mb-2">
              Choose your seats
            </h2>

            <SeatMap
              takenSeatNumbers={availability?.takenSeatNumbers ?? []}
              selectedSeatNumbers={selectedSeatNumbers}
              onToggleSeat={handleToggleSeat}
              maxSelection={numberOfPeople}
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                className={`py-2 px-4 rounded-md ${secondaryButton}`}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className={`py-2 px-4 rounded-md border bg-white ${primaryButton}`}
                onClick={handleConfirmBooking}
                disabled={loading || selectedSeatNumbers.length !== numberOfPeople}
              >
                {loading ? "Booking…" : "Confirm booking"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && confirmedReservation && (
          <div className={glassCard}>
            <h2 className="text-xl sm:text-2xl font-semibold text-black">
              Booking confirmed 
            </h2>

            <ul className="mt-3 text-black/80">
              <li>Date: {formatDate(confirmedReservation.date)}</li>
              <li>Time: {confirmedReservation.timeSlot}</li>
              <li>Seats: #{confirmedReservation.seatNumbers.join(", #")}</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => handleCancel(confirmedReservation.id)}
                className={`py-2 px-4 rounded-md ${dangerButton}`}
              >
                Cancel reservation
              </button>
              <button
                onClick={startNewBooking}
                className={`py-2 px-4 rounded-md border-2 ${primaryButton}`}
              >
                Make another booking
              </button>
            </div>
          </div>
        )}

        {/* MY RESERVATIONS */}
        <div className={glassCard}>
          <h2 className="text-xl sm:text-2xl font-semibold text-black mb-3">
            My reservations
          </h2>

          {loadingList ? (
            <p>Loading…</p>
          ) : myReservations.length === 0 ? (
            <p>No reservations yet.</p>
          ) : (
            <ul className="space-y-2">
              {myReservations.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b pb-2"
                >
                  <span>
                    {formatDate(r.date)} · {r.timeSlot} · #{r.seatNumbers.join(", #")}
                  </span>
                  <button
                    onClick={() => handleCancel(r.id)}
                    className={`px-3 py-1 rounded-md text-sm ${dangerButton}`}
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
