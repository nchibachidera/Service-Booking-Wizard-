import express from "express";
import pool from "../db/index.js";
import { toMinutes, fromMinutes } from "../utils/time.js";
import { isValidDate, isValidTime } from "../utils/validate.js";

const router = express.Router();

router.post("/bookings", async (req, res) => {
  try {
    const { service_id, date, start_time, customer_name, customer_phone } =
      req.body ?? {};

    if (!service_id || !date || !start_time || !customer_name || !customer_phone) {
      return res.status(400).json({ error: "all fields are required" });
    }

    const serviceId = Number(service_id);
    if (
      !Number.isInteger(serviceId) ||
      !isValidDate(date) ||
      !isValidTime(start_time)
    ) {
      return res
        .status(400)
        .json({ error: "service, date or time is not valid" });
    }

    if (typeof customer_name !== "string" || typeof customer_phone !== "string") {
      return res.status(400).json({ error: "name and phone must be text" });
    }
    const name = customer_name.trim();
    const phone = customer_phone.trim();
    if (
      name.length < 2 ||
      name.length > 100 ||
      phone.length < 7 ||
      phone.length > 30
    ) {
      return res.status(400).json({ error: "name or phone number is not valid" });
    }

    const serviceResult = await pool.query(
      "SELECT duration_minutes, provider_id FROM services WHERE id = $1",
      [serviceId]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "service not found" });
    }

    const { duration_minutes, provider_id } = serviceResult.rows[0];

    // Refuse blocked dates
    const blocked = await pool.query(
      `SELECT 1 FROM availability_exceptions
       WHERE provider_id = $1 AND date = $2 AND is_blocked = TRUE
       LIMIT 1`,
      [provider_id, date]
    );
    if (blocked.rows.length > 0) {
      return res.status(409).json({ error: "that date is not available" });
    }

    // Refuse closed days and times outside opening hours
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
    const hoursResult = await pool.query(
      "SELECT start_time, end_time FROM working_hours WHERE provider_id = $1 AND day_of_week = $2",
      [provider_id, dayOfWeek]
    );
    if (hoursResult.rows.length === 0) {
      return res.status(409).json({ error: "we are closed on that day" });
    }

    const startMinutes = toMinutes(start_time);
    const endMinutes = startMinutes + duration_minutes;
    const opensAt = toMinutes(hoursResult.rows[0].start_time);
    const closesAt = toMinutes(hoursResult.rows[0].end_time);
    if (startMinutes < opensAt || endMinutes > closesAt) {
      return res
        .status(409)
        .json({ error: "that time is outside our opening hours" });
    }

    const end_time = fromMinutes(endMinutes);

    // Layer 1: refuse if an existing booking overlaps this time
    const conflict = await pool.query(
      `SELECT 1 FROM bookings
       WHERE provider_id = $1
         AND date = $2
         AND status != 'cancelled'
         AND start_time < $4
         AND end_time > $3
       LIMIT 1`,
      [provider_id, date, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: "that time slot is no longer available" });
    }

    const result = await pool.query(
      `INSERT INTO bookings
        (provider_id, service_id, customer_name, customer_phone, date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [provider_id, serviceId, name, phone, date, start_time, end_time]
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