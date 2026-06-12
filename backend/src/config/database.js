import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://medsync_user:medsync_password@postgres:5432/medsync_db",
});

export default pool;