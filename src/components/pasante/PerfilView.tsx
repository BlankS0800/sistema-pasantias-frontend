import React, { useEffect, useState } from 'react';
import {
  UserCircle,
  Edit,
  Save,
  X,
  IdCard,
  GraduationCap,
  Phone,
  MapPin,
  Mail,
  FileCheck,
  UploadCloud,
  Download,
  Eye,
} from 'lucide-react';

import {
  listarHistorialHojasVida,
  subirNuevaHojaVida,
  obtenerPreviewHojaVida,
} from '../../services/hojaVidaPasanteService';

import type {
  HojaVidaHistorial,
  HojaVidaPreview,
} from '../../services/hojaVidaPasanteService';

export const PerfilView: React.FC<{ usuario: any }> = ({ usuario }) => {
  const [perfilData, setPerfilData] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [perfilForm, setPerfilForm] = useState({
    telefono: '',
    direccion: '',
    ci: '',
    reg_universitario: '',
  });

  const [historialCv, setHistorialCv] = useState<HojaVidaHistorial[]>([]);
  const [ultimaHojaVida, setUltimaHojaVida] =
    useState<HojaVidaHistorial | null>(null);

  const [habilidades, setHabilidades] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmittingCv, setIsSubmittingCv] = useState(false);

  const [previewCv, setPreviewCv] = useState<HojaVidaPreview | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingPreviewId, setLoadingPreviewId] = useState<number | null>(null);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const cargarHistorialCv = async () => {
    const dataHv = await listarHistorialHojasVida();

    setHistorialCv(dataHv.hojas_vida || []);
    setUltimaHojaVida(dataHv.ultima_hoja_vida || null);

    if (dataHv.ultima_hoja_vida?.habilidades) {
      setHabilidades(dataHv.ultima_hoja_vida.habilidades);
    }
  };

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        const resPerfil = await fetch(`${baseUrl}/pasante/perfil`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (resPerfil.ok) {
          const dataPerfil = await resPerfil.json();

          setPerfilData(dataPerfil.pasante);

          setPerfilForm({
            telefono: dataPerfil.pasante?.telefono || '',
            direccion: dataPerfil.pasante?.direccion || '',
            ci: dataPerfil.pasante?.ci || '',
            reg_universitario: dataPerfil.pasante?.reg_universitario || '',
          });
        }

        await cargarHistorialCv();
      } catch (error) {
        console.error('Error cargando datos', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatos();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${baseUrl}/pasante/perfil`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(perfilForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Perfil actualizado correctamente.');
        setPerfilData({ ...perfilData, ...perfilForm });
        setIsEditingProfile(false);
      } else {
        alert(`Error al actualizar: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo en formato PDF.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar los 10MB.');
        return;
      }

      setCvFile(file);
    }
  };

  const handleSubmitCv = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFile) {
      alert('Debes seleccionar un archivo PDF.');
      return;
    }

    setIsSubmittingCv(true);

    try {
      const data = await subirNuevaHojaVida(habilidades, cvFile);

      alert(data.message || 'Hoja de vida registrada correctamente.');

      await cargarHistorialCv();

      setCvFile(null);

      const inputFile = document.getElementById(
        'cv-upload'
      ) as HTMLInputElement | null;

      if (inputFile) {
        inputFile.value = '';
      }
    } catch (error: any) {
      console.error('Error subiendo CV', error);
      alert(error.message || 'Error al subir la hoja de vida.');
    } finally {
      setIsSubmittingCv(false);
    }
  };

  const convertirBase64AUrlPdf = (base64: string, mime: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });

    return URL.createObjectURL(blob);
  };

  const handleVisualizarCv = async (id_hv: number) => {
    setLoadingPreviewId(id_hv);

    try {
      const data = await obtenerPreviewHojaVida(id_hv);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = convertirBase64AUrlPdf(
        data.hoja_vida.documento_base64,
        data.hoja_vida.documento_mime
      );

      setPreviewCv(data.hoja_vida);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (error: any) {
      console.error('Error cargando vista previa', error);
      alert(error.message || 'No se pudo visualizar el CV.');
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const cerrarPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPreviewCv(null);
    setIsPreviewOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Mi Perfil Personal
        </h2>

        {!isEditingProfile ? (
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Edit size={16} /> Editar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingProfile(false)}
            className="bg-light-gray text-dark-gray px-4 py-2 rounded-lg text-sm font-semibold border border-medium-gray/20 flex items-center gap-2"
          >
            <X size={16} /> Cancelar
          </button>
        )}
      </div>

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-light-gray/60">
          <div className="bg-light-gray p-4 rounded-full">
            <UserCircle size={64} className="text-main-green" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-dark-gray">
              {usuario?.nombre} {usuario?.apellido}
            </h3>

            <p className="text-sm text-medium-gray flex items-center gap-1 mt-1">
              <Mail size={14} /> {usuario?.email}
            </p>
          </div>
        </div>

        {!isEditingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-medium-gray uppercase">
                Cédula
              </p>

              <p className="font-medium flex items-center gap-2">
                <IdCard size={18} className="text-secondary-blue" />
                {perfilData?.ci || 'No registrado'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-medium-gray uppercase">
                Registro Univ.
              </p>

              <p className="font-medium flex items-center gap-2">
                <GraduationCap size={18} className="text-secondary-blue" />
                {perfilData?.reg_universitario || 'No registrado'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-medium-gray uppercase">
                Teléfono
              </p>

              <p className="font-medium flex items-center gap-2">
                <Phone size={18} className="text-secondary-blue" />
                {perfilData?.telefono || 'No registrado'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-medium-gray uppercase">
                Dirección
              </p>

              <p className="font-medium flex items-center gap-2">
                <MapPin size={18} className="text-secondary-blue" />
                {perfilData?.direccion || 'No registrado'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdatePerfil} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="CI"
                name="ci"
                value={perfilForm.ci}
                onChange={(e) =>
                  setPerfilForm({ ...perfilForm, ci: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Registro Univ."
                name="reg_universitario"
                value={perfilForm.reg_universitario}
                onChange={(e) =>
                  setPerfilForm({
                    ...perfilForm,
                    reg_universitario: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg"
                required
              />

              <input
                type="tel"
                placeholder="Teléfono"
                name="telefono"
                value={perfilForm.telefono}
                onChange={(e) =>
                  setPerfilForm({ ...perfilForm, telefono: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Dirección"
                name="direccion"
                value={perfilForm.direccion}
                onChange={(e) =>
                  setPerfilForm({ ...perfilForm, direccion: e.target.value })
                }
                className="w-full px-4 py-2 bg-light-gray/30 border rounded-lg"
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-main-green text-white-main px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold"
              >
                <Save size={18} /> Guardar Perfil
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-dark-gray">
              Historial de Hojas de Vida
            </h3>

            <p className="text-sm text-medium-gray mt-1">
              Sube tu CV en PDF. Cada archivo se guardará como una nueva
              versión.
            </p>
          </div>

          {ultimaHojaVida && (
            <span className="bg-main-green/10 text-main-green px-3 py-1 rounded-lg text-xs font-bold w-fit">
              Última versión: V{ultimaHojaVida.version}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmitCv} className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">
              Habilidades y Tecnologías
            </label>

            <textarea
              value={habilidades}
              onChange={(e) => setHabilidades(e.target.value)}
              placeholder="Ej: Programación en React, Laravel, gestión de bases de datos, liderazgo..."
              className="w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors min-h-[120px] resize-y"
            />
          </div>

          <div className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center bg-light-gray/10">
            <UploadCloud
              size={48}
              className="mx-auto mb-4 text-medium-gray/60"
            />

            {cvFile ? (
              <div className="mb-4">
                <p className="text-sm font-bold text-institucional-blue">
                  Archivo seleccionado:
                </p>

                <p className="text-xs text-dark-gray mt-1">{cvFile.name}</p>
              </div>
            ) : ultimaHojaVida ? (
              <div className="mb-4">
                <p className="text-sm font-bold text-dark-gray">
                  Último CV subido:
                </p>

                <p className="text-xs text-medium-gray mt-1">
                  {ultimaHojaVida.documento_nombre}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm font-semibold text-dark-gray">
                  Aún no subiste tu hoja de vida
                </p>

                <p className="text-xs text-medium-gray mt-1">
                  Selecciona tu primer CV en formato PDF.
                </p>
              </div>
            )}

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
              Elegir PDF
            </label>

            <p className="text-xs text-medium-gray mt-3">
              Tamaño máximo permitido: 10MB.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmittingCv || !cvFile}
              className="bg-main-green hover:bg-soft-green text-white-main px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              <FileCheck size={18} />
              {isSubmittingCv ? 'Subiendo CV...' : 'Subir nueva versión'}
            </button>
          </div>
        </form>

        <div className="border-t border-light-gray pt-6">
          <h4 className="text-sm font-bold text-dark-gray uppercase mb-4">
            Versiones subidas
          </h4>

          {historialCv.length === 0 ? (
            <div className="bg-light-gray/20 border border-light-gray rounded-xl p-8 text-center">
              <FileCheck
                size={42}
                className="mx-auto text-medium-gray/50 mb-3"
              />

              <p className="text-sm font-bold text-dark-gray">
                Aún no subiste ninguna hoja de vida
              </p>

              <p className="text-xs text-medium-gray mt-1">
                Cuando subas tu primer CV, aparecerá aquí como última versión.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historialCv.map((cv) => (
                <div
                  key={cv.id_hv}
                  className="border border-light-gray rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white-main"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-dark-gray">
                        V{cv.version} - {cv.documento_nombre}
                      </p>

                      {cv.es_ultima_version && (
                        <span className="bg-main-green/10 text-main-green px-2 py-0.5 rounded-md text-xs font-bold">
                          Última versión
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-medium-gray mt-1 line-clamp-2">
                      {cv.habilidades || 'Sin habilidades registradas'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVisualizarCv(cv.id_hv)}
                    disabled={loadingPreviewId === cv.id_hv}
                    className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    {loadingPreviewId === cv.id_hv
                      ? 'Cargando...'
                      : 'Visualizar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && previewCv && previewUrl && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="p-5 border-b border-light-gray flex justify-between items-center bg-institucional-blue text-white-main">
              <div>
                <h3 className="text-lg font-bold">Vista previa del CV</h3>

                <p className="text-xs opacity-90">
                  {previewCv.documento_nombre}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarPreview}
                className="hover:text-red-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-light-gray">
              <iframe
                src={previewUrl}
                title="Vista previa de hoja de vida"
                className="w-full h-full"
              />
            </div>

            <div className="p-4 border-t border-light-gray bg-white-main flex justify-end gap-3">
              <a
                href={previewUrl}
                download={previewCv.documento_nombre}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Download size={16} />
                Descargar
              </a>

              <button
                type="button"
                onClick={cerrarPreview}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
