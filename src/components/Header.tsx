import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import logoIcon from '../assets/logo_icon.png'; 
import logoText from '../assets/logo_text.png';

export const Header: React.FC = () => {
  return (
    <header className="relative w-full bg-white-main shadow-md flex items-center justify-between z-50 border-b border-light-gray h-24 md:h-28 px-8">
      
      {/* Contenedor Izquierdo: Icono del Logo (Ahora es clickeable hacia el inicio) */}
      <div className="flex items-center">
        <Link to="/" className="cursor-pointer">
          <img 
            src={logoIcon} 
            alt="Icono" 
            className="h-16 md:h-20 w-auto object-contain transition-transform hover:scale-105 duration-300" 
          />
        </Link>
      </div>

      {/* Contenedor Central: Letras del Logo (También clickeable) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center w-max">
        <Link to="/" className="cursor-pointer">
          <img 
            src={logoText} 
            alt="Sistema de Pasantías" 
            className="h-12 md:h-16 w-auto object-contain transition-opacity hover:opacity-80 duration-300" 
          />
        </Link>
      </div>

      {/* Contenedor Derecho: Botones de Navegación */}
      <div className="flex items-center gap-4">
        {/* Cambiamos <button> por <Link> y añadimos la ruta en 'to' */}
        <Link 
          to="/login"
          className="bg-institucional-blue hover:bg-secondary-blue text-white-main font-semibold py-3 px-8 rounded-xl transition-all duration-300 font-poppins text-base shadow-sm hover:shadow-md inline-block text-center"
        >
          Iniciar Sesión
        </Link>
        <Link 
          to="/registro"
          className="bg-soft-green hover:bg-main-green text-white-main font-semibold py-3 px-8 rounded-xl transition-all duration-300 font-poppins text-base shadow-sm hover:shadow-md inline-block text-center"
        >
          Registrarse
        </Link>
      </div>
    </header>
  );
};