// API Service that can switch between Mock and PostgreSQL modes
import { mockAPI } from './mockAPI';

// Lazy import PostgreSQL API only when needed and not in browser
let PostgreSQLAPI: any = null;

export interface APIService {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  getProfile: (token: string) => Promise<any>;
  getStudents?: () => Promise<any>;
  getPayments?: () => Promise<any>;
  createPayment?: (paymentData: any) => Promise<any>;
}

class UnifiedAPIService implements APIService {
  private async getPostgreSQLAPI() {
    if (!PostgreSQLAPI && typeof window === 'undefined') {
      try {
        const module = await import('./postgresAPI');
        PostgreSQLAPI = module.default;
      } catch (error) {
        console.warn('PostgreSQL API not available:', error);
        return null;
      }
    }
    return PostgreSQLAPI;
  }

  private getUsePostgres(): boolean {
    try {
      // Always use mock in browser environment
      if (typeof window !== 'undefined') {
        return false;
      }
      return process.env.NODE_ENV === 'production' || process.env.USE_POSTGRES === 'true';
    } catch {
      return false; // Fallback to mock if process.env is not available
    }
  }

  async login(credentials: { username: string; password: string }): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.login(credentials);
      }
    }
    return mockAPI.login(credentials);
  }

  async register(userData: any): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.register(userData);
      }
    }
    return mockAPI.register(userData);
  }

  async getProfile(token: string): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.getProfile(token);
      }
    }
    return mockAPI.getProfile(token);
  }

  async getStudents(): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.getStudents();
      }
    }
    // For mock API, return the mock students data
    const { mockStudents } = await import('../data/mockData');
    return {
      success: true,
      data: mockStudents
    };
  }

  async getPayments(): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.getPayments();
      }
    }
    // For mock API, return the mock payments data
    const { mockPayments } = await import('../data/mockData');
    return {
      success: true,
      data: mockPayments
    };
  }

  async createPayment(paymentData: any): Promise<any> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.createPayment(paymentData);
      }
    }
    // For mock API, simulate payment creation
    const { mockPayments } = await import('../data/mockData');
    const newPayment = {
      id: mockPayments.length + 1,
      ...paymentData,
      status: paymentData.status || 'Pending'
    };
    mockPayments.push(newPayment);
    return {
      success: true,
      data: newPayment,
      message: 'Pembayaran berhasil dicatat (mock)'
    };
  }

  async testConnection(): Promise<boolean> {
    if (this.getUsePostgres()) {
      const pgAPI = await this.getPostgreSQLAPI();
      if (pgAPI) {
        return pgAPI.testConnection();
      }
    }
    return true; // Mock API is always "connected"
  }

  // Get current mode
  getCurrentMode(): string {
    return this.getUsePostgres() ? 'PostgreSQL' : 'Mock';
  }
}

// Export singleton instance
export const apiService = new UnifiedAPIService();

// Export individual services for direct access if needed
export { mockAPI };

// Helper function to check if PostgreSQL is being used
export const isUsingPostgreSQL = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      return false; // Browser always uses mock
    }
    return process.env.NODE_ENV === 'production' || process.env.USE_POSTGRES === 'true';
  } catch {
    return false;
  }
};
