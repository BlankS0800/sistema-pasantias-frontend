import React from 'react';
import logoIcon from '../assets/logo_icon.png'; 
import logoText from '../assets/logo_text.png';

export const Header: React.FC = () => {
  return (
    <header className="relative w-full bg-white-main shadow-md flex items-center justify-between z-50 border-b border-light-gray h-24 md:h-28 px-8">
      {/* 1. Contenedor Izquierdo: Icono del Logo (Agrandado) */}
      <div className="flex items-center">
        <img 
          src={logoIcon} 
          alt="Icono" 
          className="h-16 md:h-20 w-auto object-contain" 
        />
      </div>

      {/* 2. Contenedor Central: Letras del Logo (Agrandado y Centrado) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center w-max">
        <img 
          src={logoText} 
          alt="Sistema de Pasantías" 
          className="h-12 md:h-16 w-auto object-contain" 
        />
      </div>

      {/* 3. Contenedor Derecho: Botón de Login */}
      <div className="flex items-center">
        <button className="bg-institucional-blue hover:bg-secondary-blue text-white-main font-semibold py-3 px-8 rounded-xl transition-all duration-300 font-poppins text-base shadow-sm hover:shadow-md">
          Iniciar Sesión
        </button>
      </div>
    </header>
  );
};