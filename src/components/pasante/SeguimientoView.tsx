import React, { useEffect, useState } from 'react';
import { ListTodo, CheckCircle, Calendar } from 'lucide-react';

export const SeguimientoView: React.FC = () => {
  const [actividades, setActividades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}/pasante/actividades`, { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          setActividades(data.actividades || []);
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchActividades();
  }, []);

  const handleAvanceChange = (id: number, val: number) => setActividades(actividades.map(act => act.id_actividad === id ? { ...act, avance: val } : act));

  const guardarAvanceEnBD = async (id: number) => {
    const act = actividades.find(a => a.id_actividad === id);
    if (!act) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/pasante/actividades/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ avance: act.avance }) });
      const data = await response.json();
      alert(response.ok ? `¡Éxito! ${data.message}` : `Error: ${data.message}`);
    } catch (e) { alert("Error de conexión"); }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><p className="text-institucional-blue animate-pulse">Cargando actividades...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Seguimiento de Pasantía</h2>
      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <div className="flex justify-between items-center border-b border-light-gray pb-4 mb-6">
          <div><h3 className="text-xl font-bold text-dark-gray">Actividades Asignadas</h3><p className="text-sm text-medium-gray mt-1">Actualiza tu porcentaje de avance.</p></div>
          <div className="bg-institucional-blue/10 text-institucional-blue px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2"><ListTodo size={18} />{actividades.length} Tareas</div>
        </div>
        
        <div className="space-y-6">
          {actividades.length === 0 ? <p className="text-center text-medium-gray py-8">Aún no tienes actividades asignadas.</p> : actividades.map((act) => (
            <div key={act.id_actividad} className="border border-light-gray rounded-xl p-5 shadow-sm bg-light-gray/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-institucional-blue flex gap-2">{act.titulo} {act.avance === 100 && <CheckCircle size={18} className="text-main-green" />}</h4>
                  <p className="text-sm text-dark-gray mt-1">{act.descripcion}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs bg-white-main border px-2 py-1 rounded flex items-center gap-1"><Calendar size={12}/> Inicio: {new Date(act.fecha_inicio).toLocaleDateString()}</span>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1"><Calendar size={12}/> Fin: {new Date(act.fecha_fin).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-white-main p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold">Progreso</span><span className={`text-lg font-extrabold ${act.avance === 100 ? 'text-main-green' : 'text-secondary-blue'}`}>{act.avance || 0}%</span></div>
                <input type="range" min="0" max="100" value={act.avance || 0} onChange={(e) => handleAvanceChange(act.id_actividad, parseInt(e.target.value))} className="w-full accent-main-green" />
                <div className="flex justify-between items-center mt-4"><span className="text-xs italic text-medium-gray">Ajusta y guarda</span><button onClick={() => guardarAvanceEnBD(act.id_actividad)} className="bg-main-green text-white-main px-4 py-2 rounded-lg text-sm font-bold">Guardar Avance</button></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};