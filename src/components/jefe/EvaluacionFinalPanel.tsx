import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  Save,
  Search,
  UserCircle,
  X,
} from 'lucide-react';

import {
  calcularEvaluacionFinal,
  listarBoletasEvaluacion,
  listarPasantiasEvaluacion,
  obtenerCertificadoJefeHtml,
  registrarEvaluacionFinal,
} from '../../services/evaluacionJefeService';

import type {
  ActividadEvaluacion,
  BoletaEvaluacion,
  Pasantia,
} from '../../services/evaluacionJefeService';

type Mensaje = {
  tipo: 'exito' | 'error' | 'info';
  texto: string;
};

export const EvaluacionFinalPanel: React.FC = () => {
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [pasantiaSeleccionada, setPasantiaSeleccionada] =
    useState<Pasantia | null>(null);

  const [boletas, setBoletas] = useState<BoletaEvaluacion[]>([]);
  const [boletaSeleccionada, setBoletaSeleccionada] =
    useState<BoletaEvaluacion | null>(null);

  const [actividades, setActividades] = useState<ActividadEvaluacion[]>([]);
  const [resumen, setResumen] = useState('');

  const [notaManual, setNotaManual] = useState('');
  const [observacion, setObservacion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [cargandoPasantias, setCargandoPasantias] = useState(true);
  const [cargandoBoletas, setCargandoBoletas] = useState(false);
  const [cargandoEvaluacion, setCargandoEvaluacion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [modalEvaluacion, setModalEvaluacion] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  useEffect(() => {
    cargarPasantias();
  }, []);

  const cargarPasantias = async () => {
    setCargandoPasantias(true);
    setMensaje(null);

    try {
      const data = await listarPasantiasEvaluacion();
      setPasantias(data.pasantias || []);

      if ((data.pasantias || []).length > 0) {
        const primera = data.pasantias[0];
        setPasantiaSeleccionada(primera);
        await cargarBoletas(primera.id_pasantia);
      }
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudieron cargar las pasantías para evaluación.',
      });
    } finally {
      setCargandoPasantias(false);
    }
  };

  const cargarBoletas = async (id_pasantia: number) => {
    setCargandoBoletas(true);
    setMensaje(null);

    try {
      const data = await listarBoletasEvaluacion(id_pasantia);
      setBoletas(data.boletas || []);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudieron cargar los pasantes aprobados para evaluación.',
      });
    } finally {
      setCargandoBoletas(false);
    }
  };

  const seleccionarPasantia = async (pasantia: Pasantia) => {
    setPasantiaSeleccionada(pasantia);
    setBoletas([]);
    await cargarBoletas(pasantia.id_pasantia);
  };

  const abrirEvaluacion = async (boleta: BoletaEvaluacion) => {
    if (boleta.evaluado || boleta.informe_final) {
      setMensaje({
        tipo: 'info',
        texto: 'Este pasante ya tiene evaluación final registrada.',
      });
      return;
    }

    setBoletaSeleccionada(boleta);
    setActividades([]);
    setResumen('');
    setNotaManual('');
    setObservacion('');
    setDescripcion('');
    setModalEvaluacion(true);
    setCargandoEvaluacion(true);
    setMensaje(null);

    try {
      const data = await calcularEvaluacionFinal(boleta.id_boleta);

      setActividades(data.actividades || []);
      setResumen(data.resumen || '');

      /*
       * Importante:
       * No cargamos nota sugerida ni nota calculada.
       * El jefe debe escribir la nota manualmente.
       */
      setNotaManual('');

      if (data.resumen) {
        setDescripcion(data.resumen);
      }
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudieron cargar los datos para la evaluación final.',
      });

      setModalEvaluacion(false);
      setBoletaSeleccionada(null);
    } finally {
      setCargandoEvaluacion(false);
    }
  };

  const guardarEvaluacion = async () => {
    if (!boletaSeleccionada) return;

    const nota = Number(notaManual);

    if (Number.isNaN(nota) || nota < 0 || nota > 100) {
      setMensaje({
        tipo: 'error',
        texto: 'La nota final debe estar entre 0 y 100.',
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await registrarEvaluacionFinal(
        boletaSeleccionada.id_boleta,
        nota,
        observacion,
        descripcion
      );

      setMensaje({
        tipo: 'exito',
        texto:
          data.message ||
          'Evaluación final registrada correctamente.',
      });

      setModalEvaluacion(false);
      setBoletaSeleccionada(null);
      setActividades([]);
      setResumen('');
      setNotaManual('');
      setObservacion('');
      setDescripcion('');

      if (pasantiaSeleccionada) {
        await cargarBoletas(pasantiaSeleccionada.id_pasantia);
      }
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo registrar la evaluación final.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const verCertificado = async (id_informe?: number) => {
    if (!id_informe) {
      setMensaje({
        tipo: 'info',
        texto: 'No existe informe final para mostrar certificado.',
      });
      return;
    }

    try {
      const html = await obtenerCertificadoJefeHtml(id_informe);

      const nuevaVentana = window.open('', '_blank');

      if (!nuevaVentana) {
        setMensaje({
          tipo: 'error',
          texto: 'El navegador bloqueó la ventana del certificado.',
        });
        return;
      }

      nuevaVentana.document.write(html);
      nuevaVentana.document.close();
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo cargar el certificado.',
      });
    }
  };

  const obtenerNombrePasante = (boleta: BoletaEvaluacion | null) => {
    const usuario = boleta?.pasante?.usuario;

    if (!usuario) return 'Pasante sin datos';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  };

  const obtenerInstitucion = (boleta: BoletaEvaluacion | null) => {
    return boleta?.pasante?.institucion?.nombre || 'Sin institución';
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(`${fecha.substring(0, 10)}T00:00:00`).toLocaleDateString(
      'es-BO'
    );
  };

  const obtenerEstadoActividad = (estado?: string) => {
    if (estado === 'completada') {
      return {
        texto: 'Completada',
        clase: 'bg-main-green/10 text-main-green border-main-green/30',
      };
    }

    if (estado === 'en_progreso') {
      return {
        texto: 'En progreso',
        clase: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      };
    }

    return {
      texto: 'Pendiente',
      clase: 'bg-light-gray text-medium-gray border-medium-gray/20',
    };
  };

  if (cargandoPasantias) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse">
          Cargando evaluación final...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
            Evaluación Final
          </h2>

          <p className="text-sm text-medium-gray mt-1">
            Selecciona una pasantía y asigna manualmente la nota final del pasante.
          </p>
        </div>

        <div className="bg-white-main border border-light-gray rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
          <Award className="text-main-green" size={22} />

          <div>
            <p className="text-xs text-medium-gray font-bold uppercase">
              Modo de evaluación
            </p>

            <p className="text-sm font-bold text-institucional-blue">
              Nota asignada por el jefe
            </p>
          </div>
        </div>
      </div>

      {mensaje && (
        <div
          className={`rounded-xl border px-5 py-4 text-sm font-semibold flex justify-between items-center ${
            mensaje.tipo === 'exito'
              ? 'bg-main-green/10 border-main-green/30 text-main-green'
              : mensaje.tipo === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue'
          }`}
        >
          <span>{mensaje.texto}</span>

          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="font-bold opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="px-5 py-4 border-b border-light-gray bg-light-gray/30">
            <h3 className="text-base font-bold text-institucional-blue">
              Pasantías asignadas
            </h3>

            <p className="text-xs text-medium-gray">
              Selecciona una pasantía para ver sus pasantes aprobados.
            </p>
          </div>

          <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
            {pasantias.length === 0 ? (
              <p className="text-center text-medium-gray text-sm py-8">
                No tienes pasantías para evaluar.
              </p>
            ) : (
              pasantias.map((pasantia) => {
                const activa =
                  pasantiaSeleccionada?.id_pasantia === pasantia.id_pasantia;

                return (
                  <button
                    key={pasantia.id_pasantia}
                    type="button"
                    onClick={() => seleccionarPasantia(pasantia)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      activa
                        ? 'bg-main-green/10 border-main-green ring-2 ring-main-green/20'
                        : 'bg-white-main border-light-gray hover:border-secondary-blue hover:bg-light-gray/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Briefcase
                        className={
                          activa ? 'text-main-green' : 'text-medium-gray'
                        }
                        size={24}
                      />

                      <div className="min-w-0">
                        <p className="font-bold text-institucional-blue line-clamp-2">
                          {pasantia.nombre}
                        </p>

                        <p className="text-xs text-medium-gray mt-1 flex items-center gap-1">
                          <Building2 size={12} />
                          {pasantia.empresa?.nombre || 'Sin empresa'}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-[11px] bg-main-green/10 text-main-green px-2 py-1 rounded">
                            {pasantia.pasantes_aprobados_count || 0} aprobados
                          </span>

                          <span className="text-[11px] bg-institucional-blue/10 text-institucional-blue px-2 py-1 rounded">
                            {pasantia.actividades_count || 0} actividades
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="px-6 py-5 border-b border-light-gray flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-institucional-blue">
                Pasantes aprobados
              </h3>

              <p className="text-sm text-medium-gray">
                {pasantiaSeleccionada
                  ? `Pasantía: ${pasantiaSeleccionada.nombre}`
                  : 'Selecciona una pasantía para continuar.'}
              </p>
            </div>

            <div className="bg-light-gray/40 px-4 py-2 rounded-xl text-sm font-bold text-dark-gray flex items-center gap-2">
              <Search size={17} />
              {boletas.length} pasante(s)
            </div>
          </div>

          {cargandoBoletas ? (
            <div className="p-10 text-center text-institucional-blue font-semibold animate-pulse">
              Cargando pasantes aprobados...
            </div>
          ) : boletas.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle
                size={52}
                className="mx-auto text-medium-gray/50 mb-4"
              />

              <h3 className="font-bold text-dark-gray">
                No hay pasantes aprobados
              </h3>

              <p className="text-sm text-medium-gray mt-2">
                Cuando el gerente apruebe postulaciones, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-light-gray/40 text-dark-gray uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Pasante</th>
                    <th className="px-6 py-4">Actividades</th>
                    <th className="px-6 py-4">Estado evaluación</th>
                    <th className="px-6 py-4">Nota final</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-gray">
                  {boletas.map((boleta) => {
                    const evaluado = boleta.evaluado || boleta.informe_final;

                    return (
                      <tr
                        key={boleta.id_boleta}
                        className="hover:bg-light-gray/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-dark-gray">
                            {obtenerNombrePasante(boleta)}
                          </p>

                          <p className="text-xs text-medium-gray">
                            RU:{' '}
                            {boleta.pasante?.reg_universitario ||
                              'Sin registro'}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-medium-gray">
                          {boleta.pasante?.institucion?.nombre ||
                            'Sin institución'}
                        </td>

                        <td className="px-6 py-4">
                          <span className="bg-institucional-blue/10 text-institucional-blue px-2.5 py-1 rounded-full text-xs font-bold">
                            {boleta.actividades_completadas_count || 0}/
                            {boleta.actividades_count || 0} completadas
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {evaluado ? (
                            <span className="bg-main-green/10 text-main-green border border-main-green/30 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <CheckCircle2 size={14} />
                              Evaluado
                            </span>
                          ) : (
                            <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-bold">
                              Pendiente
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {boleta.informe_final ? (
                            <span className="font-extrabold text-institucional-blue">
                              {boleta.informe_final.nota}/100
                            </span>
                          ) : (
                            <span className="text-xs text-medium-gray">
                              Sin nota
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {!evaluado ? (
                              <button
                                type="button"
                                onClick={() => abrirEvaluacion(boleta)}
                                className="bg-main-green hover:bg-soft-green text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Award size={14} />
                                Asignar nota
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  verCertificado(boleta.informe_final?.id_informe)
                                }
                                className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Eye size={14} />
                                Ver certificado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {modalEvaluacion && boletaSeleccionada && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  Asignar nota
                </h3>

                <p className="text-xs opacity-90">
                  {obtenerNombrePasante(boletaSeleccionada)} ·{' '}
                  {obtenerInstitucion(boletaSeleccionada)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalEvaluacion(false);
                  setBoletaSeleccionada(null);
                }}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {cargandoEvaluacion ? (
                <p className="text-center text-institucional-blue animate-pulse">
                  Cargando datos de evaluación...
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard
                      icono={<UserCircle size={18} />}
                      label="Pasante"
                      value={obtenerNombrePasante(boletaSeleccionada)}
                    />

                    <InfoCard
                      icono={<GraduationCap size={18} />}
                      label="Institución"
                      value={obtenerInstitucion(boletaSeleccionada)}
                    />

                    <InfoCard
                      icono={<Briefcase size={18} />}
                      label="Pasantía"
                      value={
                        boletaSeleccionada.pasantia?.nombre ||
                        pasantiaSeleccionada?.nombre ||
                        'Sin pasantía'
                      }
                    />
                  </div>

                  <div className="border border-light-gray rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-secondary-blue/10 flex items-center justify-center">
                        <FileCheck
                          className="text-secondary-blue"
                          size={24}
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-institucional-blue">
                          Actividades realizadas
                        </h4>

                        <p className="text-sm text-medium-gray">
                          Las actividades son solo respaldo para la evaluación.
                        </p>
                      </div>
                    </div>

                    {actividades.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 text-sm font-semibold flex items-start gap-2">
                        <AlertCircle size={18} className="mt-0.5" />
                        Este pasante no tiene actividades registradas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {actividades.map((actividad) => {
                          const estado = obtenerEstadoActividad(
                            actividad.estado
                          );

                          return (
                            <div
                              key={actividad.id_actividad}
                              className="border border-light-gray rounded-xl p-4 bg-light-gray/20"
                            >
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div>
                                  <h5 className="font-bold text-dark-gray">
                                    {actividad.titulo}
                                  </h5>

                                  <p className="text-sm text-medium-gray mt-1">
                                    {actividad.descripcion}
                                  </p>

                                  {actividad.resultado && (
                                    <p className="text-sm text-dark-gray mt-2">
                                      <strong>Resultado:</strong>{' '}
                                      {actividad.resultado}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col items-start md:items-end gap-2">
                                  <span
                                    className={`border px-2.5 py-1 rounded-full text-xs font-bold ${estado.clase}`}
                                  >
                                    {estado.texto}
                                  </span>

                                  <span className="text-xs text-medium-gray flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatearFecha(actividad.fecha_inicio)} -{' '}
                                    {formatearFecha(actividad.fecha_fin)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border border-light-gray rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-main-green/10 flex items-center justify-center">
                        <Award className="text-main-green" size={24} />
                      </div>

                      <div>
                        <h4 className="font-bold text-institucional-blue">
                          Asignar nota
                        </h4>

                        <p className="text-sm text-medium-gray">
                          Ingresa manualmente la nota final del pasante.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-dark-gray uppercase">
                          Nota final del jefe
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={notaManual}
                          onChange={(e) => setNotaManual(e.target.value)}
                          className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green focus:bg-white-main outline-none"
                          placeholder="Ingrese la nota final. Ej: 85"
                        />

                        <p className="text-xs text-medium-gray mt-1">
                          Esta será la nota registrada en el informe final.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-gray uppercase">
                          Observación
                        </label>

                        <textarea
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          className="mt-2 w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none min-h-[95px]"
                          placeholder="Escribe una observación sobre el desempeño del pasante..."
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-gray uppercase">
                          Descripción del informe
                        </label>

                        <textarea
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          className="mt-2 w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none min-h-[95px]"
                          placeholder="Descripción general de la evaluación final..."
                        />

                        {resumen && (
                          <p className="text-xs text-medium-gray mt-2">
                            Resumen generado: {resumen}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-light-gray flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalEvaluacion(false);
                  setBoletaSeleccionada(null);
                }}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarEvaluacion}
                disabled={guardando || cargandoEvaluacion}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {guardando ? 'Guardando...' : 'Registrar nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{
  icono: React.ReactNode;
  label: string;
  value: string;
}> = ({ icono, label, value }) => {
  return (
    <div className="border border-light-gray rounded-xl p-4 bg-light-gray/20">
      <div className="flex items-start gap-3">
        <div className="text-main-green mt-0.5">{icono}</div>

        <div>
          <p className="text-xs font-bold text-medium-gray uppercase">
            {label}
          </p>

          <p className="font-semibold text-dark-gray mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};