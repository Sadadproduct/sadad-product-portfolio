import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import ExecutiveApp from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { PresentationProvider } from './data/PresentationProvider.jsx';
import { AuthProvider, useAuth } from './admin/AuthContext.jsx';
import { Spinner } from './admin/components/ui.jsx';

function PreviewGate({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route
          path="/preview"
          element={
            <AuthProvider>
              <PreviewGate>
                <PresentationProvider mode="draft">
                  <div className="bg-amber-500 text-slate-900 text-center text-sm font-bold py-2" style={{ fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}>
                    حالت پیش‌نمایش Draft — این صفحه Public نیست
                  </div>
                  <ExecutiveApp />
                </PresentationProvider>
              </PreviewGate>
            </AuthProvider>
          }
        />
        <Route
          path="/*"
          element={
            <PresentationProvider mode="public">
              <ExecutiveApp />
            </PresentationProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
