// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js"; // our MySQL pool

// Load .env variables
dotenv.config();

const app = express();

// ====== CONFIG ======
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ====== MIDDLEWARE ======
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json()); // parse JSON request bodies

// ====== BASIC ROUTES ======

// Health check
app.get("/", (req, res) => {
  res.send("HRIS Backend API running ✅");
});

// Test DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      ok: true,
      message: "Database connection successful",
      serverTime: rows[0].now,
    });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({
      ok: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// ====== 404 HANDLER ======
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

// ====== GLOBAL ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    ok: false,
    message: "Internal server error",
  });
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log("=====================================");
  console.log(`HRIS Backend listening on port ${PORT}`);
  console.log(`Allowed frontend origin: ${FRONTEND_URL}`);
  console.log("=====================================");
});