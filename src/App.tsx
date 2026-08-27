import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './lib/LanguageContext';
import { ThemeProvider } from './lib/ThemeContext';
import { SyncProvider } from './lib/SyncContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { ModuleIQC } from './pages/ModuleIQC';
import { ModuleIPQC } from './pages/ModuleIPQC';
import { ModuleFinalQC } from './pages/ModuleFinalQC';
import { ModuleCalibration } from './pages/ModuleCalibration';
import { ModuleAnalytics } from './pages/ModuleAnalytics';

import { ModuleNCR } from './pages/ModuleNCR';
import { ModuleCrusher } from './pages/ModuleCrusher';
import { ModuleComplaints } from './pages/ModuleComplaints';
import { ModuleExecutiveDashboard } from './pages/ModuleExecutiveDashboard';
import { ModuleProductionPlanning } from './pages/ModuleProductionPlanning';



function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <SyncProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Overview />} />
                <Route path="overview" element={<Navigate to="/" replace />} />
                <Route path="executive" element={<ModuleExecutiveDashboard />} />
                <Route path="production" element={<ModuleProductionPlanning />} />
                <Route path="iqc" element={<ModuleIQC />} />
                <Route path="ipqc" element={<ModuleIPQC />} />
                <Route path="final-qc" element={<ModuleFinalQC />} />
                <Route path="calibration" element={<ModuleCalibration />} />
                <Route path="analytics" element={<ModuleAnalytics />} />
                
                <Route path="ncr" element={<ModuleNCR />} />
                <Route path="crusher" element={<ModuleCrusher />} />
                <Route path="complaints" element={<ModuleComplaints />} />

              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
          </SyncProvider>
    </LanguageProvider>
  );
}
