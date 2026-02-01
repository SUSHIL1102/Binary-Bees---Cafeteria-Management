const prisma = require("../lib/prisma");

/**
 * Ensures employee exists in DB using JWT data
 */
async function getOrCreateEmployee(user) {
  let employee = await prisma.employee.findUnique({
    where: {
      w3Id: user.w3id
    }
  });

  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        w3Id: user.w3id,
        email: user.email,
        name: user.name
      }
    });
  }

  return employee;
}

module.exports = {
  getOrCreateEmployee
};
