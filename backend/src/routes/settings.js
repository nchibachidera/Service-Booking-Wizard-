import express from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Must match the options on the Settings page
const NOTICE_OPTIONS = [0, 2, 12, 24];
const CANCEL_OPTIONS = [12, 24, 48];
const PHONE_PATTERN = /^[0-9+()\-\s]{7,30}$/;

const SETTINGS_COLUMNS = `
  name,
  COALESCE(studio_name, name) AS studio_name,
  phone,
  min_notice_hours,
  cancel_window_hours,
  auto_confirm,
  sms_reminders,
  daily_digest`;

function readSettings(body) {
  const input = body ?? {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const studioName =
    typeof input.studio_name === "string" ? input.studio_name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return { error: "your name must be 2 to 100 characters" };
  }
  if (studioName.length < 2 || studioName.length > 100) {
    return { error: "studio name must be 2 to 100 characters" };
  }
  if (phone !== "" && !PHONE_PATTERN.test(phone)) {
    return { error: "enter a valid phone number" };
  }
  if (!NOTICE_OPTIONS.includes(input.min_notice_hours)) {
    return { error: "minimum notice is not a valid option" };
  }
  if (!CANCEL_OPTIONS.includes(input.cancel_window_hours)) {
    return { error: "cancellation window is not a valid option" };
  }
  for (const key of ["auto_confirm", "sms_reminders", "daily_digest"]) {
    if (typeof input[key] !== "boolean") {
      return { error: `${key} must be true or false` };
    }
  }

  return {
    values: [
      name,
      studioName,
      phone,
      input.min_notice_hours,
      input.cancel_window_hours,
      input.auto_confirm,
      input.sms_reminders,
      input.daily_digest
    ]
  };
}

router.get("/admin/settings", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SETTINGS_COLUMNS} FROM providers WHERE id = $1`,
      [req.providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "account not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to load settings" });
  }
});

router.put("/admin/settings", requireAuth, async (req, res) => {
  const parsed = readSettings(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const result = await pool.query(
      `UPDATE providers
       SET name = $1,
           studio_name = $2,
           phone = $3,
           min_notice_hours = $4,
           cancel_window_hours = $5,
           auto_confirm = $6,
           sms_reminders = $7,
           daily_digest = $8
       WHERE id = $9
       RETURNING ${SETTINGS_COLUMNS}`,
      [...parsed.values, req.providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "account not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to save settings" });
  }
});

export default router;