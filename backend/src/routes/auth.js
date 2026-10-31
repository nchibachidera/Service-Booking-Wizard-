import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";


const router = express.Router();

router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return res.status(400).json({ error: "email and password are required" });
        }

        const result = await pool.query(
            "SELECT id, name, email, password_hash FROM providers WHERE LOWER(email) = LOWER($1)",
            [email.trim()]
        );

        // Same message for "no such email" and "wrong password", so the
    // response never reveals which emails exist
    const invalid = () =>
        res.status(401).json({ error: "invalid email or password" });

    if (result.rows.lenth === 0) return invalid();

    const provider = result.rows[0];
    const matches = await bcrypt.compare(password, provider.password_hash);
    if (!matches) return invalid();

    const token = jwt.sign({ providerId: provider.id }), process.env.JWT_SECRET, {
        expiresIn: "8h"
    }
    }
})