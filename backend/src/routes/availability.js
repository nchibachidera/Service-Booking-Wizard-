import express from "express";
import pool from "../db/index.js"

const router = express.Router();

const SLOT_INTERVAL_MINUTES = 15;

function toMinutes(timeStr){
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

function fromMinutes(mins) {
    const h = string(Math.floor(min / 60)).padStart(2, "0");
    const m = string( mins % 60).padStart(2, "0");
    return `${h}:${m}`;
}

router.get("/availability", async (req, res) => {
    try {
        const { date, service_id } = req.query;

        if (!date || !service_id) {
            return res.status(400).json({ error: "date and service_id are required" });
        }

        // step 1 get the service's duration
        const serviceResult = await pool.query(
            "SELECT duration_minutes, provider_id FROM services WHERE id = $1",
            [service_id]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({ error: "service not found" });
        }

        const { duration_minutes, provider_id } = serviceResult.rows[0];

        //step 2: figure out the day of the week, then get working hours
        const dayOfWeek = new Date(date).getDay(); // 0 = sunday ... 6 = saturday

        const hoursResult = await pool.query(
            "SELECT start_time, end_time FROM working_hours WHERE provider_id = $1 AND day_of_week = $2",
            [provider_id, dayOfWeek]
        );

        if (hoursResult.rows.length === 0) {
            //provider doesn't work this day at all
            return res.json({ available_slots: [] });
        }

        const { start_time, end_time } = hoursResult.rows[0];

        // Temporary — just confirm this part works before continuing
        res.json({ duration_minutes, provider_id, dayOfWeek, start_time, end_time });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "failed to fetch availability" });
        }
});

export default router