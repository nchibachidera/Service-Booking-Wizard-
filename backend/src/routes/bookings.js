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

    const result = await pool.query(
      `INSERT INTO bookings
        (provider_id, service_id, customer_name, customer_phone, date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [provider_id, service_id, customer_name, customer_phone, date, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create booking" });
  }
});

export default router;