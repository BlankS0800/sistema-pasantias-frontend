import React, { useEffect, useState } from 'react';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Eye,
    FileText,
    Plus,
    Power,
    PowerOff,
    Trash2,
    UserCircle,
} from 'lucide-react';

import {
    actualizarPasantiaGerente,
    cambiarEstadoPasantiaGerente,
    eliminarPasantiaGerente,
    listarEncargadosParaPasantia,
    listarPasantiasGerente,
    obtenerUrlDocumento,
    registrarPasantiaGerente,
} from '../../services/pasantiaService';

import type {
    EncargadoPasantia,
    EstadoPasantia,
    Pasantia,
    PasantiaPayload,
} from '../../services/pasantiaService';

import { PasantiaFormModal } from './PasantiaFormModal';

interface PasantiasPanelProps {
    puedeGestionar: boolean;
}

interface Aviso {
    tipo: 'success' | 'error' | 'warning';
    mensaje: string;
}

export const PasantiasPanel: React.FC<PasantiasPanelProps> = ({
    puedeGestionar,
}) => {
    const [pasantias, setPasantias] = useState<Pasantia[]>([]);
    const [encargados, setEncargados] = useState<EncargadoPasantia[]>([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
    const [eliminando, setEliminando] = useState<number | null>(null);

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>(
        'crear'
    );
    const [pasantiaSeleccionada, setPasantiaSeleccionada] =
        useState<Pasantia | null>(null);

    const [aviso, setAviso] = useState<Aviso | null>(null);

    const cargarDatos = async () => {
        setCargando(true);
        setAviso(null);

        try {
            const [dataPasantias, dataEncargados] = await Promise.all([
                listarPasantiasGerente(),
                listarEncargadosParaPasantia(),
            ]);

            setPasantias(dataPasantias.pasantias || []);
            setEncargados(dataEncargados.encargados || []);
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudieron cargar las pasantías. Verifica que el gerente tenga empresa registrada.',
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirCrear = () => {
        if (!puedeGestionar) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permisos para agregar pasantías.',
            });
            return;
        }

        setModoFormulario('crear');
        setPasantiaSeleccionada(null);
        setModalFormulario(true);
    };

    const abrirEditar = (pasantia: Pasantia) => {
        if (!puedeGestionar) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permisos para editar pasantías.',
            });
            return;
        }

        setModoFormulario('editar');
        setPasantiaSeleccionada(pasantia);
        setModalFormulario(true);
    };

    const handleSubmitPasantia = async (payload: PasantiaPayload) => {
        if (!puedeGestionar) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permisos para guardar pasantías.',
            });
            return;
        }

        setGuardando(true);
        setAviso(null);

        try {
            const data =
                modoFormulario === 'crear'
                    ? await registrarPasantiaGerente(payload)
                    : await actualizarPasantiaGerente(
                        pasantiaSeleccionada!.id_pasantia,
                        payload
                    );

            if (modoFormulario === 'crear') {
                setPasantias([data.pasantia, ...pasantias]);
            } else {
                setPasantias(
                    pasantias.map((item) =>
                        item.id_pasantia === data.pasantia.id_pasantia
                            ? data.pasantia
                            : item
                    )
                );
            }

            setModalFormulario(false);
            setPasantiaSeleccionada(null);

            setAviso({
                tipo: 'success',
                mensaje:
                    modoFormulario === 'crear'
                        ? 'Pasantía registrada correctamente.'
                        : 'Pasantía actualizada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudo guardar la pasantía. Revisa los datos ingresados.',
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleCambiarEstado = async (pasantia: Pasantia) => {
        if (!puedeGestionar) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permisos para cambiar el estado.',
            });
            return;
        }

        const nuevoEstado: EstadoPasantia =
            pasantia.estado === 'habilitada' ? 'inhabilitada' : 'habilitada';

        setCambiandoEstado(pasantia.id_pasantia);
        setAviso(null);

        try {
            const data = await cambiarEstadoPasantiaGerente(
                pasantia.id_pasantia,
                nuevoEstado
            );

            setPasantias(
                pasantias.map((item) =>
                    item.id_pasantia === data.pasantia.id_pasantia
                        ? data.pasantia
                        : item
                )
            );

            setAviso({
                tipo: 'success',
                mensaje:
                    nuevoEstado === 'habilitada'
                        ? 'Pasantía habilitada correctamente.'
                        : 'Pasantía inhabilitada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje: error.message || 'No se pudo cambiar el estado.',
            });
        } finally {
            setCambiandoEstado(null);
        }
    };

    const handleEliminar = async (pasantia: Pasantia) => {
        if (!puedeGestionar) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permisos para eliminar pasantías.',
            });
            return;
        }

        const confirmar = window.confirm(
            `¿Seguro que deseas eliminar la pasantía "${pasantia.nombre}"?`
        );

        if (!confirmar) return;

        const confirmarFinal = window.confirm(
            'Esta acción eliminará también el documento adjunto. ¿Deseas continuar?'
        );

        if (!confirmarFinal) return;

        setEliminando(pasantia.id_pasantia);
        setAviso(null);

        try {
            await eliminarPasantiaGerente(pasantia.id_pasantia);

            setPasantias(
                pasantias.filter((item) => item.id_pasantia !== pasantia.id_pasantia)
            );

            setAviso({
                tipo: 'success',
                mensaje: 'Pasantía eliminada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje: error.message || 'No se pudo eliminar la pasantía.',
            });
        } finally {
            setEliminando(null);
        }
    };

    const obtenerNombreEncargado = (pasantia: Pasantia) => {
        const usuario = pasantia.jefe_pasante?.usuario;

        if (!usuario) {
            return 'Sin encargado';
        }

        return `${usuario.nombre} ${usuario.apellido}`;
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-institucional-blue font-semibold animate-pulse">
                    Cargando pasantías...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {aviso && <AvisoTailwind aviso={aviso} />}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                        Pasantías
                    </h2>
                    <p className="text-sm text-medium-gray">
                        Gestiona las ofertas de pasantías de la empresa.
                    </p>
                </div>

                {puedeGestionar && (
                    <button
                        type="button"
                        onClick={abrirCrear}
                        className="bg-main-green hover:bg-soft-green text-white-main font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Agregar Pasantía
                    </button>
                )}
            </div>

            {!puedeGestionar && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                    Estás visualizando las pasantías en modo consulta.
                </div>
            )}

            {encargados.length === 0 && puedeGestionar && (
                <div className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm">
                    Primero registra al menos un encargado de pasantes en la sección Mi Empresa para poder crear una pasantía.
                </div>
            )}

            {pasantias.length === 0 ? (
                <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-medium-gray" size={36} />
                        <div>
                            <h3 className="text-lg font-bold text-dark-gray">
                                No hay pasantías registradas
                            </h3>
                            <p className="text-sm text-medium-gray">
                                Cuando registres una pasantía, aparecerá listada en esta sección.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {pasantias.map((pasantia) => {
                        const documentoUrl = obtenerUrlDocumento(pasantia.documento_url);

                        return (
                            <div
                                key={pasantia.id_pasantia}
                                className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray"
                            >
                                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-start gap-3">
                                            <Briefcase
                                                className="text-main-green mt-1 shrink-0"
                                                size={28}
                                            />

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-institucional-blue">
                                                        {pasantia.nombre}
                                                    </h3>

                                                    <span
                                                        className={`text-xs font-bold px-3 py-1 rounded-full ${pasantia.estado === 'habilitada'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {pasantia.estado === 'habilitada'
                                                            ? 'Habilitada'
                                                            : 'Inhabilitada'}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-dark-gray mt-2 leading-relaxed">
                                                    {pasantia.descripcion}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm text-dark-gray">
                                            <DatoPasantia
                                                icono={<Calendar size={16} />}
                                                label="Inicio"
                                                valor={pasantia.fecha_inicio}
                                            />

                                            <DatoPasantia
                                                icono={<Calendar size={16} />}
                                                label="Fin"
                                                valor={pasantia.fecha_fin}
                                            />

                                            <DatoPasantia
                                                icono={<Clock size={16} />}
                                                label="Horario"
                                                valor={pasantia.horario}
                                            />

                                            <DatoPasantia
                                                icono={<UserCircle size={16} />}
                                                label="Encargado"
                                                valor={obtenerNombreEncargado(pasantia)}
                                            />
                                        </div>

                                        {pasantia.documento_nombre && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText size={18} className="text-secondary-blue" />

                                                {documentoUrl ? (
                                                    <a
                                                        href={documentoUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-secondary-blue font-semibold hover:underline"
                                                    >
                                                        {pasantia.documento_nombre}
                                                    </a>
                                                ) : (
                                                    <span className="text-dark-gray">
                                                        {pasantia.documento_nombre}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap xl:flex-col gap-2 min-w-[180px]">
                                        {documentoUrl && (
                                            <a
                                                href={documentoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-light-gray hover:bg-medium-gray/20 text-dark-gray font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Eye size={17} />
                                                Ver documento
                                            </a>
                                        )}

                                        {puedeGestionar && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEditar(pasantia)}
                                                    className="bg-secondary-blue hover:bg-institucional-blue text-white-main font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Edit size={17} />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={cambiandoEstado === pasantia.id_pasantia}
                                                    onClick={() => handleCambiarEstado(pasantia)}
                                                    className={`font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 ${pasantia.estado === 'habilitada'
                                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white-main'
                                                            : 'bg-main-green hover:bg-soft-green text-white-main'
                                                        }`}
                                                >
                                                    {pasantia.estado === 'habilitada' ? (
                                                        <>
                                                            <PowerOff size={17} />
                                                            Inhabilitar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power size={17} />
                                                            Habilitar
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={eliminando === pasantia.id_pasantia}
                                                    onClick={() => handleEliminar(pasantia)}
                                                    className="bg-red-600 hover:bg-red-700 text-white-main font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                                                >
                                                    <Trash2 size={17} />
                                                    {eliminando === pasantia.id_pasantia
                                                        ? 'Eliminando...'
                                                        : 'Eliminar'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PasantiaFormModal
                abierto={modalFormulario}
                modo={modoFormulario}
                pasantiaInicial={pasantiaSeleccionada}
                encargados={encargados}
                cargando={guardando}
                onClose={() => setModalFormulario(false)}
                onSubmit={handleSubmitPasantia}
            />
        </div>
    );
};

interface DatoPasantiaProps {
    icono: React.ReactNode;
    label: string;
    valor: string;
}

const DatoPasantia: React.FC<DatoPasantiaProps> = ({
    icono,
    label,
    valor,
}) => {
    return (
        <div className="bg-light-gray/40 rounded-xl px-4 py-3">
            <p className="text-xs text-medium-gray font-semibold flex items-center gap-1">
                {icono}
                {label}
            </p>
            <p className="font-bold text-dark-gray mt-1">{valor}</p>
        </div>
    );
};

const AvisoTailwind: React.FC<{ aviso: Aviso }> = ({ aviso }) => {
    const estilos = {
        success: 'bg-green-100 text-green-700 border-green-200',
        error: 'bg-red-100 text-red-700 border-red-200',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    const Icon = aviso.tipo === 'success' ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`border px-4 py-3 rounded-xl text-sm flex gap-2 items-start ${estilos[aviso.tipo]}`}
        >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p>{aviso.mensaje}</p>
        </div>
    );
};