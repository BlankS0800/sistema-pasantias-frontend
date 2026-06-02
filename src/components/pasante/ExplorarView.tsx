import React, { useEffect, useState } from 'react';
import {
  Search,
  Building2,
  Calendar,
  Briefcase,
  ChevronRight,
  X,
  CheckCircle2,
  UserCircle,
  AlertCircle,
} from 'lucide-react';

import {
  listarPasantiasDisponibles,
  mostrarDetallePasantia,
  postularPasantia,
  listarMisInscripciones,
} from '../../services/pasantiaPasanteService';

import type { Pasantia } from '../../services/pasantiaPasanteService';

type Mensaje = {
  tipo: 'exito' | 'error' | 'info';
  texto: string;
};

export const ExplorarView: React.FC = () => {
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPasantia, setSelectedPasantia] = useState<Pasantia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [postulandoId, setPostulandoId] = useState<number | null>(null);
  const [idsPostulados, setIdsPostulados] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  useEffect(() => {
    cargarPasantias();
  }, []);

  const cargarPasantias = async () => {
    try {
      setIsLoading(true);
      setMensaje(null);

      const [dataPasantias, dataInscripciones] = await Promise.all([
        listarPasantiasDisponibles(),
        listarMisInscripciones(),
      ]);

      setPasantias(dataPasantias.pasantias || []);

      const postuladas = (dataInscripciones.boletas || []).map(
        (boleta) => boleta.id_pasantia
      );

      setIdsPostulados(postuladas);
    } catch (error: any) {
      console.error('Error cargando pasantías', error);

      setMensaje({
        tipo: 'error',
        texto: error?.message || 'No se pudieron cargar las pasantías disponibles.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verDetalle = async (id_pasantia: number) => {
    try {
      setMensaje(null);

      const data = await mostrarDetallePasantia(id_pasantia);

      setSelectedPasantia(data.pasantia);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error al cargar detalle', error);

      setMensaje({
        tipo: 'error',
        texto: error?.message || 'No se pudo cargar el detalle de la pasantía.',
      });
    }
  };

  const handlePostular = async (id_pasantia: number) => {
    if (yaPostulo(id_pasantia)) {
      setMensaje({
        tipo: 'info',
        texto: 'Ya postulaste a esta pasantía.',
      });

      setIsModalOpen(false);
      return;
    }

    setPostulandoId(id_pasantia);
    setMensaje(null);

    try {
      const data = await postularPasantia(id_pasantia);

      setIdsPostulados((prev) =>
        prev.includes(id_pasantia) ? prev : [...prev, id_pasantia]
      );

      setMensaje({
        tipo: 'exito',
        texto:
          data.message ||
          'Postulación enviada correctamente. Está en espera de aprobación.',
      });

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error al postular', error);

      const mensajeError = error?.message || 'No se pudo enviar la postulación.';

      if (
        mensajeError.toLowerCase().includes('ya postulaste') ||
        mensajeError.toLowerCase().includes('inscrito')
      ) {
        setIdsPostulados((prev) =>
          prev.includes(id_pasantia) ? prev : [...prev, id_pasantia]
        );

        setMensaje({
          tipo: 'info',
          texto: 'Ya postulaste a esta pasantía.',
        });

        setIsModalOpen(false);
        return;
      }

      setMensaje({
        tipo: 'error',
        texto: mensajeError,
      });
    } finally {
      setPostulandoId(null);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Por definir';

    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const obtenerNombreJefe = (pasantia: Pasantia) => {
    const usuario = pasantia.jefe_pasante?.usuario;

    if (!usuario) return 'Por asignar';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Por asignar';
  };

  const yaPostulo = (id_pasantia: number) => {
    return idsPostulados.includes(id_pasantia);
  };

  const obtenerClasesMensaje = (tipo: Mensaje['tipo']) => {
    if (tipo === 'exito') {
      return 'bg-main-green/10 border-main-green/30 text-main-green';
    }

    if (tipo === 'error') {
      return 'bg-red-50 border-red-200 text-red-600';
    }

    return 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse flex items-center gap-2">
          <Search className="animate-spin" size={20} />
          Buscando pasantías...
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

      {mensaje && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm font-semibold flex justify-between items-center gap-4 ${obtenerClasesMensaje(
            mensaje.tipo
          )}`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{mensaje.texto}</span>
          </div>

          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="font-bold opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {pasantias.length === 0 ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <Briefcase size={48} className="mx-auto text-medium-gray/50 mb-4" />

          <h3 className="text-lg font-bold text-dark-gray">
            No hay pasantías activas
          </h3>

          <p className="text-sm text-medium-gray mt-2">
            Por el momento las empresas no han publicado nuevas ofertas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pasantias.map((pas) => {
            const postulado = yaPostulo(pas.id_pasantia);

            return (
              <div
                key={pas.id_pasantia}
                className={`bg-white-main rounded-xl shadow-sm hover:shadow-md transition-shadow border p-6 flex flex-col h-full ${
                  postulado ? 'border-main-green/30' : 'border-light-gray'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-light-gray p-3 rounded-lg">
                      <Building2 size={24} className="text-institucional-blue" />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-dark-gray leading-tight">
                        {pas.nombre || 'Pasantía Disponible'}
                      </h3>

                      <p className="text-sm font-semibold text-secondary-blue">
                        {pas.empresa?.nombre || 'Empresa Confidencial'}
                      </p>

                      {postulado && (
                        <span className="inline-flex items-center gap-1 mt-2 bg-main-green/10 text-main-green px-2 py-1 rounded-md text-xs font-bold">
                          <CheckCircle2 size={13} />
                          Ya postulado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-medium-gray mb-6 line-clamp-2 flex-grow">
                  {pas.descripcion || 'Sin descripción detallada.'}
                </p>

                <div className="border-t border-light-gray/60 pt-4 flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2 text-xs text-dark-gray font-medium">
                    <Calendar size={14} className="text-main-green" />
                    Inicio: {formatearFecha(pas.fecha_inicio)}
                  </div>

                  <button
                    type="button"
                    onClick={() => verDetalle(pas.id_pasantia)}
                    className="text-institucional-blue hover:text-secondary-blue text-sm font-bold flex items-center gap-1 transition-colors"
                  >
                    Ver detalles <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedPasantia && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-light-gray flex justify-between items-center bg-institucional-blue text-white-main">
              <h3 className="text-xl font-bold font-montserrat">
                Detalles de la Pasantía
              </h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-dark-gray">
                  {selectedPasantia.nombre || 'Pasantía Profesional'}
                </h4>

                <div className="flex items-center gap-2 text-secondary-blue font-semibold mt-1">
                  <Building2 size={16} />
                  {selectedPasantia.empresa?.nombre || 'Empresa Confidencial'}
                </div>

                {yaPostulo(selectedPasantia.id_pasantia) && (
                  <span className="inline-flex items-center gap-1 mt-3 bg-main-green/10 text-main-green px-3 py-1 rounded-md text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Ya postulaste a esta pasantía
                  </span>
                )}
              </div>

              <div className="bg-light-gray/30 p-4 rounded-xl border border-light-gray/50">
                <p className="text-sm text-dark-gray leading-relaxed">
                  {selectedPasantia.descripcion || 'Sin descripción.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white-main border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-1">
                    Fecha de Inicio
                  </p>

                  <p className="text-sm font-bold text-dark-gray flex items-center gap-2">
                    <Calendar size={16} className="text-main-green" />
                    {formatearFecha(selectedPasantia.fecha_inicio)}
                  </p>
                </div>

                <div className="bg-white-main border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-1">
                    Fecha de Finalización
                  </p>

                  <p className="text-sm font-bold text-dark-gray flex items-center gap-2">
                    <Calendar size={16} className="text-red-500" />
                    {formatearFecha(selectedPasantia.fecha_fin)}
                  </p>
                </div>
              </div>

              <div className="bg-white-main border border-light-gray rounded-xl p-4">
                <p className="text-xs text-medium-gray font-bold uppercase mb-1">
                  Horario
                </p>

                <p className="text-sm font-bold text-dark-gray">
                  {selectedPasantia.horario || 'No especificado'}
                </p>
              </div>

              <div className="border-t border-light-gray pt-4">
                <p className="text-xs text-medium-gray font-bold uppercase mb-3">
                  Jefe de Pasantes Asignado
                </p>

                <div className="flex items-center gap-3">
                  <UserCircle size={36} className="text-institucional-blue" />

                  <div>
                    <p className="text-sm font-bold text-dark-gray">
                      {obtenerNombreJefe(selectedPasantia)}
                    </p>

                    <p className="text-xs text-medium-gray">
                      {selectedPasantia.jefe_pasante?.cargo || 'Contacto en la empresa'}
                    </p>

                    {selectedPasantia.jefe_pasante?.telefono && (
                      <p className="text-xs text-medium-gray">
                        Teléfono: {selectedPasantia.jefe_pasante.telefono}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedPasantia.documento_url && (
                <div className="border-t border-light-gray pt-4">
                  <a
                    href={selectedPasantia.documento_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-institucional-blue text-sm font-bold hover:underline"
                  >
                    Ver documento de la pasantía
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-light-gray bg-light-gray/20 flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-dark-gray hover:bg-light-gray transition-colors"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => handlePostular(selectedPasantia.id_pasantia)}
                disabled={
                  postulandoId === selectedPasantia.id_pasantia ||
                  yaPostulo(selectedPasantia.id_pasantia)
                }
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  yaPostulo(selectedPasantia.id_pasantia)
                    ? 'bg-light-gray text-medium-gray'
                    : 'bg-main-green hover:bg-soft-green text-white-main'
                }`}
              >
                {yaPostulo(selectedPasantia.id_pasantia) ? (
                  <>
                    <CheckCircle2 size={18} /> Ya postulado
                  </>
                ) : postulandoId === selectedPasantia.id_pasantia ? (
                  <>Procesando...</>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Postular a esta pasantía
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
