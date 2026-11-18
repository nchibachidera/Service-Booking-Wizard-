import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import availabilityRouter from "./src/routes/availability.js";
import bookingsRouter from "./src/routes/bookings.js";
import manageRouter from "./src/routes/manage.js";
import servicesRouter from "./src/routes/services.js";
import authRouter from "./src/routes/auth.js";
import adminRouter from "./src/routes/admin.js";
import settingsRouter from "./src/routes/settings.js";
import publicRouter from "./src/routes/public.js";
import {
    apiLimiter,
    loginLimiter,
    bookingLimiter,
    lookupLimiter
} from "./src/middleware/rateLimits.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error(
        "JWT_SECRET is missing or too short. Set a random value of at least 32 characters in .env"
    );
    process.exit(1);
}

const app = express();

app.disable("x-powered-by");

// Behind a hosting proxy (Render, Railway and similar), set TRUST_PROXY=1 in the
// environment so each visitor is counted by their own address, not the proxy's.
// Leave it unset on your own computer.
if (process.env.TRUST_PROXY) {
    app.set("trust proxy", Number(process.env.TRUST_PROXY));
}

app.use(cors());
app.use("/api", apiLimiter);
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
    res.send("Service Booking Wizard API is running");
});

app.use("/api/auth/login", loginLimiter);
app.post("/api/bookings", bookingLimiter);
app.post("/api/bookings/lookup", lookupLimiter);
app.post("/api/bookings/cancel", lookupLimiter);

app.use("/api", availabilityRouter);
app.use("/api", bookingsRouter);
app.use("/api", manageRouter);
app.use("/api", servicesRouter);
app.use("/api", authRouter);
app.use("/api", adminRouter);
app.use("/api", settingsRouter);
app.use("/api", publicRouter);

// Unknown API addresses
app.use("/api", (req, res) => {
    res.status(404).json({ error: "not found" });
});

// Anything that goes wrong before a route answers, such as a request with broken JSON
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    const status = err.status || err.statusCode || 500;
    if (status >= 400 && status < 500) {
        return res.status(status).json({
            error: status === 413 ? "request too large" : "invalid request"
        });
    }

    console.error(err);
    res.status(500).json({ error: "something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});