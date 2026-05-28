import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { InternDashboard } from './pages/InternDashboard';
import { TutorDashboard } from './pages/TutorDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminDashboard } from './pages/AdminDashboard';

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
          path="/jefe/dashboard"
          element={
            <ProtectedRoute rolPermitido="ENC_PAS">
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

        <Route
          path="/tutor/dashboard"
          element={
            <ProtectedRoute rolPermitido="TUT">
              <TutorDashboard />
            </ProtectedRoute>
          }
        />  

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute rolPermitido="ADMIN">
               <AdminDashboard />
            </ProtectedRoute>
         }
        />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;