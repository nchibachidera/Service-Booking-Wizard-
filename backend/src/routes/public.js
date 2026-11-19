import express from "express";
import pool from "../db/index.js";

const router = express.Router();

// Public: no login. Returns only what the booking page needs to show.
// This site serves one business, so it uses the first provider.
router.get("/public/studio", async (req, res) => {
  try {
    const providerResult = await pool.query(
      `SELECT id,
              COALESCE(studio_name, name) AS studio_name,
              auto_confirm,
              cancel_window_hours
       FROM providers
       ORDER BY id
       LIMIT 1`
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ error: "studio not set up yet" });
    }

    const provider = providerResult.rows[0];

    const hoursResult = await pool.query(
      `SELECT day_of_week
       FROM working_hours
       WHERE provider_id = $1
       ORDER BY day_of_week`,
      [provider.id]
    );

    // From yesterday on; the browser only looks at the next seven days
    const blockedResult = await pool.query(
      `SELECT date
       FROM availability_exceptions
       WHERE provider_id = $1
         AND is_blocked = TRUE
         AND date >= CURRENT_DATE - 1
       ORDER BY date`,
      [provider.id]
    );

    res.set("Cache-Control", "no-store");
    res.json({
      studio_name: provider.studio_name,
      auto_confirm: provider.auto_confirm,
      cancel_window_hours: provider.cancel_window_hours,
      open_days: hoursResult.rows.map((row) => row.day_of_week),
      blocked_dates: blockedResult.rows.map((row) => row.date)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load studio details" });
  }
});

export default router;