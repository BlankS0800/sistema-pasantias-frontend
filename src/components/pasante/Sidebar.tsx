import React from 'react';
import { LayoutDashboard, UserCircle, Search, FileCheck, ListTodo, BookOpen, LogOut, X } from 'lucide-react';
import logoIcon from '../../assets/logo_icon.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  handleLogout: () => void;
  cerrandoSesion: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, handleLogout, cerrandoSesion }) => {
  const navItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
    { id: 'perfil', label: 'Mi Perfil y CV', icon: UserCircle },
    { id: 'explorar', label: 'Buscar Pasantías', icon: Search },
    { id: 'mis-postulaciones', label: 'Boleta e Inscripción', icon: FileCheck },
    { id: 'seguimiento', label: 'Actividades y Bitácora', icon: ListTodo },
    { id: 'informe', label: 'Informe Final', icon: BookOpen },
  ];

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-institucional-blue text-white-main transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}>
      <div className="h-20 flex items-center justify-between md:justify-center border-b border-white-main/10 px-6">
        <div className="flex items-center">
          <img src={logoIcon} alt="Icono" className="h-10 w-auto mr-3 brightness-0 invert opacity-90" />
          <span className="font-montserrat font-bold text-lg tracking-wide">Pasante</span>
        </div>
        <button className="md:hidden text-white-main" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive ? 'bg-main-green text-white-main shadow-md' : 'text-white-main/70 hover:bg-white-main/10 hover:text-white-main'}`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white-main/10">
        <button onClick={handleLogout} disabled={cerrandoSesion} className="w-full flex items-center gap-3 px-4 py-3 text-white-main/70 hover:bg-white-main/10 hover:text-red-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
          <LogOut size={20} />
          {cerrandoSesion ? 'Cerrando...' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  );
};