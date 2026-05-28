import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TutorSidebar } from '../components/tutor/TutorSidebar';
import { TutorHeader } from '../components/tutor/TutorHeader';
import { TutorPasantesPanel } from '../components/tutor/TutorPasantesPanel';

type TutorModule = 'pasantes';

export const TutorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TutorModule>('pasantes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    const validarSesion = async () => {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!token || !usuarioGuardado) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login', { replace: true });
        return;
      }

      let usuarioParseado = null;

      try {
        usuarioParseado = JSON.parse(usuarioGuardado);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login', { replace: true });
        return;
      }

      const rol = usuarioParseado?.rol?.abreviacion;

      if (rol !== 'TUT' && rol !== 'TUTOR') {
        navigate('/', { replace: true });
        return;
      }

      setUsuario(usuarioParseado);
      setVerificandoSesion(false);
    };

    validarSesion();
  }, [navigate]);

  const handleLogout = async () => {
    setCerrandoSesion(true);

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setCerrandoSesion(false);
      navigate('/login', { replace: true });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pasantes':
      default:
        return <TutorPasantesPanel />;
    }
  };

  if (verificandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray font-poppins">
        <p className="text-institucional-blue font-semibold animate-pulse">
          Verificando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-light-gray font-poppins overflow-hidden">
      <TutorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        cerrandoSesion={cerrandoSesion}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TutorHeader
          usuario={usuario}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
