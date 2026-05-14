import React from 'react';

interface ModuloTemporalProps {
  titulo: string;
  descripcion: string;
}

export const ModuloTemporal: React.FC<ModuloTemporalProps> = ({ titulo, descripcion }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">{titulo}</h2>
    <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
      <p className="text-dark-gray text-sm">{descripcion}</p>
      <p className="text-medium-gray text-xs mt-4">Módulo pendiente de conectar con el backend.</p>
    </div>
  </div>
);