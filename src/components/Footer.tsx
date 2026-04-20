import React from 'react';
import { Mail, Phone, Globe, Info, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-institucional-blue text-white-main pt-16 pb-8 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="text-soft-green w-6 h-6" />
            <h3 className="text-2xl font-montserrat font-bold">¿Quiénes somos?</h3>
          </div>
          <p className="text-light-gray leading-relaxed font-poppins opacity-90">
            Somos una plataforma orientada a la excelencia académica y profesional, 
            conectando el talento universitario con las mejores instituciones para 
            forjar el futuro laboral del país.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-montserrat font-bold">Contacto</h3>
          <ul className="space-y-3 font-poppins">
            <li className="flex items-center gap-3 text-light-gray hover:text-soft-green transition-colors">
              <Mail size={20} /> pasantias@fcpn.edu.bo
            </li>
            <li className="flex items-center gap-3 text-light-gray hover:text-soft-green transition-colors">
              <Phone size={20} /> +591 76271020
            </li>
            <li className="flex items-center gap-3 text-light-gray hover:text-soft-green transition-colors">
              <MapPin size={20} /> Av. Villazon 1995, Plaza del Bicentenario. Monoblock Central
            </li>
            <li className="flex items-center gap-3 text-light-gray hover:text-soft-green transition-colors">
              <Globe size={20} /> www.pasantias-u.com
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-secondary-blue text-center text-sm opacity-60">
        © {new Date().getFullYear()} Sistema de Pasantías | UMSA.
      </div>
    </footer>
  );
};