import React, { useState } from 'react';
import { Bell, UserCircle, Menu } from 'lucide-react';

interface HeaderProps {
  usuario: any;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({ usuario, setIsMobileMenuOpen }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificaciones] = useState([
    { id: 1, titulo: 'Actividad asignada', descripcion: 'El Jefe de Pasantes te ha asignado una nueva tarea.', leida: false, hora: 'Hace 10 min' },
    { id: 2, titulo: 'Documento aprobado', descripcion: 'Tu informe inicial fue revisado y aprobado.', leida: true, hora: 'Hace 2 horas' }
  ]);

  return (
    <header className="h-20 bg-white-main shadow-sm flex items-center justify-between md:justify-end px-4 md:px-8 z-10 border-b border-light-gray shrink-0">
      <button className="md:hidden p-2 text-institucional-blue" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="text-medium-gray hover:text-institucional-blue transition-colors relative">
            <Bell size={24} />
            {notificaciones.some(n => !n.leida) && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-main-green rounded-full border-2 border-white-main"></span>}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white-main rounded-xl shadow-xl border border-light-gray/50 overflow-hidden z-50 animate-in slide-in-from-top-2">
              <div className="p-4 border-b border-light-gray/50 bg-light-gray/20 flex justify-between items-center">
                <h4 className="font-bold text-institucional-blue text-sm">Notificaciones</h4>
                <span className="text-[10px] text-secondary-blue cursor-pointer font-semibold hover:underline">Marcar leídas</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificaciones.map(noti => (
                  <div key={noti.id} className={`p-4 border-b border-light-gray/30 hover:bg-light-gray/30 transition-colors cursor-pointer ${!noti.leida ? 'bg-secondary-blue/5' : ''}`}>
                    <p className="text-sm font-bold text-dark-gray">{noti.titulo}</p>
                    <p className="text-xs text-medium-gray mt-1 line-clamp-2">{noti.descripcion}</p>
                    <p className="text-[10px] text-medium-gray/70 mt-2 font-medium">{noti.hora}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-light-gray pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-institucional-blue">{usuario?.nombre || 'Pasante'} {usuario?.apellido || ''}</p>
            <p className="text-xs text-medium-gray">{usuario?.rol?.descripcion || 'Pasante'}</p>
          </div>
          <UserCircle size={40} className="text-main-green" />
        </div>
      </div>
    </header>
  );
};