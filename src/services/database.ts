import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "spp_system",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Database connection utilities
export class Database {
  static async query(text: string, params?: any[]): Promise<any> {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getClient(): Promise<PoolClient> {
    return await pool.connect();
  }

  static async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.query("SELECT NOW()");
      console.log("Database connected successfully:", result.rows[0].now);
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }

  static async closePool(): Promise<void> {
    await pool.end();
  }
}

export default Database;
