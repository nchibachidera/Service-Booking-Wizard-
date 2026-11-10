import express from "express";
import pool from "../db/index.js";
import { toMinutes, fromMinutes } from "../utils/time.js";
import { isValidDate } from "../utils/validate.js";

const router = express.Router();

const SLOT_INTERVAL_MINUTES = 15;

router.get("/availability", async (req, res) => {
  try {
    const { date, service_id } = req.query;

    if (!date || !service_id) {
      return res.status(400).json({ error: "date and service_id are required" });
    }
    if (!isValidDate(date) || !Number.isInteger(Number(service_id))) {
      return res.status(400).json({ error: "date or service_id is not valid" });
    }

    // Step 1: get the service's duration
    onst serviceResult = await pool.query(
      "SELECT duration_minutes, provider_id FROM services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "service not found" });
    }

    const { duration_minutes, provider_id } = serviceResult.rows[0];

    // Step 2: a blocked date has no times at all
    const blockedResult = await pool.query(
      `SELECT 1 FROM availability_exceptions
       WHERE provider_id = $1 AND date = $2 AND is_blocked = TRUE
       LIMIT 1`,
      [provider_id, date]
    );

    if (blockedResult.rows.length > 0) {
      return res.json({ slots: [], available_slots: [] });
    }

    // Step 3: figure out the day of week, then get working hours
    // getUTCDay matches how "YYYY-MM-DD" strings are parsed, so the
    // answer doesn't depend on the server's timezone
    const dayOfWeek = new Date(date).getUTCDay();

    const hoursResult = await pool.query(
      "SELECT start_time, end_time FROM working_hours WHERE provider_id = $1 AND day_of_week = $2",
      [provider_id, dayOfWeek]
    );

    if (hoursResult.rows.length === 0) {
      return res.json({ slots: [], available_slots: [] });
    }

    const { start_time, end_time } = hoursResult.rows[0];

    // Step 4: get existing bookings for this provider on this date
    const bookingsResult = await pool.query(
      "SELECT start_time, end_time FROM bookings WHERE provider_id = $1 AND date = $2 AND status != 'cancelled'",
      [provider_id, date]
    );

    const existingBookings = bookingsResult.rows;

    // Step 5: walk the working window in SLOT_INTERVAL_MINUTES steps
    // and report every slot, marking whether it is still free
    const windowStart = toMinutes(start_time);
    const windowEnd = toMinutes(end_time);
    const duration = duration_minutes;

    const slots = [];
    let candidateStart = windowStart;

    while (candidateStart + duration <= windowEnd) {
      const candidateEnd = candidateStart + duration;

      const hasOverlap = existingBookings.some((booking) => {
        const bookingStart = toMinutes(booking.start_time);
        const bookingEnd = toMinutes(booking.end_time);
        return candidateStart < bookingEnd && candidateEnd > bookingStart;
      });

      slots.push({
        time: fromMinutes(candidateStart),
        available: !hasOverlap
      });

      candidateStart += SLOT_INTERVAL_MINUTES;
    }

    res.json({
      slots,
      available_slots: slots
        .filter((slot) => slot.available)
        .map((slot) => slot.time)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch availability" });
  }
});

export default router;