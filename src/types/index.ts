export type UserRole = "admin" | "staff" | "siswa" | "orangtua";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
  studentId?: number; // For siswa and orangtua roles
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface Student {
  id: number;
  nisn: string; // 10-digit unique identifier
  name: string;
  class: string;
  parentName: string;
  phone: string;
  email: string;
  status: "Lunas" | "Belum Bayar" | "Tunggakan";
  lastPayment: string;
  totalDebt: number;
}

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  studentNisn: string;
  amount: number;
  date: string;
  method: "Transfer Bank" | "Cash" | "E-Wallet" | "Kartu Kredit";
  status: "Confirmed" | "Pending";
  description?: string;
  period: string; // e.g., "November 2024"
}
