/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
}

const AppContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_API_URL || https://rank-pilot-ai-rank-analyser.onrender.com;

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Axios instance with base URL
export const api = axios.create({
  baseURL: BACKEND_URL,
});

// Axios interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const { user: userData, token: newToken } = response.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { user: userData, token: newToken } = response.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const getProfile = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/auth/profile");
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      console.error("Get profile error:", error);
      logout();
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    getProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

