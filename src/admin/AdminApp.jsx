import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import AdminLayout from './layout/AdminLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import ProcessPage from './pages/ProcessPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';
import {
  BacklogPage,
  CategoriesPage,
  CommitteesPage,
  EditorialPage,
  HomeMenuPage,
  PdiPage,
  ProductsPage,
  SettingsPage,
  StrategicAgendaPage,
} from './AdminPages.jsx';
import { Spinner } from './components/ui.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <Protected>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="pdi" element={<PdiPage />} />
          <Route path="committees" element={<CommitteesPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="strategic" element={<StrategicAgendaPage />} />
          <Route path="process" element={<ProcessPage />} />
          <Route path="editorial" element={<EditorialPage />} />
          <Route path="home-menu" element={<HomeMenuPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
