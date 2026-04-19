const express   = require("express");
const mongoose  = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const designRoutes = require("./routes/designs");

const app  = express();
const PORT = process.env.PORT || 5002;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
; // allow React dev server
app.use(express.json());                            // parse JSON request bodies

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/designs", designRoutes);

// Health check — useful to verify server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vision2Room API is running 🏠" });
});

// ── Connect to MongoDB, then start server ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📐 API ready at http://localhost:${PORT}/api/designs`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
