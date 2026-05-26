import React, { useEffect, useState } from 'react';
import {
  UserCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
} from 'lucide-react';

import {
  aprobarPostulacionEmpresa,
  listarPostulacionesEmpresa,
  mostrarPostulacionEmpresa,
  rechazarPostulacionEmpresa,
} from '../../services/postulacionEmpresaService';

import type { PostulacionEmpresa } from '../../services/postulacionEmpresaService';

export const PostulacionesPanel: React.FC = () => {
  const [postulaciones, setPostulaciones] = useState<PostulacionEmpresa[]>([]);
  const [selectedPostulacion, setSelectedPostulacion] =
    useState<PostulacionEmpresa | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const [mensaje, setMensaje] = useState<{
    tipo: 'exito' | 'error' | 'info';
    texto: string;
  } | null>(null);

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  const cargarPostulaciones = async () => {
    try {
      setIsLoading(true);

      const data = await listarPostulacionesEmpresa();
      setPostulaciones(data.postulaciones || []);
    } catch (error: any) {
      console.error('Error cargando postulaciones', error);

      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar las postulaciones.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verDetalle = async (id_boleta: number) => {
    try {
      const data = await mostrarPostulacionEmpresa(id_boleta);

      setSelectedPostulacion(data.postulacion);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error cargando detalle', error);

      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo cargar el detalle.',
      });
    }
  };

  const actualizarPostulacionEnLista = (postulacionActualizada: PostulacionEmpresa) => {
    setPostulaciones((prev) =>
      prev.map((item) =>
        item.id_boleta === postulacionActualizada.id_boleta
          ? postulacionActualizada
          : item
      )
    );

    setSelectedPostulacion(postulacionActualizada);
  };

  const aprobar = async (id_boleta: number) => {
    setProcesandoId(id_boleta);
    setMensaje(null);

    try {
      const data = await aprobarPostulacionEmpresa(id_boleta);

      actualizarPostulacionEnLista(data.postulacion);

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Postulación aprobada correctamente.',
      });
    } catch (error: any) {
      console.error('Error aprobando postulación', error);

      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo aprobar la postulación.',
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const rechazar = async (id_boleta: number) => {
    setProcesandoId(id_boleta);
    setMensaje(null);

    try {
      const data = await rechazarPostulacionEmpresa(
        id_boleta,
        'Postulación rechazada por la empresa.'
      );

      actualizarPostulacionEnLista(data.postulacion);

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Postulación rechazada correctamente.',
      });
    } catch (error: any) {
      console.error('Error rechazando postulación', error);

      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo rechazar la postulación.',
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const obtenerNombrePasante = (postulacion: PostulacionEmpresa) => {
    const usuario = postulacion.pasante?.usuario;

    if (!usuario) return 'Pasante sin datos';

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const estadoBadge = (estado: string) => {
    if (estado === 'aprobado') {
      return 'bg-main-green/10 text-main-green border-main-green/30';
    }

    if (estado === 'rechazado') {
      return 'bg-red-50 text-red-600 border-red-200';
    }

    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const estadoIcono = (estado: string) => {
    if (estado === 'aprobado') return <CheckCircle2 size={15} />;
    if (estado === 'rechazado') return <XCircle size={15} />;

    return <Clock size={15} />;
  };

  const puedeGestionar = (estado: string) => {
    return estado === 'pendiente';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando postulaciones...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
            Postulaciones Recibidas
          </h2>

          <p className="text-sm text-medium-gray mt-1">
            Revisa los pasantes que postularon a tus pasantías.
          </p>
        </div>

        <span className="bg-institucional-blue/10 text-institucional-blue px-3 py-1 rounded-lg text-sm font-bold w-fit">
          {postulaciones.length} postulaciones
        </span>
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

      {postulaciones.length === 0 ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <UserCircle size={52} className="mx-auto text-medium-gray/50 mb-4" />

          <h3 className="text-lg font-bold text-dark-gray">
            No hay postulaciones todavía
          </h3>

          <p className="text-sm text-medium-gray mt-2">
            Cuando un pasante postule, aparecerá en esta sección.
          </p>
        </div>
      ) : (
        <div className="bg-white-main rounded-xl shadow-sm border border-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-light-gray/40 text-dark-gray uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Pasante</th>
                  <th className="px-6 py-4">Pasantía</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-gray">
                {postulaciones.map((postulacion) => (
                  <tr
                    key={postulacion.id_boleta}
                    className="hover:bg-light-gray/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-dark-gray">
                        {obtenerNombrePasante(postulacion)}
                      </div>

                      <div className="text-xs text-medium-gray">
                        {postulacion.pasante?.usuario?.email || 'Sin correo'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-dark-gray flex items-center gap-2">
                        <Briefcase size={15} className="text-secondary-blue" />
                        {postulacion.pasantia?.nombre || 'Sin pasantía'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-dark-gray">
                        <Building2 size={15} className="text-main-green" />
                        {postulacion.pasantia?.empresa?.nombre || 'Sin empresa'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-medium-gray">
                      {formatearFecha(postulacion.fecha)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold ${estadoBadge(
                          postulacion.estado
                        )}`}
                      >
                        {estadoIcono(postulacion.estado)}
                        {postulacion.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => verDetalle(postulacion.id_boleta)}
                          className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Ver
                        </button>

                        {puedeGestionar(postulacion.estado) && (
                          <>
                            <button
                              type="button"
                              onClick={() => aprobar(postulacion.id_boleta)}
                              disabled={procesandoId === postulacion.id_boleta}
                              className="bg-main-green hover:bg-soft-green text-white-main px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                            >
                              Aprobar
                            </button>

                            <button
                              type="button"
                              onClick={() => rechazar(postulacion.id_boleta)}
                              disabled={procesandoId === postulacion.id_boleta}
                              className="bg-red-600 hover:bg-red-700 text-white-main px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && selectedPostulacion && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-light-gray flex justify-between items-center bg-institucional-blue text-white-main">
              <h3 className="text-xl font-bold">Detalle de Postulación</h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hover:text-red-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-light-gray p-4 rounded-full">
                  <UserCircle size={48} className="text-main-green" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-dark-gray">
                    {obtenerNombrePasante(selectedPostulacion)}
                  </h4>

                  <p className="text-sm text-medium-gray">
                    Postulación enviada el {formatearFecha(selectedPostulacion.fecha)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                    Correo
                  </p>

                  <p className="text-sm text-dark-gray flex items-center gap-2">
                    <Mail size={16} className="text-secondary-blue" />
                    {selectedPostulacion.pasante?.usuario?.email || 'No registrado'}
                  </p>
                </div>

                <div className="border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                    Teléfono
                  </p>

                  <p className="text-sm text-dark-gray flex items-center gap-2">
                    <Phone size={16} className="text-secondary-blue" />
                    {selectedPostulacion.pasante?.telefono || 'No registrado'}
                  </p>
                </div>

                <div className="border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                    Cédula
                  </p>

                  <p className="text-sm text-dark-gray flex items-center gap-2">
                    <IdCard size={16} className="text-secondary-blue" />
                    {selectedPostulacion.pasante?.ci || 'No registrado'}
                  </p>
                </div>

                <div className="border border-light-gray rounded-xl p-4">
                  <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                    Registro universitario
                  </p>

                  <p className="text-sm text-dark-gray flex items-center gap-2">
                    <GraduationCap size={16} className="text-secondary-blue" />
                    {selectedPostulacion.pasante?.reg_universitario ||
                      'No registrado'}
                  </p>
                </div>
              </div>

              <div className="border border-light-gray rounded-xl p-4">
                <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                  Pasantía
                </p>

                <p className="font-bold text-dark-gray">
                  {selectedPostulacion.pasantia?.nombre || 'Sin pasantía'}
                </p>

                <p className="text-sm text-medium-gray mt-1">
                  {selectedPostulacion.pasantia?.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="border border-light-gray rounded-xl p-4">
                <p className="text-xs text-medium-gray font-bold uppercase mb-2">
                  Habilidades registradas en CV
                </p>

                <p className="text-sm text-dark-gray">
                  {selectedPostulacion.pasante?.ultima_hoja_vida?.habilidades ||
                    'El pasante no registró habilidades.'}
                </p>

                {selectedPostulacion.pasante?.ultima_hoja_vida
                  ?.documento_nombre && (
                  <p className="text-xs text-medium-gray mt-2">
                    Último CV:{" "}
                    {
                      selectedPostulacion.pasante.ultima_hoja_vida
                        .documento_nombre
                    }
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-light-gray pt-5">
                <span
                  className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-full text-xs font-bold ${estadoBadge(
                    selectedPostulacion.estado
                  )}`}
                >
                  {estadoIcono(selectedPostulacion.estado)}
                  Estado: {selectedPostulacion.estado}
                </span>

                {puedeGestionar(selectedPostulacion.estado) && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => aprobar(selectedPostulacion.id_boleta)}
                      disabled={procesandoId === selectedPostulacion.id_boleta}
                      className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
                    >
                      Aprobar
                    </button>

                    <button
                      type="button"
                      onClick={() => rechazar(selectedPostulacion.id_boleta)}
                      disabled={procesandoId === selectedPostulacion.id_boleta}
                      className="bg-red-600 hover:bg-red-700 text-white-main px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-60"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};