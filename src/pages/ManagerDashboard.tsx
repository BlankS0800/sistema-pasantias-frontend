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
  UserCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logoIcon from '../assets/logo_icon.png';
import { EmpresaPanel } from '../components/empresa/EmpresaPanel';
import { PasantiasPanel } from '../components/pasantias/PasantiasPanel';
import { JefePasantiasPanel } from '../components/jefe/JefePasantiasPanel';
import { PostulacionesPanel } from '../components/empresa/PostulacionesPanel';
import { JefeSeguimientoPanel } from '../components/jefe/JefeSeguimientoPanel';
import { NotificationBell } from '../components/notificaciones/NotificationBell';
import { EvaluacionFinalPanel } from '../components/jefe/EvaluacionFinalPanel';

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
          <DashboardInicio
            usuario={usuario}
            rolActual={rolActual}
            setActiveTab={setActiveTab}
          />
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
        return <PostulacionesPanel />;

      case 'seguimiento':
        return <JefeSeguimientoPanel />;

      case 'evaluacion':
        return <EvaluacionFinalPanel />;

      

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
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-institucional-blue text-white-main rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-institucional-blue text-white-main transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}
      >
        <div className="h-20 flex items-center justify-center border-b border-white-main/10 px-6">
          <img
            src={logoIcon}
            alt="Icono"
            className="h-10 w-auto mr-3 brightness-0 invert opacity-90"
          />

          <span className="font-montserrat font-bold text-lg tracking-wide">
            {rolActual === 'ENC_PAS' ? 'Jefe Pasante' : 'Gerencia'}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id as Module);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
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
            type="button"
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
            <div className="relative">
              <NotificationBell
                onNavigate={(url) => {
                  if (url?.includes('seguimiento')) {
                    setActiveTab('seguimiento');
                  }

                  if (url?.includes('evaluacion')) {
                    setActiveTab('evaluacion');
                  }

                  if (url?.includes('postulaciones')) {
                    setActiveTab('postulaciones');
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-3 border-l border-light-gray pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-institucional-blue">
                  {usuario?.nombre || 'Usuario'} {usuario?.apellido || ''}
                </p>

                <p className="text-xs text-medium-gray">
                  {usuario?.rol?.descripcion ||
                    (rolActual === 'ENC_PAS'
                      ? 'Jefe de Pasantes'
                      : 'Gerente de Empresa')}
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

interface DashboardInicioProps {
  usuario: any;
  rolActual?: string;
  setActiveTab: (tab: Module) => void;
}

const DashboardInicio: React.FC<DashboardInicioProps> = ({
  usuario,
  rolActual,
  setActiveTab,
}) => {
  const esGerente = rolActual === 'GER_EMP';
  const esJefe = rolActual === 'ENC_PAS';

  const nombreCompleto = `${usuario?.nombre || ''} ${
    usuario?.apellido || ''
  }`.trim();

  const acciones: {
    titulo: string;
    descripcion: string;
    icono: React.ElementType;
    tab: Module;
    color: string;
  }[] = esGerente
    ? [
        {
          titulo: 'Mi Empresa',
          descripcion: 'Revisa o actualiza los datos de la empresa.',
          icono: Building2,
          tab: 'empresa',
          color: 'bg-institucional-blue/10 text-institucional-blue',
        },
        {
          titulo: 'Pasantías',
          descripcion: 'Crea y administra las pasantías disponibles.',
          icono: Briefcase,
          tab: 'pasantias',
          color: 'bg-main-green/10 text-main-green',
        },
        {
          titulo: 'Postulaciones',
          descripcion: 'Revisa los pasantes que postularon.',
          icono: FileText,
          tab: 'postulaciones',
          color: 'bg-secondary-blue/10 text-secondary-blue',
        },
      ]
    : [
        {
          titulo: 'Mis Pasantías',
          descripcion: 'Gestiona actividades por pasantía asignada.',
          icono: Briefcase,
          tab: 'pasantias',
          color: 'bg-main-green/10 text-main-green',
        },
        {
          titulo: 'Seguimiento',
          descripcion: 'Revisa avances y retroalimentación.',
          icono: Activity,
          tab: 'seguimiento',
          color: 'bg-secondary-blue/10 text-secondary-blue',
        },
        {
          titulo: 'Evaluación Final',
          descripcion: 'Registra informes finales de pasantes.',
          icono: ClipboardCheck,
          tab: 'evaluacion',
          color: 'bg-orange-100 text-orange-700',
        },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative overflow-hidden bg-gradient-to-r from-institucional-blue via-secondary-blue to-main-green rounded-3xl p-8 text-white-main shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white-main/10 rounded-full" />
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white-main/10 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white-main/15 border border-white-main/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Sparkles size={16} />
              Panel de Control
            </div>

            <h2 className="text-3xl md:text-4xl font-montserrat font-extrabold">
              Bienvenido, {nombreCompleto || 'Usuario'}
            </h2>

            <p className="text-white-main/85 mt-3 max-w-2xl leading-relaxed">
              {esGerente
                ? 'Administra tu empresa, publica pasantías y revisa las postulaciones recibidas desde un solo lugar.'
                : 'Gestiona las pasantías asignadas, organiza actividades y realiza el seguimiento de tus pasantes.'}
            </p>
          </div>

          <div className="bg-white-main/15 border border-white-main/20 rounded-2xl p-5 min-w-[250px] backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-white-main/70 font-bold">
              Rol actual
            </p>

            <p className="text-xl font-bold mt-1">
              {esGerente
                ? 'Gerente de Empresa'
                : esJefe
                ? 'Jefe de Pasantes'
                : 'Usuario'}
            </p>

            <p className="text-xs text-white-main/75 mt-2">
              {usuario?.email || 'Sin correo registrado'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-institucional-blue">
                Accesos rápidos
              </h3>

              <p className="text-sm text-medium-gray">
                Ingresa directamente a las secciones más usadas.
              </p>
            </div>

            <CalendarDays className="text-main-green" size={28} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {acciones.map((accion) => {
              const Icon = accion.icono;

              return (
                <button
                  key={accion.titulo}
                  type="button"
                  onClick={() => setActiveTab(accion.tab)}
                  className="group border border-light-gray rounded-2xl p-5 text-left hover:border-main-green hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${accion.color}`}
                    >
                      <Icon size={25} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-medium-gray group-hover:text-main-green transition-colors"
                    />
                  </div>

                  <h4 className="font-bold text-dark-gray mt-4">
                    {accion.titulo}
                  </h4>

                  <p className="text-xs text-medium-gray mt-2 leading-relaxed">
                    {accion.descripcion}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-main-green/10 flex items-center justify-center">
              <ShieldCheck className="text-main-green" size={25} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-institucional-blue">
                Sesión activa
              </h3>

              <p className="text-xs text-medium-gray">
                Acceso validado correctamente
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <DatoInicio
              label="Usuario"
              value={nombreCompleto || 'No registrado'}
            />

            <DatoInicio
              label="Correo"
              value={usuario?.email || 'No registrado'}
            />

            <DatoInicio
              label="Teléfono"
              value={usuario?.telefono || 'No registrado'}
            />

            <DatoInicio
              label="Rol"
              value={
                esGerente
                  ? 'Gerente de Empresa'
                  : esJefe
                  ? 'Jefe de Pasantes'
                  : 'No registrado'
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary-blue/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-secondary-blue" size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-institucional-blue">
              Recomendación inicial
            </h3>

            <p className="text-sm text-medium-gray mt-1">
              {esGerente
                ? 'Verifica que tus pasantías tengan jefe de pasantes asignado y revisa las postulaciones pendientes.'
                : 'Selecciona una pasantía asignada para crear actividades o revisar el seguimiento de tus pasantes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DatoInicio: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <div className="border-b border-light-gray pb-3 last:border-b-0">
      <p className="text-xs font-bold text-medium-gray uppercase">
        {label}
      </p>

      <p className="font-semibold text-dark-gray mt-1">
        {value}
      </p>
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
