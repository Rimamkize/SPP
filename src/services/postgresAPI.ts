import Database from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  studentId?: number;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  studentId?: number;
}

export class PostgreSQLAPI {
  private static jwtSecret = "your-default-secret-key-change-in-production";

  // User Authentication
  static async login(credentials: LoginCredentials): Promise<any> {
    try {
      const query = `
        SELECT id, username, email, password_hash, role, full_name, student_id, created_at
        FROM users 
        WHERE username = $1 OR email = $1
      `;

      const result = await Database.query(query, [credentials.username]);

      if (result.rows.length === 0) {
        throw new Error("Username/email atau password salah");
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password_hash
      );

      if (!isValidPassword) {
        throw new Error("Username/email atau password salah");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        this.jwtSecret,
        { expiresIn: "24h" }
      );

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        studentId: user.student_id,
        createdAt: user.created_at,
      };

      return {
        success: true,
        user: userResponse,
        token,
        message: "Login berhasil",
      };
    } catch (error) {
      throw {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat login",
      };
    }
  }

  // User Registration
  static async register(userData: RegisterData): Promise<any> {
    try {
      // Check if user already exists
      const checkQuery = `
        SELECT id FROM users 
        WHERE username = $1 OR email = $2
      `;

      const existingUser = await Database.query(checkQuery, [
        userData.username,
        userData.email,
      ]);

      if (existingUser.rows.length > 0) {
        throw new Error("Username atau email sudah terdaftar");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insert new user
      const insertQuery = `
        INSERT INTO users (username, email, password_hash, role, full_name, student_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, email, role, full_name, student_id, created_at
      `;

      const result = await Database.query(insertQuery, [
        userData.username,
        userData.email,
        hashedPassword,
        userData.role || "staff",
        userData.fullName,
        userData.studentId || null,
      ]);

      const newUser = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
        this.jwtSecret,
        { expiresIn: "24h" }
      );

      const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.full_name,
        studentId: newUser.student_id,
        createdAt: newUser.created_at,
      };

      return {
        success: true,
        user: userResponse,
        token,
        message: "Registrasi berhasil",
      };
    } catch (error) {
      throw {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat registrasi",
      };
    }
  }

  // Get User Profile
  static async getProfile(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;

      const query = `
        SELECT id, username, email, role, full_name, student_id, created_at
        FROM users 
        WHERE id = $1
      `;

      const result = await Database.query(query, [decoded.userId]);

      if (result.rows.length === 0) {
        throw new Error("Token tidak valid");
      }

      const user = result.rows[0];

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          studentId: user.student_id,
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      throw {
        success: false,
        message: error instanceof Error ? error.message : "Token tidak valid",
      };
    }
  }

  // Students Management
  static async getStudents(): Promise<any> {
    try {
      const query = `
        SELECT id, name, class, parent_name, phone, email, spp_amount, 
               status, last_payment, total_debt, created_at
        FROM students 
        ORDER BY name ASC
      `;

      const result = await Database.query(query);

      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      throw {
        success: false,
        message: "Gagal mengambil data siswa",
      };
    }
  }

  static async getStudentById(id: number): Promise<any> {
    try {
      const query = `
        SELECT id, name, class, parent_name, phone, email, spp_amount, 
               status, last_payment, total_debt, created_at
        FROM students 
        WHERE id = $1
      `;

      const result = await Database.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error("Siswa tidak ditemukan");
      }

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      throw {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengambil data siswa",
      };
    }
  }

  // Payments Management
  static async getPayments(): Promise<any> {
    try {
      const query = `
        SELECT id, student_id, student_name, amount, payment_date as date, 
               method, status, created_at
        FROM payments 
        ORDER BY payment_date DESC
      `;

      const result = await Database.query(query);

      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      throw {
        success: false,
        message: "Gagal mengambil data pembayaran",
      };
    }
  }

  static async createPayment(paymentData: any): Promise<any> {
    try {
      const insertQuery = `
        INSERT INTO payments (student_id, student_name, amount, payment_date, method, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, student_id, student_name, amount, payment_date as date, method, status, created_at
      `;

      const result = await Database.query(insertQuery, [
        paymentData.studentId,
        paymentData.studentName,
        paymentData.amount,
        paymentData.date,
        paymentData.method,
        paymentData.status || "Pending",
      ]);

      return {
        success: true,
        data: result.rows[0],
        message: "Pembayaran berhasil dicatat",
      };
    } catch (error) {
      throw {
        success: false,
        message: "Gagal mencatat pembayaran",
      };
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    return await Database.testConnection();
  }
}

export default PostgreSQLAPI;
