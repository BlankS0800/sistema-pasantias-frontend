import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Importación de submódulos modularizados ---
import { ModuloTemporal } from '../components/pasante/ModuloTemporal';
import { DashboardView } from '../components/pasante/DashboardView';
import { PerfilView } from '../components/pasante/PerfilView';
import { SeguimientoView } from '../components/pasante/SeguimientoView';
import { ExplorarView } from '../components/pasante/ExplorarView';
import { BoletaView } from '../components/pasante/BoletaView';
import { Sidebar } from '../components/pasante/Sidebar';
import { Header } from '../components/pasante/Header';
import { ChatWidget } from '../components/pasante/Chatwidget';

type InternModule = 
  | 'dashboard' 
  | 'perfil' 
  | 'explorar' 
  | 'mis-postulaciones' 
  | 'seguimiento' 
  | 'informe';

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estados Globales de UI
  const [activeTab, setActiveTab] = useState<InternModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados de Autenticación
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Validación de sesión inicial
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
        navigate('/login', { replace: true });
        return;
      }

      // Proteger la ruta: Solo usuarios con rol "PAS" (Pasante) pueden entrar
      if (usuarioParseado?.rol?.abreviacion !== 'PAS') {
        navigate('/', { replace: true });
        return;
      }

      setUsuario(usuarioParseado);
      setVerificandoSesion(false);
    };

    validarSesion();
  }, [navigate]);

  // Manejo de Cierre de Sesión
  const handleLogout = async () => {
    setCerrandoSesion(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
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

  // Renderizador dinámico de vistas
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
      case 'informe': 
        return <ModuloTemporal titulo="Informe Final" descripcion="Aquí subirás y gestionarás tu informe final al terminar la pasantía." />;
      default: 
        return <ModuloTemporal titulo="En construcción" descripcion="Pronto estará disponible." />;
    }
  };

  // Pantalla de carga mientras se verifica el token
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
      
      {/* Barra Lateral (Menú) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        handleLogout={handleLogout} 
        cerrandoSesion={cerrandoSesion} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Cabecera (Notificaciones y Perfil) */}
        <Header 
          usuario={usuario} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />

        {/* Contenedor Dinámico (Aquí se inyectan los módulos) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>

        {/* Chat Flotante con el Jefe de Pasantes */}
        <ChatWidget />

      </main>
    </div>
  );
};