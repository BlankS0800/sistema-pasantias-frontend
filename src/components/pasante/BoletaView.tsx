import React, { useEffect, useState } from 'react';
import { 
  FileCheck, 
  Building2, 
  Calendar, 
  UserCircle, 
  Briefcase, 
  Clock,
  Download
} from 'lucide-react';

export const BoletaView: React.FC = () => {
  const [boleta, setBoleta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        // Llama a Route::get('/boleta', [BoletaPasanteController::class, 'show']);
        const response = await fetch(`${baseUrl}/pasante/boleta`, { headers: getAuthHeaders() });
        
        if (response.ok) {
          const data = await response.json();
          setBoleta(data.boleta); // El controlador devuelve 'boleta' => $boleta
        } 
        // Si devuelve 404, significa que no hay boleta (y boleta se queda en null)
      } catch (error) {
        console.error("Error al cargar la boleta", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoleta();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse flex items-center gap-2">
          <FileCheck className="animate-spin" size={20} /> Cargando boleta...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Mi Boleta de Inscripción
        </h2>
      </div>

      {!boleta ? (
        // ESTADO VACÍO: Si el servidor devolvió 404 (no hay boleta)
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <Briefcase size={48} className="mx-auto text-medium-gray/50 mb-4" />
          <h3 className="text-lg font-bold text-dark-gray">Aún no estás inscrito en ninguna pasantía</h3>
          <p className="text-sm text-medium-gray mt-2 mb-6">
            Ve a la sección "Buscar Pasantías" para explorar las ofertas disponibles y postularte a una.
          </p>
        </div>
      ) : (
        // ESTADO CON DATOS: Mostramos la boleta oficial
        <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray max-w-3xl mx-auto">
          
          <div className="border-b-2 border-main-green/20 pb-6 mb-6 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-medium-gray uppercase tracking-widest mb-1">Comprobante Oficial</p>
              <h3 className="text-2xl font-bold text-institucional-blue">
                Registro de Pasantía
              </h3>
            </div>
            <div className="bg-main-green/10 text-main-green px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
              <CheckCircle2 size={20} />
              Inscrito
            </div>
          </div>

          <div className="space-y-6">
            {/* Detalles de la Pasantía */}
            <div className="bg-light-gray/20 p-5 rounded-xl border border-light-gray flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <p className="text-xs font-bold text-medium-gray uppercase">Programa de Pasantía</p>
                <p className="text-lg font-bold text-dark-gray mt-1">
                  {boleta.pasantia?.titulo || 'Pasantía Profesional'}
                </p>
                <p className="text-sm font-semibold text-secondary-blue flex items-center gap-2 mt-1">
                  <Building2 size={16} />
                  {/* Si el backend trae la relación con empresa anidada, se mostraría aquí */}
                  Empresa Asignada
                </p>
              </div>
            </div>

            {/* Cuadrícula de Datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">Fecha de Inscripción</p>
                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <Calendar size={18} className="text-institucional-blue" />
                  {new Date(boleta.fecha).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">Estado / Observación</p>
                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <Clock size={18} className="text-institucional-blue" />
                  {boleta.descripcion || 'En revisión'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">Jefe de Pasantes</p>
                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <UserCircle size={18} className="text-institucional-blue" />
                  {boleta.jefe ? `${boleta.jefe.nombre} ${boleta.jefe.apellido}` : 'Asignación pendiente'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">Tutor Académico</p>
                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <UserCircle size={18} className="text-institucional-blue" />
                  {boleta.tutor ? `${boleta.tutor.nombre} ${boleta.tutor.apellido}` : 'Asignación pendiente'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-light-gray flex justify-end">
            <button className="bg-light-gray hover:bg-medium-gray/20 text-dark-gray px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-medium-gray/20">
              <Download size={18} /> Descargar PDF
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};

// Importar CheckCircle2 (solo para uso en BoletaView)
import { CheckCircle2 } from 'lucide-react';