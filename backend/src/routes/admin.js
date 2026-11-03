import express from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Everything under /api/admin requires a valid login
router.use("/admin", requireAuth);

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled"];

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

export default router;