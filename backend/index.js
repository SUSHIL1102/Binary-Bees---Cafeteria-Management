const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Swagger ----------
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cafeteria Management API",
      version: "1.0.0"
    }
  },
  apis: ["./index.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --------------------------------

const SECRET = "secretkey";
const reservations = [];
const MAX_SEATS = 100;

// ---------- Auth Middleware ----------
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
// -------------------------------------

// ---------- Routes ----------
app.post("/auth/login", (req, res) => {
  const { w3id } = req.body;

  if (!w3id) {
    return res.status(400).json({ error: "W3 ID required" });
  }

  const token = jwt.sign({ w3id }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.post("/reservations", auth, (req, res) => {
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

app.get("/reservations/my", auth, (req, res) => {
  const my = reservations.filter(r => r.w3id === req.user.w3id);
  res.json(my);
});

app.delete("/reservations", auth, (req, res) => {
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

app.get("/health", (req, res) => {
  res.send("OK");
});
// -------------------------------------

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
