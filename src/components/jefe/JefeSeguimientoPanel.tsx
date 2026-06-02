import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Save,
  Send,
  UserCircle,
  X,
} from 'lucide-react';

import {
  actualizarProgresoActividadJefe,
  enviarMensajeActividad,
  listarActividadesSeguimiento,
  listarMensajesActividad,
  listarPasantiasSeguimiento,
} from '../../services/jefeSeguimientoService';

import type {
  ActividadMensaje,
  ActividadSeguimiento,
  PasantiaSeguimiento,
} from '../../services/jefeSeguimientoService';

type Aviso = {
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
};

export const JefeSeguimientoPanel: React.FC = () => {
  const [pasantias, setPasantias] = useState<PasantiaSeguimiento[]>([]);
  const [idPasantiaActiva, setIdPasantiaActiva] = useState<number | null>(null);
  const [actividades, setActividades] = useState<ActividadSeguimiento[]>([]);
  const [actividadForo, setActividadForo] = useState<ActividadSeguimiento | null>(null);
  const [mensajes, setMensajes] = useState<ActividadMensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoActividades, setCargandoActividades] = useState(false);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    cargarPasantias();
  }, []);

  useEffect(() => {
    if (idPasantiaActiva) {
      cargarActividades(idPasantiaActiva);
    }
  }, [idPasantiaActiva]);

  const cargarPasantias = async () => {
    try {
      setCargando(true);
      const data = await listarPasantiasSeguimiento();

      setPasantias(data.pasantias || []);

      if ((data.pasantias || []).length > 0) {
        setIdPasantiaActiva(data.pasantias[0].id_pasantia);
      }
    } catch (error: any) {
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudieron cargar las pasantías.',
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarActividades = async (idPasantia: number) => {
    try {
      setCargandoActividades(true);
      const data = await listarActividadesSeguimiento(idPasantia);

      setActividades(data.actividades || []);
    } catch (error: any) {
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudieron cargar las actividades.',
      });
    } finally {
      setCargandoActividades(false);
    }
  };

  const actualizarCampoLocal = (
    idActividad: number,
    campo: 'progreso' | 'resultado',
    valor: string | number
  ) => {
    setActividades((prev) =>
      prev.map((actividad) =>
        actividad.id_actividad === idActividad
          ? { ...actividad, [campo]: valor }
          : actividad
      )
    );
  };

  const guardarSeguimiento = async (actividad: ActividadSeguimiento) => {
    setGuardandoId(actividad.id_actividad);
    setAviso(null);

    try {
      const data = await actualizarProgresoActividadJefe(
        actividad.id_actividad,
        Number(actividad.progreso || 0),
        actividad.resultado || ''
      );

      setActividades((prev) =>
        prev.map((item) =>
          item.id_actividad === actividad.id_actividad ? data.actividad : item
        )
      );

      setAviso({
        tipo: 'success',
        mensaje: data.message || 'Seguimiento actualizado correctamente.',
      });
    } catch (error: any) {
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudo actualizar el seguimiento.',
      });
    } finally {
      setGuardandoId(null);
    }
  };

  const abrirForo = async (actividad: ActividadSeguimiento) => {
    setActividadForo(actividad);
    setMensajes([]);
    setNuevoMensaje('');

    try {
      const data = await listarMensajesActividad(actividad.id_actividad);
      setMensajes(data.mensajes || []);
    } catch (error: any) {
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudo cargar el foro.',
      });
    }
  };

  const enviarMensaje = async () => {
    if (!actividadForo || !nuevoMensaje.trim()) return;

    setEnviandoMensaje(true);

    try {
      const data = await enviarMensajeActividad(
        actividadForo.id_actividad,
        nuevoMensaje.trim()
      );

      setMensajes((prev) => [...prev, data.mensaje_foro]);
      setNuevoMensaje('');
    } catch (error: any) {
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudo enviar el mensaje.',
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const pasantiaActiva = pasantias.find(
    (pasantia) => pasantia.id_pasantia === idPasantiaActiva
  );

  const obtenerNombrePasante = (actividad: ActividadSeguimiento) => {
    const usuario = actividad.pasante?.usuario;

    if (!usuario) return 'Sin pasante asignado';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const estadoClase = (estado: string) => {
    if (estado === 'completada') {
      return 'bg-main-green/10 text-main-green border-main-green/30';
    }

    if (estado === 'en_progreso') {
      return 'bg-institucional-blue/10 text-institucional-blue border-institucional-blue/30';
    }

    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando seguimiento...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {aviso && <AvisoTailwind aviso={aviso} onClose={() => setAviso(null)} />}

      <div>
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Seguimiento de Pasantes
        </h2>

        <p className="text-sm text-medium-gray mt-1">
          Revisa las actividades asignadas, actualiza progreso y responde el foro.
        </p>
      </div>

      {pasantias.length === 0 ? (
        <div className="bg-white-main p-10 rounded-xl border border-light-gray text-center">
          <Briefcase size={48} className="mx-auto text-medium-gray/50 mb-3" />

          <h3 className="text-lg font-bold text-dark-gray">
            No tienes pasantías asignadas
          </h3>

          <p className="text-sm text-medium-gray mt-1">
            Cuando te asignen una pasantía, aparecerá en esta sección.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-3">
            <h3 className="text-lg font-bold text-institucional-blue">
              Pasantías
            </h3>

            {pasantias.map((pasantia) => {
              const activa = pasantia.id_pasantia === idPasantiaActiva;

              return (
                <button
                  key={pasantia.id_pasantia}
                  type="button"
                  onClick={() => setIdPasantiaActiva(pasantia.id_pasantia)}
                  className={`w-full text-left bg-white-main p-4 rounded-xl border shadow-sm transition-all ${
                    activa
                      ? 'border-main-green ring-2 ring-main-green/20'
                      : 'border-light-gray hover:border-secondary-blue'
                  }`}
                >
                  <p className="font-bold text-institucional-blue">
                    {pasantia.nombre}
                  </p>

                  <p className="text-xs text-medium-gray mt-1">
                    {pasantia.empresa?.nombre || 'Empresa'}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <span className="text-[11px] bg-institucional-blue/10 text-institucional-blue px-2 py-1 rounded">
                      {pasantia.actividades_count || 0} act.
                    </span>

                    <span className="text-[11px] bg-main-green/10 text-main-green px-2 py-1 rounded">
                      {pasantia.pasantes_aprobados_count || 0} pasantes
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="xl:col-span-3 space-y-5">
            {pasantiaActiva && (
              <div className="bg-white-main p-5 rounded-xl border border-light-gray">
                <h3 className="text-lg font-bold text-dark-gray">
                  {pasantiaActiva.nombre}
                </h3>

                <p className="text-sm text-medium-gray mt-1">
                  {pasantiaActiva.descripcion}
                </p>
              </div>
            )}

            {cargandoActividades ? (
              <div className="bg-white-main p-8 rounded-xl border border-light-gray text-center">
                <p className="text-institucional-blue animate-pulse">
                  Cargando actividades...
                </p>
              </div>
            ) : actividades.length === 0 ? (
              <div className="bg-white-main p-10 rounded-xl border border-light-gray text-center">
                <ClipboardList size={48} className="mx-auto text-medium-gray/50 mb-3" />

                <h3 className="text-lg font-bold text-dark-gray">
                  No hay actividades registradas
                </h3>

                <p className="text-sm text-medium-gray mt-1">
                  Las actividades creadas para esta pasantía aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividades.map((actividad) => (
                  <div
                    key={actividad.id_actividad}
                    className="bg-white-main rounded-xl border border-light-gray shadow-sm p-5"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: actividad.color || '#2563eb' }}
                          />

                          <h4 className="font-bold text-lg text-institucional-blue">
                            {actividad.titulo}
                          </h4>
                        </div>

                        <p className="text-sm text-dark-gray mt-1">
                          {actividad.descripcion}
                        </p>

                        <p className="text-sm text-medium-gray mt-2 flex items-center gap-2">
                          <UserCircle size={16} />
                          {obtenerNombrePasante(actividad)}
                        </p>
                      </div>

                      <span
                        className={`border px-3 py-1 rounded-full text-xs font-bold ${estadoClase(
                          actividad.estado
                        )}`}
                      >
                        {actividad.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="text-sm text-medium-gray flex items-center gap-2">
                        <Calendar size={16} className="text-main-green" />
                        Inicio: {formatearFecha(actividad.fecha_inicio)}
                      </div>

                      <div className="text-sm text-medium-gray flex items-center gap-2">
                        <Calendar size={16} className="text-red-600" />
                        Fin: {formatearFecha(actividad.fecha_fin)}
                      </div>
                    </div>

                    <div className="mt-5 bg-light-gray/20 rounded-xl p-4 border border-light-gray">
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold uppercase text-dark-gray">
                          Progreso
                        </label>

                        <span className="font-extrabold text-institucional-blue">
                          {actividad.progreso || 0}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={actividad.progreso || 0}
                        onChange={(e) =>
                          actualizarCampoLocal(
                            actividad.id_actividad,
                            'progreso',
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-main-green"
                      />

                      <div className="mt-4">
                        <label className="text-xs font-bold uppercase text-dark-gray">
                          Resultado / observación
                        </label>

                        <textarea
                          value={actividad.resultado || ''}
                          onChange={(e) =>
                            actualizarCampoLocal(
                              actividad.id_actividad,
                              'resultado',
                              e.target.value
                            )
                          }
                          placeholder="Observación del seguimiento o resultado revisado..."
                          className="mt-2 w-full p-3 rounded-lg border border-light-gray bg-white-main outline-none focus:border-main-green min-h-[90px]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => abrirForo(actividad)}
                          className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Ver foro
                        </button>

                        <button
                          type="button"
                          onClick={() => guardarSeguimiento(actividad)}
                          disabled={guardandoId === actividad.id_actividad}
                          className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {guardandoId === actividad.id_actividad
                            ? 'Guardando...'
                            : 'Guardar seguimiento'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {actividadForo && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Foro de actividad</h3>
                <p className="text-xs opacity-90">{actividadForo.titulo}</p>
              </div>

              <button
                type="button"
                onClick={() => setActividadForo(null)}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-light-gray/20 space-y-3">
              {mensajes.length === 0 ? (
                <p className="text-sm text-medium-gray text-center py-8">
                  Todavía no hay mensajes en esta actividad.
                </p>
              ) : (
                mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id_actividad_mensaje}
                    className="bg-white-main border border-light-gray rounded-xl p-4"
                  >
                    <p className="text-sm font-bold text-dark-gray">
                      {mensaje.usuario
                        ? `${mensaje.usuario.nombre} ${mensaje.usuario.apellido}`
                        : 'Usuario'}
                    </p>

                    <p className="text-sm text-dark-gray mt-2 whitespace-pre-line">
                      {mensaje.mensaje}
                    </p>

                    <p className="text-[11px] text-medium-gray mt-2">
                      {new Date(mensaje.fecha).toLocaleString('es-BO')}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-light-gray bg-white-main">
              <textarea
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe una retroalimentación para el pasante..."
                className="w-full p-3 rounded-xl border border-light-gray outline-none focus:border-main-green min-h-[90px]"
              />

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={enviarMensaje}
                  disabled={enviandoMensaje || !nuevoMensaje.trim()}
                  className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} />
                  {enviandoMensaje ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AvisoTailwind: React.FC<{ aviso: Aviso; onClose: () => void }> = ({
  aviso,
  onClose,
}) => {
  const estilos = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const Icon = aviso.tipo === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`border px-4 py-3 rounded-xl text-sm flex gap-2 items-start justify-between ${estilos[aviso.tipo]}`}
    >
      <div className="flex gap-2 items-start">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <p>{aviso.mensaje}</p>
      </div>

      <button type="button" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};
