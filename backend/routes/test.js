const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getOrCreateEmployee } = require("../services/employeeService");

router.get("/me", auth, async (req, res) => {
  // 🔍 STEP 1: JWT data
  console.log("JWT user:", req.user);

  // 🔍 STEP 2: DB employee
  const employee = await getOrCreateEmployee(req.user);
  console.log("DB employee:", employee);

  res.json({
    jwtUser: req.user,
    employee
  });
});

module.exports = router;
