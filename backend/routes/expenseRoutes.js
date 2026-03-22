const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { spawnSync } = require("child_process");
const path = require("path");


/* =====================================
   GET expenses by branch
===================================== */
router.get("/:branchId", async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT
        expense_id,
        expense_type,
        amount,
        expense_date,
        description,
        priority
      FROM expenses
      WHERE branch_id = $1
    `;

    const params = [branchId];

    if (month) {
      query += ` AND TO_CHAR(expense_date,'YYYY-MM') = $2`;
      params.push(month);
    }

    query += `
      ORDER BY
        CASE
          WHEN priority = 'high' THEN 1
          WHEN priority = 'medium' THEN 2
          WHEN priority = 'low' THEN 3
          ELSE 4
        END,
        expense_date DESC
    `;

    const result = await db.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Fetch expense failed" });
  }
});


/* =====================================
   ADD expense WITH ML PRIORITY (PYTHON)
===================================== */
router.post("/", async (req, res) => {

  const {
    branch_id,
    expense_type,
    amount,
    expense_date,
    description
  } = req.body;

  try {

    const mlText = `${expense_type} ${description || ""}`;
    let priority = "medium"; // fallback

    try {

      console.log("Running ML for:", mlText);

      const pythonPath = path.join(__dirname, "..", "ml", "priority_api.py");

      const resultML = spawnSync(
        "python",
        [pythonPath, mlText],
        { encoding: "utf-8" }
      );

      const output = resultML.stdout.trim();

      if (["high", "medium", "low"].includes(output)) {
        priority = output;
      }

      console.log("ML Priority:", priority);

    } catch (mlErr) {
      console.log("ML failed — fallback priority used");
    }

    /* INSERT INTO DB */
    const result = await db.query(
      `
      INSERT INTO expenses
      (branch_id, expense_type, amount, expense_date, description, priority)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        branch_id,
        expense_type,
        amount,
        expense_date,
        description || "",
        priority
      ]
    );

    /* NOTIFICATION */
    await db.query(
      `INSERT INTO notifications (branch_id, role_id, message, type)
       VALUES ($1,1,$2,'EXPENSE')`,
      [
        branch_id,
        `New ${priority.toUpperCase()} expense ₹${amount} : ${expense_type}`
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.log("Add expense error:", err);
    res.status(500).json({ message: "Add expense failed" });
  }

});

module.exports = router;