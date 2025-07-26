export const mockAPI = {
  // Simulated users database
  users: [
    {
      id: 1,
      username: "admin",
      email: "admin@school.com",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      fullName: "Administrator Sistem",
      createdAt: "2025-01-01",
    },
    {
      id: 2,
      username: "tu_staff",
      email: "tu@school.com",
      password: "tu123",
      role: "staff",
      fullName: "Staff Tata Usaha",
      createdAt: "2025-01-01",
    },
    {
      id: 3,
      username: "ahmad_fauzi",
      email: "ahmad.fauzi@student.com",
      password: "siswa123",
      role: "siswa",
      fullName: "Ahmad Fauzi",
      createdAt: "2025-01-01",
      studentId: 1,
    },
    {
      id: 4,
      username: "budi_santoso",
      email: "budi.santoso@parent.com",
      password: "parent123",
      role: "orangtua",
      fullName: "Budi Santoso",
      createdAt: "2025-01-01",
      studentId: 1, // Parent of Ahmad Fauzi
    },
    {
      id: 5,
      username: "siti_nurhaliza",
      email: "siti.nurhaliza@student.com",
      password: "siswa123",
      role: "siswa",
      fullName: "Siti Nurhaliza",
      createdAt: "2025-01-01",
      studentId: 2,
    },
    {
      id: 6,
      username: "ani_wijaya",
      email: "ani.wijaya@parent.com",
      password: "parent123",
      role: "orangtua",
      fullName: "Ani Wijaya",
      createdAt: "2025-01-01",
      studentId: 2, // Parent of Siti Nurhaliza
    },
  ],

  // Login function
  login: async (credentials: { username: string; password: string }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockAPI.users.find(
          (u) =>
            (u.username === credentials.username ||
              u.email === credentials.username) &&
            u.password === credentials.password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const token = `mock_token_${user.id}_${Date.now()}`;
          resolve({
            success: true,
            user: userWithoutPassword,
            token,
            message: "Login berhasil",
          });
        } else {
          reject({
            success: false,
            message: "Username/email atau password salah",
          });
        }
      }, 1000);
    });
  },

  // Register function
  register: async (userData: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if username or email already exists
        const existingUser = mockAPI.users.find(
          (u) => u.username === userData.username || u.email === userData.email
        );

        if (existingUser) {
          reject({
            success: false,
            message: "Username atau email sudah terdaftar",
          });
          return;
        }

        // Create new user
        const newUser = {
          id: mockAPI.users.length + 1,
          ...userData,
          role: userData.role || "staff",
          createdAt: new Date().toISOString().split("T")[0],
        };

        mockAPI.users.push(newUser);

        const { password, ...userWithoutPassword } = newUser;
        const token = `mock_token_${newUser.id}_${Date.now()}`;

        resolve({
          success: true,
          user: userWithoutPassword,
          token,
          message: "Registrasi berhasil",
        });
      }, 1000);
    });
  },

  // Get user profile
  getProfile: async (token: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Extract user ID from token (in real app, verify JWT)
        const userId = parseInt(token.split("_")[2]);
        const user = mockAPI.users.find((u) => u.id === userId);

        if (user) {
          const { password, ...userWithoutPassword } = user;
          resolve({
            success: true,
            user: userWithoutPassword,
          });
        } else {
          reject({
            success: false,
            message: "Token tidak valid",
          });
        }
      }, 500);
    });
  },
};
