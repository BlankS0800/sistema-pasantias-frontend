import React, { useEffect, useState } from 'react';
import {
  Building2,
  Briefcase,
  FileText,
  Activity,
  ClipboardCheck,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo_icon.png';
import { EmpresaPanel } from '../components/empresa/EmpresaPanel';
import { PasantiasPanel } from '../components/pasantias/PasantiasPanel';
import { JefePasantiasPanel } from '../components/jefe/JefePasantiasPanel';
type Module =
  | 'dashboard'
  | 'empresa'
  | 'pasantias'
  | 'postulaciones'
  | 'seguimiento'
  | 'evaluacion'
  | 'reportes';

const API_URL = import.meta.env.VITE_API_URL;

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Module>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [usuario, setUsuario] = useState<any>(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
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

      const rol = usuarioParseado?.rol?.abreviacion;

      if (rol !== 'GER_EMP' && rol !== 'ENC_PAS') {
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

  const rolActual = usuario?.rol?.abreviacion;

  const navItemsGerente = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'empresa', label: 'Mi Empresa', icon: Building2 },
    { id: 'pasantias', label: 'Pasantías', icon: Briefcase },
    { id: 'postulaciones', label: 'Postulaciones', icon: FileText },
  ];

  const navItemsEncargado = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'empresa', label: 'Mi Empresa', icon: Building2 },
    { id: 'pasantias', label: 'Pasantías', icon: Briefcase },
    { id: 'postulaciones', label: 'Postulaciones', icon: FileText },
    { id: 'seguimiento', label: 'Seguimiento', icon: Activity },
    { id: 'evaluacion', label: 'Evaluación', icon: ClipboardCheck },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  const navItems = rolActual === 'GER_EMP' ? navItemsGerente : navItemsEncargado;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
              Panel de Control
            </h2>

            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-main-green" size={32} />
                <div>
                  <h3 className="text-lg font-bold text-dark-gray">
                    Sesión activa
                  </h3>
                  <p className="text-sm text-medium-gray">
                    La autenticación del gerente fue validada correctamente.
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
                  <strong>Teléfono:</strong> {usuario?.telefono || 'No registrado'}
                </p>
                <p>
                  <strong>Rol:</strong> {usuario?.rol?.descripcion}
                </p>
                <p>
                  <strong>Abreviación:</strong> {usuario?.rol?.abreviacion}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">
                  Pasantías Activas
                </p>
                <p className="text-3xl font-bold text-main-green mt-2">12</p>
              </div>

              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">
                  Postulaciones Pendientes
                </p>
                <p className="text-3xl font-bold text-secondary-blue mt-2">28</p>
              </div>

              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">
                  Informes por Revisar
                </p>
                <p className="text-3xl font-bold text-dark-gray mt-2">5</p>
              </div>
            </div>
          </div>
        );

      case 'empresa':
        return (
          <EmpresaPanel
            puedeGestionarEmpresa={usuario?.rol?.abreviacion === 'GER_EMP'}
            puedeGestionarEncargados={usuario?.rol?.abreviacion === 'GER_EMP'}
          />
        );

      case 'pasantias':
        if (usuario?.rol?.abreviacion === 'ENC_PAS') {
          return <JefePasantiasPanel />;
        }

        return (
          <PasantiasPanel
            puedeGestionar={usuario?.rol?.abreviacion === 'GER_EMP'}
          />
        );

      case 'postulaciones':
        return (
          <ModuloTemporal
            titulo="Postulaciones Recibidas"
            descripcion="Aquí se mostrarán las boletas de los estudiantes y las acciones para aprobar o rechazar."
          />
        );

      case 'seguimiento':
        return (
          <ModuloTemporal
            titulo="Seguimiento de Pasantes"
            descripcion="Aquí irá la revisión de actividades asignadas y control de bitácoras."
          />
        );

      case 'evaluacion':
        return (
          <ModuloTemporal
            titulo="Evaluación Final"
            descripcion="Aquí irá el módulo para revisar o emitir el informe final del pasante."
          />
        );

      case 'reportes':
        return (
          <ModuloTemporal
            titulo="Reportes y Consultas"
            descripcion="Aquí irán los reportes, gráficos y consultas del sistema de pasantías."
          />
        );

      default:
        return null;
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
            Gerencia
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
                  setActiveTab(item.id as Module);
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
                  {usuario?.nombre || 'Gerente'} {usuario?.apellido || ''}
                </p>
                <p className="text-xs text-medium-gray">
                  {usuario?.rol?.descripcion || 'Gerente de Empresa'}
                </p>
              </div>

              <UserCircle size={40} className="text-secondary-blue" />
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
        <p className="text-dark-gray">{descripcion}</p>
        <p className="text-medium-gray text-xs mt-4">
          Módulo pendiente de conectar. Por ahora solo estamos validando autenticación.
        </p>
      </div>
    </div>
  );
};