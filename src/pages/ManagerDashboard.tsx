import React, { useState } from 'react';
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
  UserCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo_icon.png'; 

// Tipos para los módulos
type Module = 'dashboard' | 'empresa' | 'pasantias' | 'postulaciones' | 'seguimiento' | 'evaluacion' | 'reportes';

export const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Module>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lista de navegación basada en tus requerimientos
  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'empresa', label: 'Mi Empresa', icon: Building2 },
    { id: 'pasantias', label: 'Pasantías', icon: Briefcase },
    { id: 'postulaciones', label: 'Postulaciones', icon: FileText },
    { id: 'seguimiento', label: 'Seguimiento', icon: Activity },
    { id: 'evaluacion', label: 'Evaluación', icon: ClipboardCheck },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  // Función para renderizar el contenido dinámico según el módulo seleccionado
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Panel de Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjetas de resumen */}
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">Pasantías Activas</p>
                <p className="text-3xl font-bold text-main-green mt-2">12</p>
              </div>
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">Postulaciones Pendientes</p>
                <p className="text-3xl font-bold text-secondary-blue mt-2">28</p>
              </div>
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
                <p className="text-sm text-medium-gray font-semibold">Informes por Revisar</p>
                <p className="text-3xl font-bold text-dark-gray mt-2">5</p>
              </div>
            </div>
          </div>
        );
      case 'empresa':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Gestión de Empresa</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray flex flex-col gap-4">
              <p className="text-dark-gray">Aquí irá el módulo para <strong>Ver / Editar perfil de la empresa</strong>.</p>
              <p className="text-dark-gray">Y la tabla CRUD para gestionar a los <strong>Jefes de Pasante</strong>.</p>
            </div>
          </div>
        );
      case 'pasantias':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Ofertas de Pasantías</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <p className="text-dark-gray">Tabla <strong>CRUD</strong> de pasantías y formulario para <strong>Publicación</strong> de nuevas ofertas.</p>
            </div>
          </div>
        );
      case 'postulaciones':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Postulaciones Recibidas</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <p className="text-dark-gray">Lista para <strong>Ver boletas</strong> de los estudiantes y acciones para <strong>Aprobar / Rechazar</strong>.</p>
            </div>
          </div>
        );
      case 'seguimiento':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Seguimiento de Pasantes</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <p className="text-dark-gray">Revisión de <strong>Actividades</strong> asignadas y control de <strong>Bitácoras</strong> diarias/semanales.</p>
            </div>
          </div>
        );
      case 'evaluacion':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Evaluación Final</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <p className="text-dark-gray">Módulo para emitir y firmar el <strong>Informe Final</strong> de calificación del pasante.</p>
            </div>
          </div>
        );
      case 'reportes':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Reportes y Consultas</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
              <p className="text-dark-gray">Generación de gráficos y <strong>Consultas</strong> sobre el rendimiento histórico del programa de pasantías.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-light-gray font-poppins overflow-hidden">
      
      {/* Botón menú móvil */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-institucional-blue text-white-main rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar (Barra Lateral) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-institucional-blue text-white-main transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}>
        {/* Logo en Sidebar */}
        <div className="h-20 flex items-center justify-center border-b border-white-main/10 px-6">
          <img src={logoIcon} alt="Icono" className="h-10 w-auto mr-3 brightness-0 invert opacity-90" />
          <span className="font-montserrat font-bold text-lg tracking-wide">Gerencia</span>
        </div>

        {/* Navegación */}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-main-green text-white-main shadow-md' 
                    : 'text-white-main/70 hover:bg-white-main/10 hover:text-white-main'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-white-main' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Botón de Salir */}
        <div className="p-4 border-t border-white-main/10">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-3 text-white-main/70 hover:bg-white-main/10 hover:text-white-main hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Superior del Dashboard */}
        <header className="h-20 bg-white-main shadow-sm flex items-center justify-end px-8 z-10 border-b border-light-gray shrink-0">
          <div className="flex items-center gap-6">
            <button className="text-medium-gray hover:text-institucional-blue transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-main-green rounded-full border-2 border-white-main"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-light-gray pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-institucional-blue">Gerente General</p>
                <p className="text-xs text-medium-gray">TechCorp S.R.L.</p>
              </div>
              <UserCircle size={40} className="text-secondary-blue" />
            </div>
          </div>
        </header>

        {/* Contenedor del Módulo Activo (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};