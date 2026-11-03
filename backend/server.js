import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import availabilityRouter from "./src/routes/availability.js";
import bookingsRouter from "./src/routes/bookings.js";
import servicesRouter from "./src/routes/services.js";
import authRouter from "./src/routes/auth.js";
import adminRouter from "./src/routes/admin.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error(
        "JWT_SECRET is missing or too short. Set a random value of at least 32 characters in .env"
    );
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Service Booking Wizard API is running");
});

app.use("/api", availabilityRouter);
app.use("/api", bookingsRouter);
app.use("/api", servicesRouter);
app.use("/api", authRouter);
app.use("/api", adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});