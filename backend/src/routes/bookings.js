import express from "express";
import pool from "../db/index.js";
import { toMinutes, fromMinutes } from "../utils/time.js";

const router = express.Router();

router.post("/bookings", async (req, res) => {
  try {
    const { service_id, date, start_time, customer_name, customer_phone } = req.body;

    if (!service_id || !date || !start_time || !customer_name || !customer_phone) {
      return res.status(400).json({ error: "all fields are required" });
    }

    const serviceResult = await pool.query(
      "SELECT duration_minutes, provider_id FROM services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "service not found" });
    }

    const { duration_minutes, provider_id } = serviceResult.rows[0];
    const end_time = fromMinutes(toMinutes(start_time) + duration_minutes);

    // Layer 1: refuse if an existing booking overlaps this time
    //const conflict = await pool.query(
      `SELECT 1 FROM bookings
       WHERE provider_id = $1
         AND date = $2
         AND status != 'cancelled'
         AND start_time < $4
         AND end_time > $3
       LIMIT 1`,
      [provider_id, date, start_time, end_time]
   // );

    //if (conflict.rows.length > 0) {
    //  return res.status(409).json({ error: "that time slot is no longer available" });
   // }

    const result = await pool.query(
      `INSERT INTO bookings
        (provider_id, service_id, customer_name, customer_phone, date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [provider_id, service_id, customer_name, customer_phone, date, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Layer 2: the database rejected a competing insert
    // 23P01 = exclusion constraint violated, 40P01 = deadlock between two competing inserts
    if (err.code === "23P01" || err.code === "40P01") {
      return res.status(409).json({ error: "that time slot is no longer available" });
    }
    console.error(err);
    res.status(500).json({ error: "failed to create booking" });
  }
});

export default router;