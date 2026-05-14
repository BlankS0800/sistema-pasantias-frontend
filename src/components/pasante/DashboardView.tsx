import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const DashboardView: React.FC<{ usuario: any }> = ({ usuario }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
      Bienvenida, {usuario?.nombre || 'Pasante'}
    </h2>
    <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="text-main-green" size={32} />
        <div>
          <h3 className="text-lg font-bold text-dark-gray">Sesión activa</h3>
          <p className="text-sm text-medium-gray">Tu autenticación fue validada correctamente.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-gray mt-6">
        <p><strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}</p>
        <p><strong>Email:</strong> {usuario?.email}</p>
        <p><strong>Rol:</strong> {usuario?.rol?.descripcion}</p>
        <p><strong>Abreviación:</strong> {usuario?.rol?.abreviacion}</p>
      </div>
    </div>
  </div>
);