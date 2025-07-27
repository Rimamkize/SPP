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
        SELECT id, nisn, name, class, parent_name, phone, email, spp_amount, 
               status, last_payment, total_debt, created_at
        FROM students 
        ORDER BY class, name
      `;

      const result = await Database.query(query);

      return {
        success: true,
        data: result.rows.map((row: any) => ({
          id: row.id,
          nisn: row.nisn,
          name: row.name,
          class: row.class,
          parentName: row.parent_name,
          phone: row.phone,
          email: row.email,
          sppAmount: parseInt(row.spp_amount),
          status: row.status,
          lastPayment: row.last_payment,
          totalDebt: parseInt(row.total_debt),
        })),
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

  // Student Management Methods
  static async createStudentWithAccounts(studentData: any): Promise<any> {
    const client = await Database.getClient();

    try {
      await client.query("BEGIN");

      // Check if NISN already exists
      const nisnCheck = await client.query(
        "SELECT id FROM students WHERE nisn = $1",
        [studentData.nisn]
      );

      if (nisnCheck.rows.length > 0) {
        throw new Error("NISN sudah terdaftar");
      }

      // Generate lowercased username from name
      const generateUsername = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric with underscore
          .replace(/_+/g, "_") // Replace multiple underscores with single
          .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
      };

      const nameBasedUsername = generateUsername(studentData.name);

      // Check if name-based username already exists
      const usernameCheck = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [nameBasedUsername]
      );

      if (usernameCheck.rows.length > 0) {
        throw new Error(
          `Username ${nameBasedUsername} sudah digunakan. Silakan gunakan nama yang berbeda.`
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(studentData.password, 10);

      // Insert student
      const studentQuery = `
        INSERT INTO students (nisn, name, class, parent_name, phone, email, spp_amount, status, last_payment, total_debt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const studentResult = await client.query(studentQuery, [
        studentData.nisn,
        studentData.name,
        studentData.class,
        studentData.parentName,
        studentData.phone,
        studentData.email,
        studentData.sppAmount,
        "Belum Bayar",
        "-",
        0,
      ]);

      const newStudent = studentResult.rows[0];

      // Create student account with NISN as primary username
      const studentAccountQuery = `
        INSERT INTO users (username, email, password_hash, role, full_name, student_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      await client.query(studentAccountQuery, [
        studentData.nisn, // Primary username = NISN
        studentData.email,
        hashedPassword,
        "siswa",
        studentData.name,
        newStudent.id,
      ]);

      // Create secondary student account with name-based username
      await client.query(studentAccountQuery, [
        nameBasedUsername, // Secondary username = lowercased name
        studentData.email,
        hashedPassword,
        "siswa",
        studentData.name,
        newStudent.id,
      ]);

      // Create parent account
      const parentAccountQuery = `
        INSERT INTO users (username, email, password_hash, role, full_name, student_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      await client.query(parentAccountQuery, [
        studentData.nisn + "_parent", // Parent username = NISN_parent
        studentData.email, // Could use parent email if provided separately
        hashedPassword,
        "orangtua",
        studentData.parentName,
        newStudent.id,
      ]);

      await client.query("COMMIT");

      return {
        success: true,
        data: {
          id: newStudent.id,
          nisn: newStudent.nisn,
          name: newStudent.name,
          class: newStudent.class,
          parentName: newStudent.parent_name,
          phone: newStudent.phone,
          email: newStudent.email,
          sppAmount: parseInt(newStudent.spp_amount),
          status: newStudent.status,
          lastPayment: newStudent.last_payment,
          totalDebt: parseInt(newStudent.total_debt),
          studentUsernames: [studentData.nisn, nameBasedUsername], // Multiple login options
          parentUsername: studentData.nisn + "_parent",
        },
        message: `Siswa dan akun berhasil dibuat. Login siswa dapat menggunakan: ${studentData.nisn} atau ${nameBasedUsername}`,
      };
    } catch (error: any) {
      await client.query("ROLLBACK");
      throw {
        success: false,
        message: error.message || "Gagal membuat siswa dan akun",
      };
    } finally {
      client.release();
    }
  }

  static async updateStudent(studentData: any): Promise<any> {
    try {
      const query = `
        UPDATE students 
        SET nisn = $2, name = $3, class = $4, parent_name = $5, 
            phone = $6, email = $7, spp_amount = $8
        WHERE id = $1
        RETURNING *
      `;

      const result = await Database.query(query, [
        studentData.id,
        studentData.nisn,
        studentData.name,
        studentData.class,
        studentData.parentName,
        studentData.phone,
        studentData.email,
        studentData.sppAmount,
      ]);

      if (result.rows.length === 0) {
        throw new Error("Siswa tidak ditemukan");
      }

      const updatedStudent = result.rows[0];

      return {
        success: true,
        data: {
          id: updatedStudent.id,
          nisn: updatedStudent.nisn,
          name: updatedStudent.name,
          class: updatedStudent.class,
          parentName: updatedStudent.parent_name,
          phone: updatedStudent.phone,
          email: updatedStudent.email,
          sppAmount: parseInt(updatedStudent.spp_amount),
          status: updatedStudent.status,
          lastPayment: updatedStudent.last_payment,
          totalDebt: parseInt(updatedStudent.total_debt),
        },
        message: "Data siswa berhasil diperbarui",
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || "Gagal memperbarui data siswa",
      };
    }
  }

  static async deleteStudent(studentId: number): Promise<any> {
    const client = await Database.getClient();

    try {
      await client.query("BEGIN");

      // Get student data before deletion
      const studentQuery = await client.query(
        "SELECT * FROM students WHERE id = $1",
        [studentId]
      );

      if (studentQuery.rows.length === 0) {
        throw new Error("Siswa tidak ditemukan");
      }

      const studentData = studentQuery.rows[0];

      // Delete related user accounts
      await client.query("DELETE FROM users WHERE student_id = $1", [
        studentId,
      ]);

      // Delete student
      await client.query("DELETE FROM students WHERE id = $1", [studentId]);

      await client.query("COMMIT");

      return {
        success: true,
        data: {
          id: studentData.id,
          nisn: studentData.nisn,
          name: studentData.name,
          class: studentData.class,
          parentName: studentData.parent_name,
          phone: studentData.phone,
          email: studentData.email,
          sppAmount: parseInt(studentData.spp_amount),
          status: studentData.status,
          lastPayment: studentData.last_payment,
          totalDebt: parseInt(studentData.total_debt),
        },
        message: "Siswa dan akun terkait berhasil dihapus",
      };
    } catch (error: any) {
      await client.query("ROLLBACK");
      throw {
        success: false,
        message: error.message || "Gagal menghapus siswa",
      };
    } finally {
      client.release();
    }
  }
}

export default PostgreSQLAPI;
