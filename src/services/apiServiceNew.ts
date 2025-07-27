// API Service that can switch between Mock and PostgreSQL modes
import { mockAPI } from "./mockAPI";
import PostgreSQLAPI from "./postgresAPI";

export interface APIService {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  getProfile: (token: string) => Promise<any>;
  getStudents?: () => Promise<any>;
  getPayments?: () => Promise<any>;
  createPayment?: (paymentData: any) => Promise<any>;
}

class UnifiedAPIService implements APIService {
  private getUsePostgres(): boolean {
    try {
      return (
        process.env.NODE_ENV === "production" ||
        process.env.USE_POSTGRES === "true"
      );
    } catch {
      return false; // Fallback to mock if process.env is not available
    }
  }

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.login(credentials);
    } else {
      return mockAPI.login(credentials);
    }
  }

  async register(userData: any): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.register(userData);
    } else {
      return mockAPI.register(userData);
    }
  }

  async getProfile(token: string): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.getProfile(token);
    } else {
      return mockAPI.getProfile(token);
    }
  }

  async getStudents(): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.getStudents();
    } else {
      // For mock API, return the mock students data
      const { mockStudents } = await import("../data/mockData");
      return {
        success: true,
        data: mockStudents,
      };
    }
  }

  async getPayments(): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.getPayments();
    } else {
      // For mock API, return the mock payments data
      const { mockPayments } = await import("../data/mockData");
      return {
        success: true,
        data: mockPayments,
      };
    }
  }

  async createPayment(paymentData: any): Promise<any> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.createPayment(paymentData);
    } else {
      // For mock API, simulate payment creation
      const { mockPayments } = await import("../data/mockData");
      const newPayment = {
        id: mockPayments.length + 1,
        ...paymentData,
        status: paymentData.status || "Pending",
      };
      mockPayments.push(newPayment);
      return {
        success: true,
        data: newPayment,
        message: "Pembayaran berhasil dicatat (mock)",
      };
    }
  }

  async testConnection(): Promise<boolean> {
    if (this.getUsePostgres()) {
      return PostgreSQLAPI.testConnection();
    } else {
      return true; // Mock API is always "connected"
    }
  }

  // Get current mode
  getCurrentMode(): string {
    return this.getUsePostgres() ? "PostgreSQL" : "Mock";
  }
}

// Export singleton instance
export const apiService = new UnifiedAPIService();

// Export individual services for direct access if needed
export { mockAPI, PostgreSQLAPI };

// Helper function to check if PostgreSQL is being used
export const isUsingPostgreSQL = (): boolean => {
  try {
    return (
      process.env.NODE_ENV === "production" ||
      process.env.USE_POSTGRES === "true"
    );
  } catch {
    return false;
  }
};
