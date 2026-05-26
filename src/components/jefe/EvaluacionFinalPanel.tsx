import React, { useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  Calculator,
  CheckCircle2,
  Eye,
  FileCheck,
  Printer,
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
  InformeFinal,
  Pasantia,
} from '../../services/evaluacionJefeService';

export const EvaluacionFinalPanel: React.FC = () => {
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [idPasantiaActiva, setIdPasantiaActiva] = useState<number | null>(null);
  const [boletas, setBoletas] = useState<BoletaEvaluacion[]>([]);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState<BoletaEvaluacion | null>(null);
  const [actividades, setActividades] = useState<ActividadEvaluacion[]>([]);
  const [notaCalculada, setNotaCalculada] = useState<number>(0);
  const [resumen, setResumen] = useState('');
  const [observacion, setObservacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [certificadoHtml, setCertificadoHtml] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [cargandoBoletas, setCargandoBoletas] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [mensaje, setMensaje] = useState<{
    tipo: 'exito' | 'error' | 'info';
    texto: string;
  } | null>(null);

  useEffect(() => {
    cargarPasantias();
  }, []);

  useEffect(() => {
    if (idPasantiaActiva) {
      cargarBoletas(idPasantiaActiva);
    }
  }, [idPasantiaActiva]);

  const cargarPasantias = async () => {
    try {
      setCargando(true);
      const data = await listarPasantiasEvaluacion();

      setPasantias(data.pasantias || []);

      if ((data.pasantias || []).length > 0) {
        setIdPasantiaActiva(data.pasantias[0].id_pasantia);
      }
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar las pasantías.',
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarBoletas = async (idPasantia: number) => {
    try {
      setCargandoBoletas(true);
      const data = await listarBoletasEvaluacion(idPasantia);

      setBoletas(data.boletas || []);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar los pasantes.',
      });
    } finally {
      setCargandoBoletas(false);
    }
  };

  const abrirEvaluacion = async (boleta: BoletaEvaluacion) => {
    setBoletaSeleccionada(boleta);
    setActividades([]);
    setNotaCalculada(0);
    setResumen('');
    setObservacion('');
    setDescripcion('');

    try {
      const data = await calcularEvaluacionFinal(boleta.id_boleta);

      setActividades(data.actividades || []);
      setNotaCalculada(data.nota);
      setResumen(data.resumen);
      setDescripcion(data.resumen);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo calcular la evaluación.',
      });
    }
  };

  const registrarEvaluacion = async () => {
    if (!boletaSeleccionada) return;

    setProcesando(true);

    try {
      const data = await registrarEvaluacionFinal(
        boletaSeleccionada.id_boleta,
        observacion,
        descripcion
      );

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Evaluación registrada correctamente.',
      });

      setBoletaSeleccionada(null);

      if (idPasantiaActiva) {
        await cargarBoletas(idPasantiaActiva);
      }
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo registrar la evaluación.',
      });
    } finally {
      setProcesando(false);
    }
  };

  const verCertificado = async (informe?: InformeFinal | null) => {
    if (!informe) return;

    try {
      const html = await obtenerCertificadoJefeHtml(informe.id_informe);
      setCertificadoHtml(html);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo cargar el certificado.',
      });
    }
  };

  const nombrePasante = (boleta: BoletaEvaluacion) => {
    const usuario = boleta.pasante?.usuario;

    if (!usuario) return 'Pasante sin datos';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  };

  const cerrarModal = () => {
    setBoletaSeleccionada(null);
    setActividades([]);
    setNotaCalculada(0);
    setResumen('');
    setObservacion('');
    setDescripcion('');
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando evaluaciones...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Evaluación Final
        </h2>

        <p className="text-sm text-medium-gray mt-1">
          Calcula la nota final según las actividades realizadas durante la pasantía.
        </p>
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

          <button type="button" onClick={() => setMensaje(null)}>
            ×
          </button>
        </div>
      )}

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
                  <span className="text-[11px] bg-main-green/10 text-main-green px-2 py-1 rounded">
                    {pasantia.pasantes_aprobados_count || 0} pasantes
                  </span>

                  <span className="text-[11px] bg-institucional-blue/10 text-institucional-blue px-2 py-1 rounded">
                    {pasantia.actividades_count || 0} act.
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white-main rounded-xl shadow-sm border border-light-gray overflow-hidden">
            <div className="p-5 border-b border-light-gray flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-dark-gray">
                  Pasantes aprobados
                </h3>

                <p className="text-sm text-medium-gray">
                  Selecciona un pasante para generar su informe final.
                </p>
              </div>

              <Award className="text-main-green" />
            </div>

            {cargandoBoletas ? (
              <div className="p-8 text-center text-institucional-blue animate-pulse">
                Cargando pasantes...
              </div>
            ) : boletas.length === 0 ? (
              <div className="p-10 text-center">
                <UserCircle size={46} className="mx-auto text-medium-gray/50 mb-3" />
                <p className="font-bold text-dark-gray">
                  No hay pasantes aprobados
                </p>
              </div>
            ) : (
              <div className="divide-y divide-light-gray">
                {boletas.map((boleta) => (
                  <div
                    key={boleta.id_boleta}
                    className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-dark-gray">
                        {nombrePasante(boleta)}
                      </p>

                      <p className="text-xs text-medium-gray mt-1">
                        Actividades: {boleta.actividades_count || 0} | Completadas:{' '}
                        {boleta.actividades_completadas_count || 0}
                      </p>

                      <p className="text-xs text-institucional-blue mt-1 font-bold">
                        Nota calculada: {boleta.nota_calculada || 0}/100
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {boleta.evaluado ? (
                        <>
                          <span className="bg-main-green/10 text-main-green px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={15} />
                            Evaluado
                          </span>

                          <button
                            type="button"
                            onClick={() => verCertificado(boleta.informe_final)}
                            className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Eye size={15} />
                            Certificado
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirEvaluacion(boleta)}
                          className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Calculator size={15} />
                          Evaluar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {boletaSeleccionada && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Registrar evaluación final</h3>
                <p className="text-xs opacity-90">
                  {nombrePasante(boletaSeleccionada)}
                </p>
              </div>

              <button type="button" onClick={cerrarModal}>
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-light-gray/30 rounded-xl p-5 border border-light-gray">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-dark-gray">
                    Nota final calculada
                  </p>

                  <span className="text-3xl font-extrabold text-main-green">
                    {notaCalculada}/100
                  </span>
                </div>

                <p className="text-sm text-medium-gray mt-2">
                  {resumen}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-dark-gray mb-3">
                  Actividades evaluadas
                </h4>

                <div className="space-y-3">
                  {actividades.map((actividad) => (
                    <div
                      key={actividad.id_actividad}
                      className="border border-light-gray rounded-xl p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-bold text-institucional-blue">
                            {actividad.titulo}
                          </p>

                          <p className="text-sm text-medium-gray mt-1">
                            {actividad.descripcion}
                          </p>
                        </div>

                        <span className="font-extrabold text-main-green">
                          {actividad.progreso || 0}%
                        </span>
                      </div>

                      {actividad.resultado && (
                        <p className="text-sm text-dark-gray mt-2">
                          <strong>Resultado:</strong> {actividad.resultado}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-dark-gray uppercase">
                  Descripción del informe
                </label>

                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="mt-2 w-full p-4 rounded-xl border border-light-gray outline-none focus:border-main-green min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-dark-gray uppercase">
                  Observación final
                </label>

                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej: desempeño destacado, puntualidad, recomendaciones..."
                  className="mt-2 w-full p-4 rounded-xl border border-light-gray outline-none focus:border-main-green min-h-[100px]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-light-gray flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModal}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarEvaluacion}
                disabled={procesando}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <FileCheck size={16} />
                {procesando ? 'Registrando...' : 'Registrar informe final'}
              </button>
            </div>
          </div>
        </div>
      )}

      {certificadoHtml && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden h-[92vh] flex flex-col">
            <div className="p-4 bg-institucional-blue text-white-main flex justify-between items-center">
              <h3 className="font-bold">Vista previa del certificado</h3>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById('certificado-frame') as HTMLIFrameElement | null;
                    iframe?.contentWindow?.print();
                  }}
                  className="bg-main-green px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir
                </button>

                <button type="button" onClick={() => setCertificadoHtml(null)}>
                  <X size={22} />
                </button>
              </div>
            </div>

            <iframe
              id="certificado-frame"
              title="Certificado"
              srcDoc={certificadoHtml}
              className="w-full flex-1 bg-white-main"
            />
          </div>
        </div>
      )}
    </div>
  );
};
