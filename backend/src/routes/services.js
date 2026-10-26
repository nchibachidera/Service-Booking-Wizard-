import express from "express";
import pool from "../db/index.js";

const router = express.Router();

router.get("/services", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, duration_minutes, price, category, most_booked
       FROM services
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch services" });
  }
});

export default router;