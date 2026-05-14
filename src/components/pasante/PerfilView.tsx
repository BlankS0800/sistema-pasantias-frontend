import React, { useEffect, useState } from 'react';
import { UserCircle, Edit, Save, X, IdCard, GraduationCap, Phone, MapPin, Mail, FileCheck } from 'lucide-react';

export const PerfilView: React.FC<{ usuario: any }> = ({ usuario }) => {
  const [perfilData, setPerfilData] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [perfilForm, setPerfilForm] = useState({ telefono: '', direccion: '', ci: '', reg_universitario: '' });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${baseUrl}/pasante/perfil`, { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          setPerfilData(data.pasante);
          setPerfilForm({ telefono: data.pasante?.telefono || '', direccion: data.pasante?.direccion || '', ci: data.pasante?.ci || '', reg_universitario: data.pasante?.reg_universitario || '' });
        }
      } catch (error) {
        console.error("Error cargando perfil", error);
      } finally { setIsLoading(false); }
    };
    fetchPerfil();
  }, []);

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseUrl}/pasante/perfil`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(perfilForm) });
      const data = await response.json();
      if (response.ok) {
        alert('Perfil actualizado correctamente.');
        setPerfilData({ ...perfilData, ...perfilForm });
        setIsEditingProfile(false);
      } else alert(`Error al actualizar: ${data.message}`);
    } catch (error) { console.error(error); alert("Error de conexión"); }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><p className="text-institucional-blue animate-pulse">Cargando perfil...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Mi Perfil Personal</h2>
        {!isEditingProfile ? (
          <button onClick={() => setIsEditingProfile(true)} className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"><Edit size={16} /> Editar</button>
        ) : (
          <button onClick={() => setIsEditingProfile(false)} className="bg-light-gray text-dark-gray px-4 py-2 rounded-lg text-sm font-semibold border border-medium-gray/20 flex items-center gap-2"><X size={16} /> Cancelar</button>
        )}
      </div>

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-light-gray/60">
          <div className="bg-light-gray p-4 rounded-full"><UserCircle size={64} className="text-main-green" /></div>
          <div>
            <h3 className="text-xl font-bold text-dark-gray">{usuario?.nombre} {usuario?.apellido}</h3>
            <p className="text-sm text-medium-gray flex items-center gap-1 mt-1"><Mail size={14} /> {usuario?.email}</p>
          </div>
        </div>

        {!isEditingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><p className="text-xs font-bold text-medium-gray uppercase">Cédula</p><p className="font-medium flex items-center gap-2"><IdCard size={18} className="text-secondary-blue" />{perfilData?.ci || 'No registrado'}</p></div>
            <div className="space-y-1"><p className="text-xs font-bold text-medium-gray uppercase">Registro Univ.</p><p className="font-medium flex items-center gap-2"><GraduationCap size={18} className="text-secondary-blue" />{perfilData?.reg_universitario || 'No registrado'}</p></div>
            <div className="space-y-1"><p className="text-xs font-bold text-medium-gray uppercase">Teléfono</p><p className="font-medium flex items-center gap-2"><Phone size={18} className="text-secondary-blue" />{perfilData?.telefono || 'No registrado'}</p></div>
            <div className="space-y-1"><p className="text-xs font-bold text-medium-gray uppercase">Dirección</p><p className="font-medium flex items-center gap-2"><MapPin size={18} className="text-secondary-blue" />{perfilData?.direccion || 'No registrado'}</p></div>
          </div>
        ) : (
          <form onSubmit={handleUpdatePerfil} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="CI" name="ci" value={perfilForm.ci} onChange={(e) => setPerfilForm({...perfilForm, ci: e.target.value})} className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg" required />
                <input type="text" placeholder="Registro Univ." name="reg_universitario" value={perfilForm.reg_universitario} onChange={(e) => setPerfilForm({...perfilForm, reg_universitario: e.target.value})} className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg" required />
                <input type="tel" placeholder="Teléfono" name="telefono" value={perfilForm.telefono} onChange={(e) => setPerfilForm({...perfilForm, telefono: e.target.value})} className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg" required />
                <input type="text" placeholder="Dirección" name="direccion" value={perfilForm.direccion} onChange={(e) => setPerfilForm({...perfilForm, direccion: e.target.value})} className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg" required />
             </div>
             <div className="flex justify-end pt-4"><button type="submit" className="bg-main-green text-white-main px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold"><Save size={18} /> Guardar</button></div>
          </form>
        )}
      </div>

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <h3 className="text-xl font-bold text-dark-gray mb-2">Hoja de Vida (CV)</h3>
        <div className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center bg-light-gray/10">
          <FileCheck size={48} className="mx-auto text-medium-gray/50 mb-4" />
          <p className="text-sm font-semibold mb-2">Aún no has subido tu Hoja de Vida</p>
          <button className="bg-institucional-blue text-white-main px-4 py-2 rounded-lg text-sm font-semibold">Subir PDF</button>
        </div>
      </div>
    </div>
  );
};