import express from "express";
import pool from "../db/index.js"

const router = express.Router();

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

        // Temporary — just confirm this part works before continuing
        res.json({ duration_minutes, provider_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "failed to fetch availability" });
        }
});

export default router