import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { InternDashboard } from './pages/InternDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route
          path="/gerente/dashboard"
          element={
            <ProtectedRoute rolPermitido="GER_EMP">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pasante/dashboard"
          element={
            <ProtectedRoute rolPermitido="PAS">
              <InternDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;