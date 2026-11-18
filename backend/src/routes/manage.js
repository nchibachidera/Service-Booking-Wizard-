import express from "express";
import pool from "../db/index.js";
import { toMinutes } from "../utils/time.js";
import { isFarEnoughAhead } from "../utils/studioTime.js";

const router = express.Router();

const REFERENCE_PATTERN = /^BK-(\d{1,9})$/i;
const NOT_FOUND =
  "We couldn't find a booking with those details. Check the reference and phone number.";

// Compare phone numbers by their last 10 digits, so 0801... and +234801... match
function phoneKey(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : null;
}

// allowed | cancelled | past | window (inside the free cancellation window)
function cancelState(row) {
  if (row.status === "cancelled") return "cancelled";
  const start = toMinutes(row.start_time);
  if (!isFarEnoughAhead(row.date, start, 0)) return "past";
  if (!isFarEnoughAhead(row.date, start, row.cancel_window_hours)) return "window";
  return "allowed";
}

function toView(row, state) {
  return {
    reference: `BK-${String(row.id).padStart(4, "0")}`,
    customer_name: row.customer_name,
    service_name: row.service_name,
    duration_minutes: row.duration_minutes,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    cancel_state: state,
    cancel_window_hours: row.cancel_window_hours,
    studio_name: row.studio_name,
    studio_phone: row.studio_phone
  };
}

// Finds the booking only if the reference AND phone number both match
async function findBooking(body) {
  const { reference, phone } = body ?? {};

  if (
    typeof reference !== "string" ||
    typeof phone !== "string" ||
    !reference.trim() ||
    !phone.trim()
  ) {
    return { status: 400, error: "enter your booking reference and phone number" };
  }

  const match = REFERENCE_PATTERN.exec(reference.trim());
  if (!match) {
    return {
      status: 400,
      error: "that doesn't look like a booking reference. It looks like BK-0012"
    };
  }

  const wanted = phoneKey(phone);
  if (!wanted) return { status: 404, error: NOT_FOUND };

  const result = await pool.query(
    `SELECT b.id,
            b.customer_name,
            b.customer_phone,
            b.date,
            b.start_time,
            b.end_time,
            b.status,
            s.name AS service_name,
            s.duration_minutes,
            COALESCE(p.studio_name, p.name) AS studio_name,
            p.phone AS studio_phone,
            p.cancel_window_hours
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN providers p ON p.id = b.provider_id
     WHERE b.id = $1`,
    [Number(match[1])]
  );

  if (result.rows.length === 0) return { status: 404, error: NOT_FOUND };

  const row = result.rows[0];
  if (phoneKey(row.customer_phone) !== wanted) {
    return { status: 404, error: NOT_FOUND };
  }

  return { row };
}

router.post("/bookings/lookup", async (req, res) => {
  try {
    const found = await findBooking(req.body);
    if (found.error) {
      return res.status(found.status).json({ error: found.error });
    }

    res.json(toView(found.row, cancelState(found.row)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to look up the booking" });
  }
});

router.post("/bookings/cancel", async (req, res) => {
  try {
    const found = await findBooking(req.body);
    if (found.error) {
      return res.status(found.status).json({ error: found.error });
    }

    const { row } = found;
    const state = cancelState(row);

    if (state === "cancelled") {
      return res.status(409).json({ error: "this booking is already cancelled" });
    }
    if (state === "past") {
      return res.status(409).json({ error: "this appointment has already passed" });
    }
    if (state === "window") {
      const contact = row.studio_phone
        ? `call ${row.studio_name} on ${row.studio_phone}`
        : `contact ${row.studio_name}`;
      return res.status(409).json({
        error: `Online cancellation closes ${row.cancel_window_hours} hours before the appointment. Please ${contact} to change this booking.`
      });
    }

    const updated = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = $1 AND status != 'cancelled'
       RETURNING id`,
      [row.id]
    );

    if (updated.rows.length === 0) {
      return res.status(409).json({ error: "this booking is already cancelled" });
    }

    res.json(toView({ ...row, status: "cancelled" }, "cancelled"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to cancel the booking" });
  }
});

export default router;