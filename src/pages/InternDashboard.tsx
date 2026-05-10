import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  UserCircle,
  Search,
  FileCheck,
  ListTodo,
  BookOpen,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo_icon.png';

type InternModule =
  | 'dashboard'
  | 'perfil'
  | 'explorar'
  | 'mis-postulaciones'
  | 'seguimiento'
  | 'informe';

const API_URL = import.meta.env.VITE_API_URL;

export const InternDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<InternModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const limpiarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const validarSesion = async () => {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!token || !usuarioGuardado) {
        limpiarSesion();
        navigate('/login', { replace: true });
        return;
      }

      let usuarioParseado = null;

      try {
        usuarioParseado = JSON.parse(usuarioGuardado);
      } catch {
        limpiarSesion();
        navigate('/login', { replace: true });
        return;
      }

      if (usuarioParseado?.rol?.abreviacion !== 'PAS') {
        navigate('/', { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          limpiarSesion();
          navigate('/login', { replace: true });
          return;
        }

        setUsuario(usuarioParseado);
      } catch (error) {
        limpiarSesion();
        navigate('/login', { replace: true });
      } finally {
        setVerificandoSesion(false);
      }
    };

    validarSesion();
  }, [navigate]);

  const handleLogout = async () => {
    setCerrandoSesion(true);

    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error al cerrar sesión en Laravel:', error);
    } finally {
      limpiarSesion();
      setCerrandoSesion(false);
      navigate('/login', { replace: true });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
    { id: 'perfil', label: 'Mi Perfil y CV', icon: UserCircle },
    { id: 'explorar', label: 'Buscar Pasantías', icon: Search },
    { id: 'mis-postulaciones', label: 'Boleta e Inscripción', icon: FileCheck },
    { id: 'seguimiento', label: 'Actividades y Bitácora', icon: ListTodo },
    { id: 'informe', label: 'Informe Final', icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
              Bienvenida, {usuario?.nombre || 'Pasante'}
            </h2>

            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-main-green" size={32} />
                <div>
                  <h3 className="text-lg font-bold text-dark-gray">
                    Sesión activa
                  </h3>
                  <p className="text-sm text-medium-gray">
                    Tu autenticación fue validada correctamente con Laravel Sanctum.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-gray mt-6">
                <p>
                  <strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}
                </p>
                <p>
                  <strong>Email:</strong> {usuario?.email}
                </p>
                <p>
                  <strong>Rol:</strong> {usuario?.rol?.descripcion}
                </p>
                <p>
                  <strong>Abreviación:</strong> {usuario?.rol?.abreviacion}
                </p>
              </div>
            </div>
          </div>
        );

      case 'perfil':
        return (
          <ModuloTemporal
            titulo="Mi Perfil y CV"
            descripcion="Aquí irá la información personal del pasante y la hoja de vida."
          />
        );

      case 'explorar':
        return (
          <ModuloTemporal
            titulo="Buscar Pasantías"
            descripcion="Aquí se mostrarán las pasantías disponibles para postular."
          />
        );

      case 'mis-postulaciones':
        return (
          <ModuloTemporal
            titulo="Boleta e Inscripción"
            descripcion="Aquí se mostrará la boleta de inscripción y el estado de postulación."
          />
        );

      case 'seguimiento':
        return (
          <ModuloTemporal
            titulo="Actividades y Bitácora"
            descripcion="Aquí irán las actividades asignadas y el seguimiento del pasante."
          />
        );

      case 'informe':
        return (
          <ModuloTemporal
            titulo="Informe Final"
            descripcion="Aquí se registrará o consultará el informe final."
          />
        );

      default:
        return <p>Selecciona un módulo.</p>;
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
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-institucional-blue text-white-main rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-institucional-blue text-white-main transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}
      >
        <div className="h-20 flex items-center justify-center border-b border-white-main/10 px-6">
          <img
            src={logoIcon}
            alt="Icono"
            className="h-10 w-auto mr-3 brightness-0 invert opacity-90"
          />
          <span className="font-montserrat font-bold text-lg tracking-wide">
            Pasante
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as InternModule);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive
                    ? 'bg-main-green text-white-main shadow-md'
                    : 'text-white-main/70 hover:bg-white-main/10 hover:text-white-main'
                  }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white-main/10">
          <button
            onClick={handleLogout}
            disabled={cerrandoSesion}
            className="w-full flex items-center gap-3 px-4 py-3 text-white-main/70 hover:bg-white-main/10 hover:text-red-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogOut size={20} />
            {cerrandoSesion ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white-main shadow-sm flex items-center justify-end px-8 z-10 border-b border-light-gray shrink-0">
          <div className="flex items-center gap-6">
            <button className="text-medium-gray hover:text-institucional-blue transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-main-green rounded-full border-2 border-white-main"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-light-gray pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-institucional-blue">
                  {usuario?.nombre || 'Pasante'} {usuario?.apellido || ''}
                </p>
                <p className="text-xs text-medium-gray">
                  {usuario?.rol?.descripcion || 'Pasante'}
                </p>
              </div>

              <UserCircle size={40} className="text-main-green" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface ModuloTemporalProps {
  titulo: string;
  descripcion: string;
}

const ModuloTemporal: React.FC<ModuloTemporalProps> = ({
  titulo,
  descripcion,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
        {titulo}
      </h2>

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <p className="text-dark-gray text-sm">{descripcion}</p>
        <p className="text-medium-gray text-xs mt-4">
          Módulo pendiente de conectar. Por ahora solo estamos validando autenticación.
        </p>
      </div>
    </div>
  );
};