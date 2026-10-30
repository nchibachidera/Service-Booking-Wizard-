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
    }
})