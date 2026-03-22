const db = require("../config/db");
const { spawnSync } = require("child_process");
const path = require("path");


/* ======================================
   GET EXPENSES BY BRANCH (WITH MONTH)
====================================== */
exports.getExpensesByBranch = async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query;

  try {
    let query = `
      SELECT *
      FROM expenses
      WHERE branch_id = $1
    `;

    let values = [branchId];

    if (month) {
      const [year, mon] = month.split("-");

      query += `
        AND EXTRACT(YEAR FROM expense_date) = $2
        AND EXTRACT(MONTH FROM expense_date) = $3
      `;

      values.push(year, mon);
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

    const result = await db.query(query, values);
    res.json(result.rows);

  } catch (error) {
    console.error("Expense fetch error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


/* ======================================
   ADD EXPENSE WITH ML PRIORITY
====================================== */
exports.addExpense = async (req, res) => {

  const {
    branch_id,
    expense_type,
    amount,
    expense_date,
    description
  } = req.body;

  try {

    const mlText = `${expense_type} ${description || ""}`;
    let priority = "medium";

    try {

      console.log("Calling ML with:", mlText);

      const pythonPath = path.join(__dirname, "../ml/priority_api.py");

      const pythonProcess = spawnSync(
        "python",
        [pythonPath, mlText],
        {
          encoding: "utf-8",
          timeout: 10000
        }
      );

      if (pythonProcess.error) {
        console.log("ML Process Error:", pythonProcess.error.message);
      }

      if (pythonProcess.stderr) {
        console.log("ML stderr:", pythonProcess.stderr);
      }

      const output = pythonProcess.stdout?.trim();

      if (output && ["high", "medium", "low"].includes(output)) {
        priority = output;
      }

      console.log("ML Priority Result:", priority);

    } catch (mlError) {
      console.log("ML FAILED — using fallback priority");
    }

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
        description,
        priority
      ]
    );

    await db.query(
      `
      INSERT INTO notifications
      (branch_id, role_id, message, type)
      VALUES ($1, 1, $2, 'EXPENSE')
      `,
      [
        branch_id,
        `New ${priority.toUpperCase()} priority expense ₹${amount} for ${expense_type}`
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};
