"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AuthService, { LoginData } from "@/services/AuthService";
import { User } from "@/services/UserService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await AuthService.me();
          setUser(data);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (data: LoginData) => {
    await AuthService.login(data);
    const userData = await AuthService.me();
    setUser(userData);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
