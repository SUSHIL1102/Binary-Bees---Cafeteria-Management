import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  employee: { id: string; email: string; name: string } | null;
  login: (token: string, employee: { id: string; email: string; name: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "cafeteria_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [employee, setEmployee] = useState<{ id: string; email: string; name: string } | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + "_employee");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((t: string, emp: { id: string; email: string; name: string }) => {
    localStorage.setItem(STORAGE_KEY, t);
    localStorage.setItem(STORAGE_KEY + "_employee", JSON.stringify(emp));
    setTokenState(t);
    setEmployee(emp);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + "_employee");
    setTokenState(null);
    setEmployee(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
