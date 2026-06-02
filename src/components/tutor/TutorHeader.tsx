import React from 'react';
import { Menu } from 'lucide-react';


interface TutorHeaderProps {
  usuario: any;
  setIsMobileMenuOpen: (value: boolean) => void;
  setActiveTab: (tab: 'pasantes') => void;
}

export const TutorHeader: React.FC<TutorHeaderProps> = ({
  usuario,
  setIsMobileMenuOpen,
  setActiveTab,
}) => {
  return (
    <header className="h-20 bg-white-main border-b border-light-gray flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="md:hidden text-institucional-blue"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={26} />
        </button>

        <div>
          <h1 className="text-xl font-montserrat font-bold text-institucional-blue">
            Panel del Tutor
          </h1>

          <p className="text-xs text-medium-gray">
            Seguimiento académico de pasantes asignados
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        

        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-dark-gray">
            {usuario?.nombre} {usuario?.apellido}
          </p>

          <p className="text-xs text-medium-gray">
            Tutor
          </p>
        </div>
      </div>
    </header>
  );
};
