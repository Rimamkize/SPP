import Database from "../services/database";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

interface MigrationResult {
  success: boolean;
  message: string;
  error?: any;
}

export class DatabaseMigration {
  static async createTables(): Promise<MigrationResult> {
    try {
      console.log("Creating database tables...");

      // Users table
      await Database.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'siswa', 'orangtua')),
          full_name VARCHAR(100) NOT NULL,
          student_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Students table
      await Database.query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          class VARCHAR(20) NOT NULL,
          parent_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(100),
          spp_amount INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL CHECK (status IN ('Lunas', 'Tunggakan', 'Belum Bayar')),
          last_payment DATE,
          total_debt INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Payments table
      await Database.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
          student_name VARCHAR(100) NOT NULL,
          amount INTEGER NOT NULL,
          payment_date DATE NOT NULL,
          method VARCHAR(20) NOT NULL CHECK (method IN ('Transfer', 'Cash', 'E-Wallet')),
          status VARCHAR(20) NOT NULL CHECK (status IN ('Confirmed', 'Pending', 'Failed')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Notifications table
      await Database.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
        )
      `);

      // Create indexes
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_students_class ON students(class)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_students_status ON students(status)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date)"
      );
      await Database.query(
        "CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id)"
      );

      console.log("✅ Database tables created successfully");
      return { success: true, message: "Tables created successfully" };
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      return { success: false, message: "Failed to create tables", error };
    }
  }

  static async seedData(): Promise<MigrationResult> {
    try {
      console.log("Seeding initial data...");

      // Check if data already exists
      const userCheck = await Database.query("SELECT COUNT(*) FROM users");
      if (parseInt(userCheck.rows[0].count) > 0) {
        console.log("Data already exists, skipping seed...");
        return { success: true, message: "Data already exists" };
      }

      // Hash passwords
      const adminPassword = await bcrypt.hash("admin123", 10);
      const staffPassword = await bcrypt.hash("tu123", 10);
      const studentPassword = await bcrypt.hash("siswa123", 10);
      const parentPassword = await bcrypt.hash("parent123", 10);

      // Insert users
      await Database.query(
        `
        INSERT INTO users (username, email, password_hash, role, full_name, student_id) VALUES
        ('admin', 'admin@school.com', $1, 'admin', 'Administrator Sistem', NULL),
        ('tu_staff', 'tu@school.com', $2, 'staff', 'Staff Tata Usaha', NULL),
        ('ahmad_fauzi', 'ahmad.fauzi@student.com', $3, 'siswa', 'Ahmad Fauzi', 1),
        ('budi_santoso', 'budi.santoso@parent.com', $4, 'orangtua', 'Budi Santoso', 1),
        ('siti_nurhaliza', 'siti.nurhaliza@student.com', $3, 'siswa', 'Siti Nurhaliza', 2),
        ('ani_wijaya', 'ani.wijaya@parent.com', $4, 'orangtua', 'Ani Wijaya', 2)
      `,
        [adminPassword, staffPassword, studentPassword, parentPassword]
      );

      // Insert students
      await Database.query(`
        INSERT INTO students (name, class, parent_name, phone, email, spp_amount, status, last_payment, total_debt) VALUES
        ('Ahmad Fauzi', 'X-A', 'Budi Santoso', '6281234567890', 'budi@email.com', 500000, 'Lunas', '2025-01-15', 0),
        ('Siti Nurhaliza', 'XI-B', 'Ani Wijaya', '6281234567891', 'ani@email.com', 500000, 'Tunggakan', '2024-11-15', 1000000),
        ('Rahman Hidayat', 'XII-A', 'Dedi Rahman', '6281234567892', 'dedi@email.com', 450000, 'Belum Bayar', '2024-12-15', 450000),
        ('Maya Sari', 'X-B', 'Indra Sari', '6281234567893', 'indra@email.com', 500000, 'Lunas', '2025-01-20', 0),
        ('Rizki Pratama', 'XI-A', 'Slamet Pratama', '6281234567894', 'slamet@email.com', 500000, 'Tunggakan', '2024-10-15', 1500000)
      `);

      // Insert payments
      await Database.query(`
        INSERT INTO payments (student_id, student_name, amount, payment_date, method, status) VALUES
        (1, 'Ahmad Fauzi', 500000, '2025-01-15', 'Transfer', 'Confirmed'),
        (4, 'Maya Sari', 500000, '2025-01-20', 'Cash', 'Confirmed'),
        (3, 'Rahman Hidayat', 450000, '2025-01-18', 'Transfer', 'Pending'),
        (2, 'Siti Nurhaliza', 500000, '2025-01-10', 'Cash', 'Confirmed'),
        (5, 'Rizki Pratama', 500000, '2025-01-12', 'Transfer', 'Confirmed')
      `);

      console.log("✅ Initial data seeded successfully");
      return { success: true, message: "Data seeded successfully" };
    } catch (error) {
      console.error("❌ Error seeding data:", error);
      return { success: false, message: "Failed to seed data", error };
    }
  }

  static async runMigration(): Promise<void> {
    try {
      console.log("🚀 Starting database migration...");

      // Test connection
      const connected = await Database.testConnection();
      if (!connected) {
        throw new Error("Cannot connect to database");
      }

      // Create tables
      const tablesResult = await this.createTables();
      if (!tablesResult.success) {
        throw new Error(tablesResult.message);
      }

      // Seed data
      const seedResult = await this.seedData();
      if (!seedResult.success) {
        throw new Error(seedResult.message);
      }

      console.log("✅ Database migration completed successfully!");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    } finally {
      await Database.closePool();
    }
  }
}

// Run migration if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  DatabaseMigration.runMigration();
}
