import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ModuloTemporal } from '../components/pasante/ModuloTemporal';
import { DashboardView } from '../components/pasante/DashboardView';
import { PerfilView } from '../components/pasante/PerfilView';
import { SeguimientoView } from '../components/pasante/SeguimientoView';
import { ExplorarView } from '../components/pasante/ExplorarView';
import { BoletaView } from '../components/pasante/BoletaView';
import { Sidebar } from '../components/pasante/Sidebar';
import { Header } from '../components/pasante/Header';
import { ChatWidget } from '../components/pasante/ChatWidget';
import { CertificadosView } from '../components/pasante/CertificadosView';

type InternModule =
  | 'dashboard'
  | 'perfil'
  | 'explorar'
  | 'mis-postulaciones'
  | 'seguimiento'
  | 'certificados';

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<InternModule>('dashboard');
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

      if (usuarioParseado?.rol?.abreviacion !== 'PAS') {
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
      case 'dashboard':
        return <DashboardView usuario={usuario} />;

      case 'perfil':
        return <PerfilView usuario={usuario} />;

      case 'explorar':
        return <ExplorarView />;

      case 'mis-postulaciones':
        return <BoletaView />;

      case 'seguimiento':
        return <SeguimientoView />;

      case 'certificados':
        return <CertificadosView />;

      default:
        return (
          <ModuloTemporal
            titulo="En construcción"
            descripcion="Pronto estará disponible."
          />
        );
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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        cerrandoSesion={cerrandoSesion}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header usuario={usuario} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>

        <ChatWidget />
      </main>
    </div>
  );
};
