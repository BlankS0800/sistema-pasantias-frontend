import React, { useEffect, useState } from 'react';
import { 
  UserCircle, Edit, Save, X, IdCard, GraduationCap, Phone, 
  MapPin, Mail, FileCheck, UploadCloud, Download 
} from 'lucide-react';

export const PerfilView: React.FC<{ usuario: any }> = ({ usuario }) => {
  // Estados para Perfil
  const [perfilData, setPerfilData] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [perfilForm, setPerfilForm] = useState({ telefono: '', direccion: '', ci: '', reg_universitario: '' });

  // Estados para Hoja de Vida
  const [hojaVidaData, setHojaVidaData] = useState<any>(null);
  const [habilidades, setHabilidades] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmittingCv, setIsSubmittingCv] = useState(false);

  // Headers generales para JSON (no usar para subir archivos)
  const getAuthHeaders = () => ({ 
    'Content-Type': 'application/json', 
    Accept: 'application/json', 
    Authorization: `Bearer ${localStorage.getItem('token')}` 
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        // 1. Cargar Perfil
        const resPerfil = await fetch(`${baseUrl}/pasante/perfil`, { headers: getAuthHeaders() });
        if (resPerfil.ok) {
          const dataPerfil = await resPerfil.json();
          setPerfilData(dataPerfil.pasante);
          setPerfilForm({ 
            telefono: dataPerfil.pasante?.telefono || '', 
            direccion: dataPerfil.pasante?.direccion || '', 
            ci: dataPerfil.pasante?.ci || '', 
            reg_universitario: dataPerfil.pasante?.reg_universitario || '' 
          });
        }

        // 2. Cargar Hoja de Vida (si existe)
        const resHojaVida = await fetch(`${baseUrl}/pasante/hoja-vida`, { headers: getAuthHeaders() });
        if (resHojaVida.ok) {
          const dataHv = await resHojaVida.json();
          setHojaVidaData(dataHv.hoja_vida);
          setHabilidades(dataHv.hoja_vida?.habilidades || '');
        }

      } catch (error) {
        console.error("Error cargando datos", error);
      } finally { 
        setIsLoading(false); 
      }
    };
    
    fetchDatos();
  }, []);

  // --- Manejadores de Perfil ---
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
      } else {
        alert(`Error al actualizar: ${data.message}`);
      }
    } catch (error) { 
      console.error(error); alert("Error de conexión"); 
    }
  };

  // --- Manejadores de Hoja de Vida ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert("Por favor, selecciona un archivo en formato PDF.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB máximo
        alert("El archivo no debe superar los 10MB.");
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmitCv = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCv(true);

    // Usamos FormData porque vamos a enviar un archivo binario
    const formData = new FormData();
    if (habilidades) formData.append('habilidades', habilidades);
    if (cvFile) formData.append('documento', cvFile);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    let url = `${baseUrl}/pasante/hoja-vida`;
    
    // TRUCO DE LARAVEL: Si ya existe un CV, la ruta es PUT. Pero como enviamos archivos, 
    // debemos mandar un POST y camuflarlo como PUT dentro del FormData.
    if (hojaVidaData) {
      formData.append('_method', 'PUT');
    }

    try {
      const response = await fetch(url, {
        method: 'POST', // Siempre POST con FormData
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
          // IMPORTANTE: NO pongas 'Content-Type' aquí, el navegador lo genera automáticamente
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Hoja de vida guardada correctamente.');
        setHojaVidaData(data.hoja_vida);
        setCvFile(null); // Limpiamos el input de archivo
      } else {
        alert(`Error al guardar: ${data.message}`);
      }
    } catch (error) {
      console.error("Error subiendo CV", error);
      alert("Error de conexión al servidor.");
    } finally {
      setIsSubmittingCv(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><p className="text-institucional-blue animate-pulse">Cargando perfil...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- SECCIÓN DE PERFIL BÁSICO --- */}
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
             <div className="flex justify-end pt-4"><button type="submit" className="bg-main-green text-white-main px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold"><Save size={18} /> Guardar Perfil</button></div>
          </form>
        )}
      </div>

      {/* --- SECCIÓN DE HOJA DE VIDA --- */}
      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <h3 className="text-xl font-bold text-dark-gray mb-2">Hoja de Vida (CV)</h3>
        <p className="text-sm text-medium-gray mb-6">Describe tus habilidades destacadas y sube tu currículum en formato PDF.</p>
        
        <form onSubmit={handleSubmitCv} className="space-y-6">
          
          {/* Textarea para Habilidades */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Habilidades y Tecnologías</label>
            <textarea 
              value={habilidades}
              onChange={(e) => setHabilidades(e.target.value)}
              placeholder="Ej: Programación en React, Gestión de bases de datos, Liderazgo de equipos..."
              className="w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors min-h-[120px] resize-y"
            ></textarea>
          </div>

          {/* Área de Subida de Archivo */}
          <div className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center bg-light-gray/10 relative">
            <FileCheck size={48} className={`mx-auto mb-4 ${hojaVidaData ? 'text-main-green' : 'text-medium-gray/50'}`} />
            
            {hojaVidaData && !cvFile ? (
              // Estado 1: Ya hay un CV guardado y no se ha seleccionado nada nuevo
              <>
                <p className="text-sm font-bold text-dark-gray mb-1">Tu CV actual: {hojaVidaData.documento_nombre}</p>
                <a 
                  href={`data:${hojaVidaData.documento_mime};base64,${hojaVidaData.documento_base64}`} 
                  download={hojaVidaData.documento_nombre}
                  className="text-secondary-blue text-xs font-semibold hover:underline flex items-center justify-center gap-1 mb-4"
                >
                  <Download size={14} /> Descargar PDF actual
                </a>
              </>
            ) : cvFile ? (
              // Estado 2: El usuario seleccionó un archivo nuevo
              <div className="mb-4">
                <p className="text-sm font-bold text-institucional-blue">Archivo listo para subir:</p>
                <p className="text-xs text-dark-gray mt-1">{cvFile.name}</p>
              </div>
            ) : (
              // Estado 3: No hay CV y no se ha seleccionado nada
              <p className="text-sm font-semibold text-dark-gray mb-4">Aún no has subido tu Hoja de Vida</p>
            )}

            {/* Input oculto y botón de seleccionar */}
            <input 
              type="file" 
              accept="application/pdf" 
              id="cv-upload" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <label 
              htmlFor="cv-upload" 
              className="cursor-pointer bg-institucional-blue hover:bg-secondary-blue text-white-main px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
            >
              <UploadCloud size={18} />
              {hojaVidaData ? 'Reemplazar archivo PDF' : 'Seleccionar archivo PDF'}
            </label>
          </div>

          {/* Botón de envío de CV */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSubmittingCv || (!hojaVidaData && !cvFile)}
              className="bg-main-green hover:bg-soft-green text-white-main px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              <Save size={18} /> 
              {isSubmittingCv ? 'Guardando información...' : (hojaVidaData ? 'Actualizar Hoja de Vida' : 'Guardar Hoja de Vida')}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};