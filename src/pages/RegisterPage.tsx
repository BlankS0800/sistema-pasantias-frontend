import React from 'react';
import { User, Mail, Lock, Phone, CheckCircle2 } from 'lucide-react'; // Añadimos Phone y quitamos los iconos de roles
import { Link } from 'react-router-dom'; // Usamos Link para la navegación interna
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-gray font-poppins">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-medium-gray/20 flex flex-col md:flex-row">
          
          {/* Panel Lateral Decorativo */}
          <div className="md:w-1/3 bg-main-green p-8 text-white-main flex flex-col justify-center space-y-4">
            <CheckCircle2 size={48} />
            <h2 className="text-2xl font-montserrat font-bold">Únete a la Red</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Forma parte del ecosistema que conecta el talento académico con el mundo profesional.
            </p>
          </div>

          {/* Formulario */}
          <form className="md:w-2/3 p-8 space-y-5">
            <h3 className="text-2xl font-bold text-institucional-blue font-montserrat mb-2">Crear Cuenta</h3>
            
            {/* Fila 1: Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Nombre</label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" 
                    placeholder="Ej: Juan" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Apellido</label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" 
                    placeholder="Ej: Pérez" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Correo y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Correo</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                  <input 
                    type="email" 
                    className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" 
                    placeholder="juan@correo.com" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Teléfono</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                  <input 
                    type="tel" 
                    className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" 
                    placeholder="Ej: 71234567" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Fila 3: Contraseña */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            {/* Términos y Botón */}
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" className="w-4 h-4 rounded text-main-green focus:ring-main-green cursor-pointer" id="terms" required />
              <label htmlFor="terms" className="text-xs text-dark-gray cursor-pointer">Acepto los términos y condiciones de uso.</label>
            </div>

            <button className="w-full bg-main-green hover:bg-soft-green text-white-main font-bold py-3 rounded-xl transition-all shadow-lg shadow-main-green/20">
              Completar Registro
            </button>

            <p className="text-center text-sm text-dark-gray">
              ¿Ya tienes cuenta? <Link to="/login" className="text-secondary-blue font-bold hover:underline">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};