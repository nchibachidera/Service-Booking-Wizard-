import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/db/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Service Booking Wizard API is runing");
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`server runing on port ${PORT}`);
});