import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/db/index.js";
import availabilityRouter from "./src/routes/availability.js";
import bookingsRouter from "./src/routes/bookings.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Service Booking Wizard API is running");
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM providers");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.use("/api", availabilityRouter);
app.use("/api", bookingsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});