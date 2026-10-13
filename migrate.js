require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Safety: migrations can only run on our test database for now.
if (process.env.DB_NAME !== "library_test_db") {
  console.error("Migration stopped: DB_NAME must be library_test_db");
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const folder = path.join(__dirname, "migrations");

    const files = fs
      .readdirSync(folder)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const existing = await client.query(
        "SELECT filename FROM schema_migrations WHERE filename = $1",
        [file],
      );

      if (existing.rows.length > 0) {
        console.log(`Skipped: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(folder, file), "utf8");

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );

        await client.query("COMMIT");
        console.log(`Applied: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("All migrations completed!");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
