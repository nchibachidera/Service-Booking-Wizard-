import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { pool } = pg;

const pool = new pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on(connect, () => {
    console.log("connected to postgress");
});

export default pool;