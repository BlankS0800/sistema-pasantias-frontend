import React, { useEffect, useState } from 'react';
import { Search, Building2, Calendar, Briefcase, ChevronRight, X, CheckCircle2, UserCircle } from 'lucide-react';

export const ExplorarView: React.FC = () => {
  const [pasantias, setPasantias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPasantia, setSelectedPasantia] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  // Cargar todas las pasantías activas
  useEffect(() => {
    const fetchPasantias = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}/pasante/pasantias`, { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          // Tu controlador devuelve: 'pasantias' => $pasantias
          setPasantias(data.pasantias || []);
        }
      } catch (error) {
        console.error("Error cargando pasantías", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPasantias();
  }, []);

  // Cargar detalles de una pasantía específica
  const verDetalle = async (id: number) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseUrl}/pasante/pasantias/${id}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setSelectedPasantia(data.pasantia);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar detalle", error);
    }
  };

  // Enviar solicitud (Inscripción)
  const handlePostular = async (id_pasantia: number) => {
    if (!confirm('¿Estás seguro de que deseas postular a esta pasantía?')) return;
    
    setIsApplying(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      // Usamos la ruta de tu api.php: Route::post('/inscripcion/{id_pasantia}')
      const response = await fetch(`${baseUrl}/pasante/inscripcion/${id_pasantia}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`¡Éxito! ${data.message || 'Postulación enviada correctamente.'}`);
        setIsModalOpen(false);
      } else {
        alert(`No se pudo postular: ${data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al postular", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse flex items-center gap-2">
          <Search className="animate-spin" size={20} /> Buscando pasantías...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Explorar Pasantías
        </h2>
        <span className="bg-institucional-blue/10 text-institucional-blue px-3 py-1 rounded-lg text-sm font-bold">
          {pasantias.length} Disponibles
        </span>
      </div>

      {pasantias.length === 0 ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <Briefcase size={48} className="mx-auto text-medium-gray/50 mb-4" />
          <h3 className="text-lg font-bold text-dark-gray">No hay pasantías activas</h3>
          <p className="text-sm text-medium-gray mt-2">Por el momento las empresas no han publicado nuevas ofertas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pasantias.map((pas) => (
            <div key={pas.id_pasantia} className="bg-white-main rounded-xl shadow-sm hover:shadow-md transition-shadow border border-light-gray p-6 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-light-gray p-3 rounded-lg">
                    <Building2 size={24} className="text-institucional-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark-gray leading-tight">
                      {/* Asumiendo que tu tabla pasantia tiene un titulo, o usamos el nombre de la empresa */}
                      {pas.titulo || 'Pasantía Disponible'}
                    </h3>
                    <p className="text-sm font-semibold text-secondary-blue">
                      {pas.empresa?.nombre_empresa || 'Empresa Confidencial'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-medium-gray mb-6 line-clamp-2 flex-grow">
                {pas.descripcion || 'Sin descripción detallada.'}
              </p>

              <div className="border-t border-light-gray/60 pt-4 flex justify-between items-center mt-auto">
                <div className="flex items-center gap-2 text-xs text-dark-gray font-medium">
                  <Calendar size={14} className="text-main-green" />
                  Inicio: {pas.fecha_inicio ? new Date(pas.fecha_inicio).toLocaleDateString() : 'Por definir'}
                </div>
                
                <button 
                  onClick={() => verDetalle(pas.id_pasantia)}
                  className="text-institucional-blue hover:text-secondary-blue text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  Ver detalles <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE DETALLES --- */}
      {isModalOpen && selectedPasantia && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-light-gray flex justify-between items-center bg-institucional-blue text-white-main">
              <h3 className="text-xl font-bold font-montserrat">Detalles de la Pasantía</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-red-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-dark-gray">{selectedPasantia.titulo || 'Pasantía Profesional'}</h4>
                <div className="flex items-center gap-2 text-secondary-blue font-semibold mt-1">
                  <Building2 size={16} /> {selectedPasantia.empresa?.nombre_empresa}
                </div>
              </div>

              <div className="bg-light-gray/30 p-4 rounded-xl border border-light-gray/50">
                <p className="text-sm text-dark-gray leading-relaxed">
                  {selectedPasantia.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white-main border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-1">Fecha de Inicio</p>
                  <p className="text-sm font-bold text-dark-gray flex items-center gap-2">
                    <Calendar size={16} className="text-main-green" />
                    {selectedPasantia.fecha_inicio ? new Date(selectedPasantia.fecha_inicio).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-white-main border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-1">Fecha de Finalización</p>
                  <p className="text-sm font-bold text-dark-gray flex items-center gap-2">
                    <Calendar size={16} className="text-red-500" />
                    {selectedPasantia.fecha_fin ? new Date(selectedPasantia.fecha_fin).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t border-light-gray pt-4">
                <p className="text-xs text-medium-gray font-bold uppercase mb-3">Jefe de Pasantes Asignado</p>
                <div className="flex items-center gap-3">
                  <UserCircle size={36} className="text-institucional-blue" />
                  <div>
                    <p className="text-sm font-bold text-dark-gray">
                      {selectedPasantia.jefePasante?.nombre || 'Por asignar'} {selectedPasantia.jefePasante?.apellido || ''}
                    </p>
                    <p className="text-xs text-medium-gray">Contacto en la empresa</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-light-gray bg-light-gray/20 flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-dark-gray hover:bg-light-gray transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handlePostular(selectedPasantia.id_pasantia)}
                disabled={isApplying}
                className="bg-main-green hover:bg-soft-green text-white-main px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>Procesando...</>
                ) : (
                  <><CheckCircle2 size={18} /> Postular a esta pasantía</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};