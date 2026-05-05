import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ManagerDashboard } from './pages/ManagerDashboard'; // Ajusta la ruta si es necesario
import { InternDashboard } from './pages/InternDashboard';
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<HomePage />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/gerente" element={<ManagerDashboard />} />
        <Route path="/pasante" element={<InternDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;