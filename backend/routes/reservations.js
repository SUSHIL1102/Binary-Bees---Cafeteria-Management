const express = require("express");
const router = express.Router();

const reservations = [];
const MAX_SEATS = 100;

router.post("/", (req, res) => {
  const { date, slot } = req.body;
  const w3id = req.user.w3id;

  if (!date || !slot) {
    return res.status(400).json({ error: "Date and slot required" });
  }

  const sameSlot = reservations.filter(
    r => r.date === date && r.slot === slot
  );

  if (sameSlot.length >= MAX_SEATS) {
    return res.status(400).json({ error: "No seats available" });
  }

  const alreadyBooked = reservations.find(
    r => r.date === date && r.slot === slot && r.w3id === w3id
  );

  if (alreadyBooked) {
    return res.status(400).json({ error: "Already booked" });
  }

  const reservation = { w3id, date, slot };
  reservations.push(reservation);

  res.json({ message: "Seat reserved", reservation });
});

router.get("/my", (req, res) => {
  const my = reservations.filter(r => r.w3id === req.user.w3id);
  res.json(my);
});

router.delete("/", (req, res) => {
  const { date, slot } = req.body;
  const w3id = req.user.w3id;

  const index = reservations.findIndex(
    r => r.date === date && r.slot === slot && r.w3id === w3id
  );

  if (index === -1) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  reservations.splice(index, 1);
  res.json({ message: "Cancelled" });
});

module.exports = router;
