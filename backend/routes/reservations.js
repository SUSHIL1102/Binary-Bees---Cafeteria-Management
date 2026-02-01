// // const express = require("express");
// // const router = express.Router();

// // const reservations = [];
// // const MAX_SEATS = 100;

// // router.post("/", (req, res) => {
// //   const { date, slot } = req.body;
// //   const w3id = req.user.w3id;

// //   if (!date || !slot) {
// //     return res.status(400).json({ error: "Date and slot required" });
// //   }

// //   const sameSlot = reservations.filter(
// //     r => r.date === date && r.slot === slot
// //   );

// //   if (sameSlot.length >= MAX_SEATS) {
// //     return res.status(400).json({ error: "No seats available" });
// //   }

// //   const alreadyBooked = reservations.find(
// //     r => r.date === date && r.slot === slot && r.w3id === w3id
// //   );

// //   if (alreadyBooked) {
// //     return res.status(400).json({ error: "Already booked" });
// //   }

// //   const reservation = { w3id, date, slot };
// //   reservations.push(reservation);

// //   res.json({ message: "Seat reserved", reservation });
// // });

// // router.get("/my", (req, res) => {
// //   const my = reservations.filter(r => r.w3id === req.user.w3id);
// //   res.json(my);
// // });

// // router.delete("/", (req, res) => {
// //   const { date, slot } = req.body;
// //   const w3id = req.user.w3id;

// //   const index = reservations.findIndex(
// //     r => r.date === date && r.slot === slot && r.w3id === w3id
// //   );

// //   if (index === -1) {
// //     return res.status(404).json({ error: "Reservation not found" });
// //   }

// //   reservations.splice(index, 1);
// //   res.json({ message: "Cancelled" });
// // });

// // module.exports = router;



// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const prisma = require("../lib/prisma");

// router.use(auth);

// /**
//  * POST /reservations
//  * Body: { date, seatNumber }
//  */
// router.post("/", async (req, res) => {
//   const { date, seatNumber } = req.body;
//   const w3id = req.user.w3id;

//   if (!date || !seatNumber) {
//     return res.status(400).json({ error: "date and seatNumber required" });
//   }

//   try {
//     const employee = await prisma.employee.findUnique({
//       where: { w3Id: w3id }
//     });

//     if (!employee) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     const reservation = await prisma.reservation.create({
//       data: {
//         employeeId: employee.id,
//         date,
//         seatNumber
//       }
//     });

//     res.status(201).json({
//       message: "Seat reserved",
//       reservation
//     });

//   } catch (err) {
//     // Unique constraint error (seat already booked OR user already booked that day)
//     if (err.code === "P2002") {
//       return res.status(400).json({
//         error: "Seat already booked or you already reserved for this date"
//       });
//     }

//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * GET /reservations/my
//  */
// router.get("/my", async (req, res) => {
//   const employee = await prisma.employee.findUnique({
//     where: { w3Id: req.user.w3id }
//   });

//   const reservations = await prisma.reservation.findMany({
//     where: { employeeId: employee.id },
//     orderBy: { date: "desc" }
//   });

//   res.json(reservations);
// });

// /**
//  * DELETE /reservations
//  * Body: { date, seatNumber }
//  */
// // router.delete("/", async (req, res) => {
// //   const { date, seatNumber } = req.body;

// //   const employee = await prisma.employee.findUnique({
// //     where: { w3Id: req.user.w3id }
// //   });

// //   const reservation = await prisma.reservation.findFirst({
// //     where: {
// //       employeeId: employee.id,
// //       date,
// //       seatNumber
// //     }
// //   });

// //   if (!reservation) {
// //     return res.status(404).json({ error: "Reservation not found" });
// //   }

// //   await prisma.reservation.delete({
// //     where: { id: reservation.id }
// //   });

// //   res.json({ message: "Cancelled" });
// // });

// // router.delete("/:id", async (req, res) => {
// //   const reservationId = req.params.id;
// //   const employeeId = req.employee.id; // or req.user.w3id mapping

// //   const reservation = await prisma.reservation.findFirst({
// //     where: {
// //       id: reservationId,
// //       employeeId
// //     }
// //   });

// //   if (!reservation) {
// //     return res.status(404).json({ error: "Reservation not found" });
// //   }

// //   await prisma.reservation.delete({
// //     where: { id: reservationId }
// //   });

// //   res.json({ message: "Reservation cancelled" });
// // });


// const { getOrCreateEmployee } = require("../services/employeeService");

// router.delete("/:id", async (req, res) => {
//   try {
//     // 1️⃣ Get employee from JWT
//     const employee = await getOrCreateEmployee(req.user);

//     // 2️⃣ Reservation id from URL
//     const reservationId = req.params.id;

//     // 3️⃣ Delete only if it belongs to this employee
//     const deleted = await prisma.reservation.deleteMany({
//       where: {
//         id: reservationId,
//         employeeId: employee.id
//       }
//     });

//     if (deleted.count === 0) {
//       return res
//         .status(404)
//         .json({ error: "Reservation not found or not yours" });
//     }

//     res.json({ message: "Reservation cancelled" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to cancel reservation" });
//   }
// });




// module.exports = router;



const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const { getOrCreateEmployee } = require("../services/employeeService");

/**
 * POST /reservations
 * Create reservation (manual seat selection)
 */
router.post("/", async (req, res) => {
  const { date, seatNumber } = req.body;

  if (!date || !seatNumber) {
    return res.status(400).json({ error: "date and seatNumber required" });
  }

  try {
    const employee = await getOrCreateEmployee(req.user);

    const reservation = await prisma.reservation.create({
      data: {
        date,
        seatNumber,
        employeeId: employee.id
      }
    });

    res.json({
      message: "Seat reserved",
      reservation
    });
  } catch (err) {
    res.status(400).json({
      error: "Seat already booked or you already reserved for this date"
    });
  }
});

/**
 * GET /reservations
 * Get my reservations
 */
router.get("/", async (req, res) => {
  try {
    const employee = await getOrCreateEmployee(req.user);

    const reservations = await prisma.reservation.findMany({
      where: {
        employeeId: employee.id
      },
      orderBy: {
        date: "desc"
      }
    });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

/**
 * DELETE /reservations/:id
 * Cancel my reservation
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await getOrCreateEmployee(req.user);

    const deleted = await prisma.reservation.deleteMany({
      where: {
        id,
        employeeId: employee.id
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        error: "Reservation not found or not yours"
      });
    }

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
});

module.exports = router;

