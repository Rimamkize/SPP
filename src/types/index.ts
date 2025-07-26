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
  name: string;
  class: string;
  parentName: string;
  phone: string;
  email: string;
  sppAmount: number;
  status: "Lunas" | "Belum Bayar" | "Tunggakan";
  lastPayment: string;
  totalDebt: number;
}

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  date: string;
  method: string;
  status: "Confirmed" | "Pending";
}
