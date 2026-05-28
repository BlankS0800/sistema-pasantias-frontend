import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Save,
  Upload,
  UserCircle,
  X,
} from 'lucide-react';

import {
  importarPasantesExcelTutor,
  listarPasantesTutor,
  mostrarPasanteTutor,
  registrarNotaInformeTutor,
} from '../../services/tutorService';

import type {
  ImportarPasantesResponse,
  PasanteTutor,
} from '../../services/tutorService';

export const TutorPasantesPanel: React.FC = () => {
  const [pasantes, setPasantes] = useState<PasanteTutor[]>([]);
  const [pasanteDetalle, setPasanteDetalle] = useState<PasanteTutor | null>(null);
  const [nota, setNota] = useState('');
  const [observacion, setObservacion] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);

  const [modalExcel, setModalExcel] = useState(false);
  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const [resultadoImportacion, setResultadoImportacion] =
    useState<ImportarPasantesResponse | null>(null);

  const [mensaje, setMensaje] = useState<{
    tipo: 'exito' | 'error' | 'info';
    texto: string;
  } | null>(null);

  useEffect(() => {
    cargarPasantes();
  }, []);

  const cargarPasantes = async () => {
    try {
      setIsLoading(true);

      const data = await listarPasantesTutor();
      setPasantes(data.pasantes || []);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar los pasantes.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const abrirDetalle = async (id_pasante: number) => {
    try {
      setIsLoadingDetalle(true);

      const data = await mostrarPasanteTutor(id_pasante);

      setPasanteDetalle(data.pasante);
      setNota(
        data.pasante.boleta_actual?.informe_final?.nota !== undefined &&
          data.pasante.boleta_actual?.informe_final?.nota !== null
          ? String(data.pasante.boleta_actual.informe_final.nota)
          : ''
      );
      setObservacion(data.pasante.boleta_actual?.informe_final?.observacion || '');
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo cargar el detalle del pasante.',
      });
    } finally {
      setIsLoadingDetalle(false);
    }
  };

  const guardarNota = async () => {
    const informe = pasanteDetalle?.boleta_actual?.informe_final;

    if (!informe) {
      setMensaje({
        tipo: 'info',
        texto: 'Todavía no existe un informe final para registrar nota.',
      });
      return;
    }

    const notaNumerica = Number(nota);

    if (Number.isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 100) {
      setMensaje({
        tipo: 'error',
        texto: 'La nota debe estar entre 0 y 100.',
      });
      return;
    }

    setGuardandoNota(true);

    try {
      const data = await registrarNotaInformeTutor(
        informe.id_informe,
        notaNumerica,
        observacion
      );

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Nota registrada correctamente.',
      });

      setPasanteDetalle((prev) =>
        prev
          ? {
              ...prev,
              boleta_actual: prev.boleta_actual
                ? {
                    ...prev.boleta_actual,
                    informe_final: {
                      ...prev.boleta_actual.informe_final!,
                      nota: data.informe.nota,
                      observacion: data.informe.observacion,
                    },
                  }
                : null,
            }
          : prev
      );

      await cargarPasantes();
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo registrar la nota.',
      });
    } finally {
      setGuardandoNota(false);
    }
  };

  const subirExcel = async () => {
    if (!archivoExcel) {
      setMensaje({
        tipo: 'info',
        texto: 'Selecciona un archivo Excel para continuar.',
      });
      return;
    }

    setSubiendoExcel(true);
    setResultadoImportacion(null);
    setMensaje(null);

    try {
      const data = await importarPasantesExcelTutor(archivoExcel);

      setResultadoImportacion(data);
      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Pasantes importados correctamente.',
      });

      setArchivoExcel(null);
      await cargarPasantes();
    } catch (error: any) {
      setResultadoImportacion(error);

      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo importar el archivo. Revisa el formato del Excel.',
      });
    } finally {
      setSubiendoExcel(false);
    }
  };

  const nombrePasante = (pasante: PasanteTutor) => {
    const usuario = pasante.usuario;

    if (!usuario) return 'Pasante sin datos';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const cerrarModalExcel = () => {
    setModalExcel(false);
    setArchivoExcel(null);
    setResultadoImportacion(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando pasantes asignados...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
            Mis Pasantes
          </h2>

          <p className="text-sm text-medium-gray mt-1">
            Revisa tus pasantes asignados, su pasantía, empresa e informe final.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalExcel(true)}
            className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Upload size={17} />
            Subir pasantes
          </button>

          <span className="bg-institucional-blue/10 text-institucional-blue px-3 py-2 rounded-lg text-sm font-bold w-fit">
            {pasantes.length} pasantes
          </span>
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

      {pasantes.length === 0 ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <UserCircle size={54} className="mx-auto text-medium-gray/50 mb-4" />

          <h3 className="text-lg font-bold text-dark-gray">
            No tienes pasantes asignados
          </h3>

          <p className="text-sm text-medium-gray mt-2">
            Puedes subir un Excel para registrar o asignar pasantes a tu cuenta de tutor.
          </p>

          <button
            type="button"
            onClick={() => setModalExcel(true)}
            className="mt-5 bg-main-green hover:bg-soft-green text-white-main px-5 py-2.5 rounded-lg text-sm font-bold inline-flex items-center gap-2"
          >
            <Upload size={17} />
            Subir pasantes
          </button>
        </div>
      ) : (
        <div className="bg-white-main rounded-xl shadow-sm border border-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-light-gray/40 text-dark-gray uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Pasante</th>
                  <th className="px-6 py-4">CI / Registro</th>
                  <th className="px-6 py-4">Pasantía</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Informe Final</th>
                  <th className="px-6 py-4">Nota</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-gray">
                {pasantes.map((pasante) => {
                  const boleta = pasante.boleta_actual;
                  const informe = boleta?.informe_final;

                  return (
                    <tr
                      key={pasante.id_pasante}
                      className="hover:bg-light-gray/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-dark-gray">
                          {nombrePasante(pasante)}
                        </div>

                        <div className="text-xs text-medium-gray">
                          {pasante.usuario?.email || 'Sin correo'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-dark-gray font-semibold">
                          {pasante.ci || 'Sin CI'}
                        </p>

                        <p className="text-xs text-medium-gray">
                          RU: {pasante.reg_universitario || 'Sin registro'}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-semibold text-dark-gray">
                        {boleta?.pasantia?.nombre || 'Sin pasantía'}
                      </td>

                      <td className="px-6 py-4 text-medium-gray">
                        {boleta?.pasantia?.empresa?.nombre || 'Sin empresa'}
                      </td>

                      <td className="px-6 py-4">
                        {informe ? (
                          <span className="bg-main-green/10 text-main-green border border-main-green/30 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            Recibido
                          </span>
                        ) : (
                          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            Pendiente
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {informe ? (
                          <span className="font-extrabold text-institucional-blue">
                            {informe.nota}/100
                          </span>
                        ) : (
                          <span className="text-medium-gray text-xs">
                            Sin nota
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirDetalle(pasante.id_pasante)}
                            className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pasanteDetalle && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  Detalle del pasante
                </h3>

                <p className="text-xs opacity-90">
                  {nombrePasante(pasanteDetalle)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPasanteDetalle(null)}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isLoadingDetalle ? (
                <p className="text-center text-institucional-blue animate-pulse">
                  Cargando detalle...
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<Mail size={17} />}
                      label="Correo"
                      value={pasanteDetalle.usuario?.email || 'No registrado'}
                    />

                    <InfoCard
                      icon={<Phone size={17} />}
                      label="Teléfono"
                      value={pasanteDetalle.telefono || 'No registrado'}
                    />

                    <InfoCard
                      icon={<GraduationCap size={17} />}
                      label="Registro Universitario"
                      value={pasanteDetalle.reg_universitario || 'No registrado'}
                    />

                    <InfoCard
                      icon={<Calendar size={17} />}
                      label="CI"
                      value={pasanteDetalle.ci || 'No registrado'}
                    />
                  </div>

                  <div className="border border-light-gray rounded-xl p-5">
                    <h4 className="font-bold text-dark-gray mb-2">
                      Pasantía y empresa
                    </h4>

                    <p className="font-bold text-institucional-blue">
                      {pasanteDetalle.boleta_actual?.pasantia?.nombre || 'Sin pasantía'}
                    </p>

                    <p className="text-sm text-medium-gray mt-1">
                      Empresa:{' '}
                      {pasanteDetalle.boleta_actual?.pasantia?.empresa?.nombre ||
                        'Sin empresa'}
                    </p>
                  </div>

                  <div className="border border-light-gray rounded-xl p-5">
                    <h4 className="font-bold text-dark-gray mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-main-green" />
                      Informe final
                    </h4>

                    {!pasanteDetalle.boleta_actual?.informe_final ? (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 text-sm font-semibold">
                        El jefe de pasantes todavía no registró el informe final.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-main-green/10 border border-main-green/30 rounded-xl p-4">
                          <p className="text-sm text-dark-gray">
                            <strong>Fecha de entrega:</strong>{' '}
                            {formatearFecha(
                              pasanteDetalle.boleta_actual.informe_final.fecha_entrega
                            )}
                          </p>

                          <p className="text-sm text-dark-gray mt-2">
                            <strong>Descripción:</strong>{' '}
                            {pasanteDetalle.boleta_actual.informe_final.descripcion ||
                              'Sin descripción'}
                          </p>

                          <p className="text-sm text-dark-gray mt-2">
                            <strong>Observación:</strong>{' '}
                            {pasanteDetalle.boleta_actual.informe_final.observacion ||
                              'Sin observación'}
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-dark-gray uppercase">
                            Nota del pasante
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green focus:bg-white-main outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-dark-gray uppercase">
                            Observación académica
                          </label>

                          <textarea
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            placeholder="Ej: desempeño académico, recomendaciones, observaciones del tutor..."
                            className="mt-2 w-full p-4 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none min-h-[100px]"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={guardarNota}
                            disabled={guardandoNota}
                            className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                          >
                            <Save size={16} />
                            {guardandoNota ? 'Guardando...' : 'Guardar nota'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalExcel && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  Subir pasantes desde Excel
                </h3>

                <p className="text-xs opacity-90">
                  El sistema verificará usuarios existentes y asignará los pasantes a tu tutoría.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalExcel}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-light-gray/40 border border-light-gray rounded-xl p-4">
                <p className="text-sm font-bold text-dark-gray flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-main-green" />
                  Columnas requeridas del Excel
                </p>

                <p className="text-xs text-medium-gray mt-2">
                  La primera fila debe contener estos encabezados:
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'nombre',
                    'apellido',
                    'email',
                    'telefono',
                    'ci',
                    'reg_universitario',
                    'direccion',
                    'id_institucion',
                  ].map((columna) => (
                    <span
                      key={columna}
                      className="bg-white-main border border-light-gray px-2.5 py-1 rounded-lg text-xs font-bold text-institucional-blue"
                    >
                      {columna}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-medium-gray mt-3">
                  Si el correo no existe, se creará el usuario con contraseña predeterminada.
                  Si el correo ya existe pero no es pasante, no se importará el archivo.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-dark-gray uppercase">
                  Archivo Excel
                </label>

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setArchivoExcel(e.target.files?.[0] || null)}
                  className="mt-2 w-full px-4 py-3 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none"
                />

                {archivoExcel && (
                  <p className="text-xs text-main-green font-bold mt-2">
                    Archivo seleccionado: {archivoExcel.name}
                  </p>
                )}
              </div>

              {resultadoImportacion?.resumen && (
                <div className="bg-main-green/10 border border-main-green/30 text-main-green rounded-xl p-4 text-sm">
                  <p className="font-bold">Resumen de importación</p>

                  <ul className="mt-2 space-y-1">
                    <li>Filas válidas: {resultadoImportacion.resumen.total_filas_validas}</li>
                    <li>Pasantes creados: {resultadoImportacion.resumen.pasantes_creados}</li>
                    <li>Pasantes actualizados: {resultadoImportacion.resumen.pasantes_actualizados}</li>
                    <li>Asignados al tutor: {resultadoImportacion.resumen.pasantes_asignados_al_tutor}</li>
                    <li>
                      Contraseña predeterminada:{' '}
                      <strong>{resultadoImportacion.resumen.contrasena_predeterminada}</strong>
                    </li>
                  </ul>
                </div>
              )}

              {resultadoImportacion?.errores && resultadoImportacion.errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm max-h-60 overflow-y-auto">
                  <p className="font-bold mb-2">Errores encontrados</p>

                  <ul className="space-y-2">
                    {resultadoImportacion.errores.map((error, index) => (
                      <li key={index}>
                        <strong>Fila {error.fila}:</strong> {error.motivo}{' '}
                        {error.email ? `(${error.email})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-light-gray flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModalExcel}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={subirExcel}
                disabled={subiendoExcel || !archivoExcel}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <Upload size={16} />
                {subiendoExcel ? 'Subiendo...' : 'Importar pasantes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => {
  return (
    <div className="border border-light-gray rounded-xl p-4">
      <p className="text-xs text-medium-gray font-bold uppercase mb-2">
        {label}
      </p>

      <p className="text-sm text-dark-gray flex items-center gap-2">
        <span className="text-secondary-blue">{icon}</span>
        {value}
      </p>
    </div>
  );
};
