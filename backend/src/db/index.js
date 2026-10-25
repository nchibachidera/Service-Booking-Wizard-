import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// return DATE columns as "YYYY-MM-DD" strings instead of JS Date objects
pg.types.setTypeParser(1082, (val) => val);

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("connect", () => {
    console.log("connected to postgres");
});

export default pool;