const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= CORS ================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ================= BODY ================= */
app.use(express.json());

/* ================= API ROUTES ================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/branches", require("./routes/branchRoutes"));
app.use("/api/franchises", require("./routes/franchiseRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/owner-expenses", require("./routes/ownerExpenseRoutes"));
app.use("/api/owner-inventory", require("./routes/ownerInventoryRoutes"));
app.use("/api/owner-sales", require("./routes/ownerSalesRoutes"));

/* ================= FRONTEND ================= */

const frontendPath = path.join(__dirname, "..", "dist");

app.use(express.static(frontendPath));

/* ⭐ VERY IMPORTANT FIX FOR EXPRESS 5 */
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("✅ Backend running on port", PORT);
});