const prisma = require("../lib/prisma");

async function createReservation(employeeId, date, seatNumber) {
  try {
    return await prisma.reservation.create({
      data: {
        employeeId,
        date,
        seatNumber
      }
    });
  } catch (err) {
    // Prisma unique constraint violation
    if (err.code === "P2002") {
      throw new Error("Seat already booked or already reserved for this date");
    }
    throw err;
  }
}

async function getMyReservations(employeeId) {
  return prisma.reservation.findMany({
    where: { employeeId },
    orderBy: { date: "desc" }
  });
}

module.exports = {
  createReservation,
  getMyReservations
};
