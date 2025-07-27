import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types";
import { apiService } from "../services/apiService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response: any = await apiService.getProfile(token);
          setUser(response.user);
        } catch (error) {
          localStorage.removeItem("auth_token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response: any = await apiService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("auth_token", response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response: any = await apiService.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("auth_token", response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
