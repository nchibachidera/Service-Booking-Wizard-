import express from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { toMinutes } from "../utils/time.js";
import { isValidDate, isValidTime } from "../utils/validate.js";

const router = express.Router();

// Everything under /api/admin requires a valid login
router.use("/admin", requireAuth);

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled"];

// The working hours dropdowns offer half hours from 07:00 to 21:00
const EARLIEST_MINUTES = 7 * 60;
const LATEST_MINUTES = 21 * 60;

function validateWorkingDays(days) {
  if (!Array.isArray(days) || days.length > 7) {
    return "days must be a list of up to 7 entries";
  }
  const seen = new Set();
  for (const day of days) {
    if (
      !day ||
      !Number.isInteger(day.day_of_week) ||
      day.day_of_week < 0 ||
      day.day_of_week > 6
    ) {
      return "day_of_week must be a whole number from 0 to 6";
    }
    if (seen.has(day.day_of_week)) {
      return "each day can only appear once";
    }
    seen.add(day.day_of_week);

    if (!isValidTime(day.start_time) || !isValidTime(day.end_time)) {
      return "times must look like 09:00";
    }
    const start = toMinutes(day.start_time);
    const end = toMinutes(day.end_time);
    if (
      start % 30 !== 0 ||
      end % 30 !== 0 ||
      start < EARLIEST_MINUTES ||
      end > LATEST_MINUTES
    ) {
      return "times must be on the half hour, between 07:00 and 21:00";
    }
    if (end <= start) {
      return "closing time must be after opening time";
    }
  }
  return null;
}

/* ---------- bookings ---------- */

router.get("/admin/bookings", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id,
              b.customer_name,
              b.customer_phone,
              b.date,
              b.start_time,
              b.end_time,
              b.status,
              b.paid_amount,
              b.created_at,
              s.id AS service_id,
              s.name AS service_name,
              s.duration_minutes,
              s.price
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.provider_id = $1
       ORDER BY b.date, b.start_time`,
      [req.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load bookings" });
  }
});

router.patch("/admin/bookings/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "invalid booking id" });
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2 AND provider_id = $3
       RETURNING id, status`,
      [status, id, req.providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "booking not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    // Re-confirming a cancelled booking fails if the slot was rebooked meanwhile
    if (err.code === "23P01" || err.code === "40P01") {
      return res
        .status(409)
        .json({ error: "that time has since been taken by another booking" });
    }
    console.error(err);
    res.status(500).json({ error: "failed to update booking" });
  }
});

/* ---------- working hours ---------- */

router.get("/admin/working-hours", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT day_of_week, start_time, end_time
       FROM working_hours
       WHERE provider_id = $1
       ORDER BY day_of_week`,
      [req.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load working hours" });
  }
});

// Replaces the whole week in one go. Only open days are sent;
// a day that is missing from the list is closed.
router.put("/admin/working-hours", async (req, res) => {
  const { days } = req.body ?? {};
  const problem = validateWorkingDays(days);
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Makes two overlapping saves for the same provider wait for each other
    await client.query("SELECT id FROM providers WHERE id = $1 FOR UPDATE", [
      req.providerId
    ]);

    await client.query("DELETE FROM working_hours WHERE provider_id = $1", [
      req.providerId
    ]);

    for (const day of days) {
      await client.query(
        `INSERT INTO working_hours (provider_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [req.providerId, day.day_of_week, day.start_time, day.end_time]
      );
    }

    await client.query("COMMIT");
    res.json({ saved: days.length });
  } catch (err) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ error: "failed to save working hours" });
  } finally {
    if (client) client.release();
  }
});

/* ---------- blocked dates ---------- */

// Returns blocked dates from yesterday on; the browser keeps today and later,
// so the answer doesn't depend on the server's timezone
router.get("/admin/blocked-dates", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, date, reason
       FROM availability_exceptions
       WHERE provider_id = $1
         AND is_blocked = TRUE
         AND date >= CURRENT_DATE - 1
       ORDER BY date`,
      [req.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load blocked dates" });
  }
});

router.post("/admin/blocked-dates", async (req, res) => {
  try {
    const { date, reason } = req.body ?? {};

    if (!isValidDate(date)) {
      return res
        .status(400)
        .json({ error: "date must be a real date like 2026-12-25" });
    }

    const cleanReason = typeof reason === "string" ? reason.trim() : "";
    if (cleanReason.length > 120) {
      return res
        .status(400)
        .json({ error: "reason must be 120 characters or fewer" });
    }

    const existing = await pool.query(
      "SELECT 1 FROM availability_exceptions WHERE provider_id = $1 AND date = $2",
      [req.providerId, date]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "that date is already blocked" });
    }

    const inserted = await pool.query(
      `INSERT INTO availability_exceptions (provider_id, date, is_blocked, reason)
       VALUES ($1, $2, TRUE, $3)
       RETURNING id, date, reason`,
      [req.providerId, date, cleanReason || "Unavailable"]
    );

    // Bookings already on that date are left alone; the provider is told
    const count = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM bookings
       WHERE provider_id = $1 AND date = $2 AND status != 'cancelled'`,
      [req.providerId, date]
    );

    res
      .status(201)
      .json({ ...inserted.rows[0], bookings_on_date: count.rows[0].count });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "that date is already blocked" });
    }
    console.error(err);
    res.status(500).json({ error: "failed to block that date" });
  }
});

router.delete("/admin/blocked-dates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const result = await pool.query(
      `DELETE FROM availability_exceptions
       WHERE id = $1 AND provider_id = $2 AND is_blocked = TRUE
       RETURNING id`,
      [id, req.providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "blocked date not found" });
    }

    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to unblock that date" });
  }
});

export default router;