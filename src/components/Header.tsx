import React from 'react';
import logoIcon from '../assets/logo_icon.png'; 

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white-main shadow-md py-4 px-8 flex justify-between items-center z-50">
      <div className="flex items-center">
        <img 
          src={logoIcon} 
          alt="Icono Sistema de Pasantías" 
          className="h-20 w-auto object-contain" 
        />
      </div>
      <button className="bg-institucional-blue hover:bg-secondary-blue text-white-main font-semibold py-2 px-8 rounded-md transition-colors duration-300 font-poppins text-base">
        Iniciar Sesión
      </button>
    </header>
  );
};