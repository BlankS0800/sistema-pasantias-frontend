import React, { useEffect, useState } from 'react';
import {
  ListTodo,
  CheckCircle,
  Calendar,
  Save,
  MessageCircle,
  Send,
  X,
  Clock,
  Lock,
} from 'lucide-react';

import {
  actualizarProgresoActividad,
  enviarMensajeActividad,
  listarMensajesActividad,
  listarMisActividades,
} from '../../services/actividadPasanteService';

import type {
  ActividadPasante,
  MensajeActividad,
} from '../../services/actividadPasanteService';

export const SeguimientoView: React.FC = () => {
  const [actividades, setActividades] = useState<ActividadPasante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);

  const [actividadForo, setActividadForo] = useState<ActividadPasante | null>(null);
  const [mensajes, setMensajes] = useState<MensajeActividad[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [isForoOpen, setIsForoOpen] = useState(false);
  const [isLoadingForo, setIsLoadingForo] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [mensajeVista, setMensajeVista] = useState<{
    tipo: 'exito' | 'error' | 'info';
    texto: string;
  } | null>(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setIsLoading(true);

      const data = await listarMisActividades();
      setActividades(data.actividades || []);
    } catch (error: any) {
      console.error('Error cargando actividades', error);

      setMensajeVista({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar las actividades.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estaBloqueada = (actividad: ActividadPasante) => {
    return Boolean(actividad.bloqueada);
  };

  const handleProgresoChange = (id: number, val: number) => {
    setActividades((prev) =>
      prev.map((act) =>
        act.id_actividad === id && !estaBloqueada(act)
          ? { ...act, progreso: val }
          : act
      )
    );
  };

  const handleResultadoChange = (id: number, resultado: string) => {
    setActividades((prev) =>
      prev.map((act) =>
        act.id_actividad === id && !estaBloqueada(act)
          ? { ...act, resultado }
          : act
      )
    );
  };

  const guardarProgresoEnBD = async (id: number) => {
    const actividad = actividades.find((item) => item.id_actividad === id);

    if (!actividad) return;

    if (estaBloqueada(actividad)) {
      setMensajeVista({
        tipo: 'info',
        texto:
          'La evaluación final ya fue registrada. No puedes modificar esta actividad.',
      });

      return;
    }

    setGuardandoId(id);
    setMensajeVista(null);

    try {
      const data = await actualizarProgresoActividad(
        id,
        Number(actividad.progreso || 0),
        actividad.resultado || ''
      );

      setActividades((prev) =>
        prev.map((item) =>
          item.id_actividad === id ? data.actividad : item
        )
      );

      setMensajeVista({
        tipo: 'exito',
        texto: data.message || 'Progreso actualizado correctamente.',
      });
    } catch (error: any) {
      console.error('Error guardando progreso', error);

      setMensajeVista({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo guardar el progreso. Es posible que la pasantía ya esté finalizada.',
      });

      if (error?.message?.includes('evaluación final')) {
        setActividades((prev) =>
          prev.map((item) =>
            item.id_actividad === id ? { ...item, bloqueada: true } : item
          )
        );
      }
    } finally {
      setGuardandoId(null);
    }
  };

  const abrirForo = async (actividad: ActividadPasante) => {
    setActividadForo(actividad);
    setIsForoOpen(true);
    setIsLoadingForo(true);
    setMensajes([]);
    setNuevoMensaje('');

    try {
      const data = await listarMensajesActividad(actividad.id_actividad);
      setMensajes(data.mensajes || []);
    } catch (error: any) {
      console.error('Error cargando foro', error);

      setMensajeVista({
        tipo: 'error',
        texto: error.message || 'No se pudo cargar el foro de la actividad.',
      });

      setIsForoOpen(false);
    } finally {
      setIsLoadingForo(false);
    }
  };

  const enviarMensaje = async () => {
    if (!actividadForo || !nuevoMensaje.trim()) return;

    if (estaBloqueada(actividadForo)) {
      setMensajeVista({
        tipo: 'info',
        texto:
          'La pasantía ya fue finalizada. El foro queda solo como historial de lectura.',
      });

      return;
    }

    setIsSendingMessage(true);

    try {
      const data = await enviarMensajeActividad(
        actividadForo.id_actividad,
        nuevoMensaje.trim()
      );

      setMensajes((prev) => [...prev, data.mensaje_foro]);
      setNuevoMensaje('');
    } catch (error: any) {
      console.error('Error enviando mensaje', error);

      setMensajeVista({
        tipo: 'error',
        texto: error.message || 'No se pudo enviar el mensaje.',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const formatearFechaHora = (fecha?: string) => {
    if (!fecha) return '';

    return new Date(fecha).toLocaleString('es-BO');
  };

  const obtenerEstado = (actividad: ActividadPasante) => {
    if (actividad.bloqueada) {
      return {
        texto: 'Finalizada',
        clase: 'bg-slate-100 text-slate-700 border-slate-300',
        icono: <Lock size={15} />,
      };
    }

    if (actividad.estado === 'completada' || Number(actividad.progreso) >= 100) {
      return {
        texto: 'Completada',
        clase: 'bg-main-green/10 text-main-green border-main-green/30',
        icono: <CheckCircle size={15} />,
      };
    }

    if (actividad.estado === 'en_progreso' || Number(actividad.progreso) > 0) {
      return {
        texto: 'En progreso',
        clase: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icono: <Clock size={15} />,
      };
    }

    return {
      texto: 'Pendiente',
      clase: 'bg-light-gray text-medium-gray border-medium-gray/20',
      icono: <Clock size={15} />,
    };
  };

  const todasBloqueadas =
    actividades.length > 0 && actividades.every((actividad) => actividad.bloqueada);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando actividades...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
            Seguimiento de Pasantía
          </h2>

          <p className="text-sm text-medium-gray mt-1">
            Actualiza tu progreso, registra resultados y conversa con tu jefe de pasantes.
          </p>
        </div>

        <div className="bg-institucional-blue/10 text-institucional-blue px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 w-fit">
          <ListTodo size={18} />
          {actividades.length} tareas
        </div>
      </div>

      {todasBloqueadas && (
        <div className="rounded-xl border border-main-green/30 bg-main-green/10 text-main-green px-5 py-4 text-sm font-semibold flex items-center gap-2">
          <Lock size={18} />
          Tu pasantía ya fue evaluada y finalizada. Las actividades quedan solo como historial.
        </div>
      )}

      {mensajeVista && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm font-semibold flex justify-between items-center ${
            mensajeVista.tipo === 'exito'
              ? 'bg-main-green/10 border-main-green/30 text-main-green'
              : mensajeVista.tipo === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue'
          }`}
        >
          <span>{mensajeVista.texto}</span>

          <button
            type="button"
            onClick={() => setMensajeVista(null)}
            className="font-bold opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
        <div className="flex justify-between items-center border-b border-light-gray pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-dark-gray">
              Actividades Asignadas
            </h3>

            <p className="text-sm text-medium-gray mt-1">
              Actualiza tu porcentaje de progreso y describe el resultado obtenido.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {actividades.length === 0 ? (
            <p className="text-center text-medium-gray py-8">
              Aún no tienes actividades asignadas.
            </p>
          ) : (
            actividades.map((actividad) => {
              const estado = obtenerEstado(actividad);
              const bloqueada = estaBloqueada(actividad);

              return (
                <div
                  key={actividad.id_actividad}
                  className={`border rounded-xl p-5 shadow-sm ${
                    bloqueada
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-light-gray/20 border-light-gray'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-lg text-institucional-blue">
                          {actividad.titulo}
                        </h4>

                        <span
                          className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold ${estado.clase}`}
                        >
                          {estado.icono}
                          {estado.texto}
                        </span>
                      </div>

                      <p className="text-sm text-dark-gray mt-1">
                        {actividad.descripcion}
                      </p>

                      {actividad.pasantia?.empresa?.nombre && (
                        <p className="text-xs text-medium-gray mt-2">
                          Empresa: {actividad.pasantia.empresa.nombre}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-1">
                      <span className="text-xs bg-white-main border px-2 py-1 rounded flex items-center gap-1">
                        <Calendar size={12} /> Inicio: {formatearFecha(actividad.fecha_inicio)}
                      </span>

                      <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1">
                        <Calendar size={12} /> Fin: {formatearFecha(actividad.fecha_fin)}
                      </span>
                    </div>
                  </div>

                  {bloqueada && (
                    <div className="mb-4 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 text-sm font-semibold flex items-center gap-2">
                      <Lock size={16} />
                      Actividad bloqueada por evaluación final.
                    </div>
                  )}

                  <div className="bg-white-main p-4 rounded-lg border space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">Progreso</span>

                        <span
                          className={`text-lg font-extrabold ${
                            Number(actividad.progreso) >= 100
                              ? 'text-main-green'
                              : 'text-secondary-blue'
                          }`}
                        >
                          {actividad.progreso || 0}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={actividad.progreso || 0}
                        disabled={bloqueada}
                        onChange={(e) =>
                          handleProgresoChange(
                            actividad.id_actividad,
                            Number(e.target.value)
                          )
                        }
                        className={`w-full accent-main-green ${
                          bloqueada ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-dark-gray uppercase">
                        Resultado o avance realizado
                      </label>

                      <textarea
                        value={actividad.resultado || ''}
                        disabled={bloqueada}
                        onChange={(e) =>
                          handleResultadoChange(
                            actividad.id_actividad,
                            e.target.value
                          )
                        }
                        placeholder="Describe qué hiciste, qué resultado obtuviste o qué dificultad encontraste..."
                        className={`mt-2 w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors min-h-[110px] resize-y ${
                          bloqueada
                            ? 'opacity-70 cursor-not-allowed bg-slate-100'
                            : ''
                        }`}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => abrirForo(actividad)}
                        className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={17} />
                        Foro / Retroalimentación
                      </button>

                      <button
                        type="button"
                        onClick={() => guardarProgresoEnBD(actividad.id_actividad)}
                        disabled={guardandoId === actividad.id_actividad || bloqueada}
                        className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {bloqueada ? <Lock size={17} /> : <Save size={17} />}

                        {bloqueada
                          ? 'Actividad bloqueada'
                          : guardandoId === actividad.id_actividad
                          ? 'Guardando...'
                          : 'Guardar progreso'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isForoOpen && actividadForo && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-light-gray flex justify-between items-center bg-institucional-blue text-white-main">
              <div>
                <h3 className="text-lg font-bold">Foro de actividad</h3>

                <p className="text-xs opacity-90">{actividadForo.titulo}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsForoOpen(false)}
                className="hover:text-red-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-light-gray/20 space-y-3">
              {isLoadingForo ? (
                <p className="text-center text-medium-gray py-8">
                  Cargando mensajes...
                </p>
              ) : mensajes.length === 0 ? (
                <p className="text-center text-medium-gray py-8">
                  Aún no hay mensajes en esta actividad.
                </p>
              ) : (
                mensajes.map((item) => (
                  <div
                    key={item.id_mensaje || item.id_actividad_mensaje}
                    className={`flex ${item.es_mio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm border ${
                        item.es_mio
                          ? 'bg-main-green/10 border-main-green/30 text-dark-gray'
                          : 'bg-white-main border-light-gray text-dark-gray'
                      }`}
                    >
                      <div className="flex justify-between gap-4 mb-1">
                        <p className="text-xs font-bold text-institucional-blue">
                          {item.usuario
                            ? `${item.usuario.nombre} ${item.usuario.apellido}`
                            : 'Usuario'}
                        </p>

                        <p className="text-[10px] text-medium-gray whitespace-nowrap">
                          {formatearFechaHora(item.fecha)}
                        </p>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {item.mensaje}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-light-gray bg-white-main">
              {actividadForo.bloqueada && (
                <div className="mb-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 text-sm font-semibold flex items-center gap-2">
                  <Lock size={16} />
                  La pasantía ya fue finalizada. El foro queda como historial de lectura.
                </div>
              )}

              <div className="flex gap-3">
                <textarea
                  value={nuevoMensaje}
                  disabled={actividadForo.bloqueada}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe tu consulta, avance o respuesta para el jefe de pasantes..."
                  className={`flex-1 p-3 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none min-h-[70px] resize-none text-sm ${
                    actividadForo.bloqueada
                      ? 'opacity-70 cursor-not-allowed bg-slate-100'
                      : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={enviarMensaje}
                  disabled={
                    isSendingMessage ||
                    !nuevoMensaje.trim() ||
                    actividadForo.bloqueada
                  }
                  className="bg-main-green hover:bg-soft-green text-white-main px-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actividadForo.bloqueada ? <Lock size={18} /> : <Send size={18} />}
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
