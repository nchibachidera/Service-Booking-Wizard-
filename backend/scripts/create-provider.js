import bcrypt from "bcryptjs";
import pool from "../src/db/index.js";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error(
    'Usage: node scripts/create-provider.js "Business Name" email@example.com password'
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

try {
  const passwordHash = await bcrypt.hash(password, 10);

  // If the email already exists, update that provider instead of adding a new one
  const result = await pool.query(
    `INSERT INTO providers (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id, name, email`,
    [name, email.trim().toLowerCase(), passwordHash]
  );

  console.log("Provider saved:", result.rows[0]);
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}