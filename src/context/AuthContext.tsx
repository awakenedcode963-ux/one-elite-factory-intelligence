import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { createContext, useContext, useEffect, useState } from 'react';



interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('polo_auth_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pin: string) => {
    try {
      const data = await fetchMasterData();
      const employee = data.employees.find(emp => emp.Username === username && String(emp.Password_PIN) === String(pin));
      
      if (employee) {
        const loggedUser: User = {
          id: employee.Username || employee.Employee_Name, name: employee.Employee_Name,
          username: employee.Username || username,
          role: employee.Role,
          department: employee.Department
        };
        setUser(loggedUser);
        localStorage.setItem('polo_auth_session', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login fetch error", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('polo_auth_session');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
