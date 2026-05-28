import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    FileText,
    Plus,
    Trash2,
    UserCircle,
} from 'lucide-react';

import {
    actualizarActividadJefe,
    eliminarActividadJefe,
    listarPasantiasAsignadasJefe,
    registrarActividadJefe,
} from '../../services/actividadJefeService';

import type {
    ActividadJefe,
    ActividadPayload,
    PasantiaAsignada,
} from '../../services/actividadJefeService';

import { ActividadJefeModal } from './ActividadJefeModal';

interface Aviso {
    tipo: 'success' | 'error' | 'warning';
    mensaje: string;
}

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const JefePasantiasPanel: React.FC = () => {
    const [pasantias, setPasantias] = useState<PasantiaAsignada[]>([]);
    const [idPasantiaActiva, setIdPasantiaActiva] = useState<number | null>(null);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState<number | null>(null);

    const [modalActividad, setModalActividad] = useState(false);
    const [modoModal, setModoModal] = useState<'crear' | 'editar'>('crear');
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
    const [actividadSeleccionada, setActividadSeleccionada] =
        useState<ActividadJefe | null>(null);

    const [aviso, setAviso] = useState<Aviso | null>(null);

    const cargarPasantias = async () => {
        setCargando(true);
        setAviso(null);

        try {
            const data = await listarPasantiasAsignadasJefe();
            const lista = data.pasantias || [];

            setPasantias(lista);

            if (lista.length > 0) {
                setIdPasantiaActiva((actual) => actual || lista[0].id_pasantia);
            }
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudieron cargar las pasantías asignadas.',
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPasantias();
    }, []);

    const pasantiaActiva = useMemo(() => {
        return pasantias.find(
            (pasantia) => pasantia.id_pasantia === idPasantiaActiva
        );
    }, [pasantias, idPasantiaActiva]);

    const actividades = pasantiaActiva?.actividades || [];

    const abrirCrearActividad = (fecha: string) => {
        if (!pasantiaActiva) return;

        setModoModal('crear');
        setFechaSeleccionada(fecha);
        setActividadSeleccionada(null);
        setModalActividad(true);
    };

    const abrirEditarActividad = (actividad: ActividadJefe) => {
        setModoModal('editar');
        setActividadSeleccionada(actividad);
        setFechaSeleccionada(null);
        setModalActividad(true);
    };

    const handleSubmitActividad = async (payload: ActividadPayload) => {
        setGuardando(true);
        setAviso(null);

        try {
            const data =
                modoModal === 'crear'
                    ? await registrarActividadJefe(payload)
                    : await actualizarActividadJefe(
                        actividadSeleccionada!.id_actividad,
                        payload
                    );

            setPasantias((prev) =>
                prev.map((pasantia) => {
                    if (pasantia.id_pasantia !== data.actividad.id_pasantia) {
                        return pasantia;
                    }

                    const actividadesActuales = pasantia.actividades || [];

                    if (modoModal === 'crear') {
                        return {
                            ...pasantia,
                            actividades: [...actividadesActuales, data.actividad],
                            actividades_count: (pasantia.actividades_count || 0) + 1,
                        };
                    }

                    return {
                        ...pasantia,
                        actividades: actividadesActuales.map((actividad) =>
                            actividad.id_actividad === data.actividad.id_actividad
                                ? data.actividad
                                : actividad
                        ),
                    };
                })
            );

            setModalActividad(false);
            setActividadSeleccionada(null);
            setFechaSeleccionada(null);

            setAviso({
                tipo: 'success',
                mensaje:
                    modoModal === 'crear'
                        ? 'Actividad registrada correctamente.'
                        : 'Actividad actualizada correctamente.',
            });

            await cargarPasantias();
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudo guardar la actividad. Revisa los datos ingresados.',
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminarActividad = async (actividad: ActividadJefe) => {
        const confirmado = window.confirm(
            `¿Seguro que deseas eliminar la actividad "${actividad.titulo}"?`
        );

        if (!confirmado) return;

        setEliminando(actividad.id_actividad);
        setAviso(null);

        try {
            await eliminarActividadJefe(actividad.id_actividad);

            setPasantias((prev) =>
                prev.map((pasantia) => {
                    if (pasantia.id_pasantia !== actividad.id_pasantia) {
                        return pasantia;
                    }

                    return {
                        ...pasantia,
                        actividades: (pasantia.actividades || []).filter(
                            (item) => item.id_actividad !== actividad.id_actividad
                        ),
                        actividades_count: Math.max((pasantia.actividades_count || 1) - 1, 0),
                    };
                })
            );

            setAviso({
                tipo: 'success',
                mensaje: 'Actividad eliminada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje: error.message || 'No se pudo eliminar la actividad.',
            });
        } finally {
            setEliminando(null);
        }
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-institucional-blue font-semibold animate-pulse">
                    Cargando pasantías asignadas...
                </p>
            </div>
        );
    }

    if (pasantias.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                    Mis Pasantías
                </h2>

                {aviso && <AvisoTailwind aviso={aviso} />}

                <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-medium-gray" size={38} />

                        <div>
                            <h3 className="text-lg font-bold text-dark-gray">
                                No tienes pasantías asignadas
                            </h3>

                            <p className="text-sm text-medium-gray">
                                Cuando el gerente te asigne una pasantía, podrás crear y
                                administrar actividades desde esta sección.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!pasantiaActiva) {
        return null;
    }

    return (
        <div className="space-y-5 min-h-[calc(100vh-120px)]">
            {aviso && <AvisoTailwind aviso={aviso} />}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                        Mis Pasantías
                    </h2>

                    <p className="text-sm text-medium-gray">
                        Selecciona una pasantía y el calendario mostrará solo sus actividades.
                    </p>
                </div>

                <div className="bg-white-main border border-light-gray rounded-xl px-4 py-3 shadow-sm flex gap-5 text-sm">
                    <div>
                        <p className="text-xs text-medium-gray font-semibold">
                            Pasantía activa
                        </p>

                        <p className="font-bold text-institucional-blue">
                            {pasantiaActiva.nombre}
                        </p>
                    </div>

                    <div className="border-l border-light-gray pl-5">
                        <p className="text-xs text-medium-gray font-semibold">
                            Actividades
                        </p>

                        <p className="font-bold text-main-green">
                            {actividades.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-[330px_1fr] gap-5 items-start">
                <aside className="space-y-4 2xl:sticky 2xl:top-4">
                    <PanelPasantias
                        pasantias={pasantias}
                        idPasantiaActiva={pasantiaActiva.id_pasantia}
                        onSeleccionar={setIdPasantiaActiva}
                    />

                    <ListaActividades
                        actividades={actividades}
                        onEditarActividad={abrirEditarActividad}
                    />
                </aside>

                <main className="min-w-0">
                    <ResumenPasantia pasantia={pasantiaActiva} />

                    <div className="mt-5">
                        <CalendarioPasantia
                            pasantia={pasantiaActiva}
                            actividades={actividades}
                            eliminando={eliminando}
                            onFechaClick={abrirCrearActividad}
                            onEditarActividad={abrirEditarActividad}
                            onEliminarActividad={handleEliminarActividad}
                        />
                    </div>
                </main>
            </div>

            <ActividadJefeModal
                abierto={modalActividad}
                modo={modoModal}
                actividadInicial={actividadSeleccionada}
                pasantias={pasantias}
                idPasantiaSeleccionada={pasantiaActiva.id_pasantia}
                fechaSeleccionada={fechaSeleccionada}
                cargando={guardando}
                onClose={() => {
                    setModalActividad(false);
                    setActividadSeleccionada(null);
                    setFechaSeleccionada(null);
                }}
                onSubmit={handleSubmitActividad}
            />
        </div>
    );
};

interface PanelPasantiasProps {
    pasantias: PasantiaAsignada[];
    idPasantiaActiva: number;
    onSeleccionar: (idPasantia: number) => void;
}

const PanelPasantias: React.FC<PanelPasantiasProps> = ({
    pasantias,
    idPasantiaActiva,
    onSeleccionar,
}) => {
    return (
        <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
            <div className="px-5 py-4 border-b border-light-gray bg-light-gray/30">
                <h3 className="text-base font-bold text-institucional-blue">
                    Pasantías asignadas
                </h3>

                <p className="text-xs text-medium-gray">
                    Cambia de pasantía para actualizar el calendario.
                </p>
            </div>

            <div className="p-3 space-y-3 max-h-[42vh] 2xl:max-h-[58vh] overflow-y-auto">
                {pasantias.map((pasantia) => {
                    const activa = pasantia.id_pasantia === idPasantiaActiva;

                    return (
                        <button
                            key={pasantia.id_pasantia}
                            type="button"
                            onClick={() => onSeleccionar(pasantia.id_pasantia)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                activa
                                    ? 'bg-main-green/10 border-main-green ring-2 ring-main-green/20'
                                    : 'bg-white-main border-light-gray hover:border-secondary-blue hover:bg-light-gray/20'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <Briefcase
                                    className={activa ? 'text-main-green' : 'text-medium-gray'}
                                    size={24}
                                />

                                <div className="min-w-0">
                                    <p className="font-bold text-institucional-blue line-clamp-2">
                                        {pasantia.nombre}
                                    </p>

                                    <p className="text-[11px] text-medium-gray mt-1">
                                        {formatearFechaTexto(pasantia.fecha_inicio)} -{' '}
                                        {formatearFechaTexto(pasantia.fecha_fin)}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-[11px] bg-institucional-blue/10 text-institucional-blue px-2 py-1 rounded">
                                            {pasantia.actividades?.length || pasantia.actividades_count || 0} act.
                                        </span>

                                        <span className="text-[11px] bg-main-green/10 text-main-green px-2 py-1 rounded">
                                            {pasantia.pasantes_aprobados_count || 0} pasantes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface ListaActividadesProps {
    actividades: ActividadJefe[];
    onEditarActividad: (actividad: ActividadJefe) => void;
}

const ListaActividades: React.FC<ListaActividadesProps> = ({
    actividades,
    onEditarActividad,
}) => {
    return (
        <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
            <div className="px-5 py-4 border-b border-light-gray bg-light-gray/30">
                <h3 className="text-base font-bold text-institucional-blue">
                    Actividades de la pasantía
                </h3>

                <p className="text-xs text-medium-gray">
                    Solo se listan las actividades de la pasantía seleccionada.
                </p>
            </div>

            <div className="p-3 space-y-3 max-h-[32vh] 2xl:max-h-[45vh] overflow-y-auto">
                {actividades.length === 0 ? (
                    <div className="text-center text-sm text-medium-gray py-6">
                        No hay actividades registradas.
                    </div>
                ) : (
                    actividades.map((actividad) => (
                        <button
                            key={actividad.id_actividad}
                            type="button"
                            onClick={() => onEditarActividad(actividad)}
                            className="w-full text-left border border-light-gray hover:border-secondary-blue rounded-xl p-3 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <span
                                    className={`w-3 h-3 rounded-full mt-1 shrink-0 ${obtenerClasePuntoColor(
                                        actividad.color
                                    )}`}
                                />

                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-institucional-blue line-clamp-1">
                                        {actividad.titulo}
                                    </p>

                                    <p className="text-xs text-medium-gray line-clamp-2 mt-1">
                                        {actividad.descripcion}
                                    </p>

                                    <p className="text-[11px] text-dark-gray mt-2 flex items-center gap-1">
                                        <Calendar size={11} />
                                        {formatearFechaTexto(actividad.fecha_inicio)} -{' '}
                                        {formatearFechaTexto(actividad.fecha_fin)}
                                    </p>

                                    <p className="text-[11px] text-medium-gray mt-1 flex items-center gap-1">
                                        <UserCircle size={11} />
                                        {obtenerNombrePasante(actividad)}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

interface ResumenPasantiaProps {
    pasantia: PasantiaAsignada;
}

const ResumenPasantia: React.FC<ResumenPasantiaProps> = ({ pasantia }) => {
    return (
        <div className="bg-white-main p-5 rounded-2xl shadow-sm border border-light-gray">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-main-green mt-1 shrink-0" size={30} />

                    <div>
                        <h3 className="text-lg font-bold text-institucional-blue">
                            {pasantia.nombre}
                        </h3>

                        <p className="text-sm text-dark-gray mt-1 line-clamp-2">
                            {pasantia.descripcion}
                        </p>

                        {pasantia.empresa?.nombre && (
                            <p className="text-xs text-medium-gray mt-2">
                                Empresa: {pasantia.empresa.nombre}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:w-[520px]">
                    <DatoResumen
                        icono={<Calendar size={16} />}
                        label="Inicio"
                        valor={formatearFechaTexto(pasantia.fecha_inicio)}
                    />

                    <DatoResumen
                        icono={<Calendar size={16} />}
                        label="Fin"
                        valor={formatearFechaTexto(pasantia.fecha_fin)}
                    />

                    <DatoResumen
                        icono={<Clock size={16} />}
                        label="Horario"
                        valor={pasantia.horario || 'No definido'}
                    />
                </div>
            </div>
        </div>
    );
};

interface DatoResumenProps {
    icono: React.ReactNode;
    label: string;
    valor: string;
}

const DatoResumen: React.FC<DatoResumenProps> = ({ icono, label, valor }) => {
    return (
        <div className="bg-light-gray/40 rounded-xl px-4 py-3">
            <p className="text-xs text-medium-gray font-semibold flex items-center gap-1">
                {icono}
                {label}
            </p>

            <p className="font-bold text-dark-gray mt-1 text-sm">{valor}</p>
        </div>
    );
};

interface CalendarioPasantiaProps {
    pasantia: PasantiaAsignada;
    actividades: ActividadJefe[];
    eliminando: number | null;
    onFechaClick: (fecha: string) => void;
    onEditarActividad: (actividad: ActividadJefe) => void;
    onEliminarActividad: (actividad: ActividadJefe) => void;
}

const CalendarioPasantia: React.FC<CalendarioPasantiaProps> = ({
    pasantia,
    actividades,
    eliminando,
    onFechaClick,
    onEditarActividad,
    onEliminarActividad,
}) => {
    const dias = generarDiasEntreFechas(
        pasantia.fecha_inicio.substring(0, 10),
        pasantia.fecha_fin.substring(0, 10)
    );

    const espaciosIniciales = dias.length > 0 ? obtenerEspaciosIniciales(dias[0]) : 0;

    return (
        <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
            <div className="px-5 py-4 border-b border-light-gray flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white-main">
                <div>
                    <h3 className="text-xl font-bold text-institucional-blue">
                        Calendario de actividades
                    </h3>

                    <p className="text-sm text-medium-gray">
                        Haz clic en una casilla para crear una actividad en esa fecha.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold bg-main-green/10 text-main-green px-3 py-1.5 rounded-full">
                        {actividades.length} actividades
                    </span>

                    <span className="text-xs font-bold bg-institucional-blue/10 text-institucional-blue px-3 py-1.5 rounded-full">
                        {dias.length} días
                    </span>
                </div>
            </div>

            <div className="p-4 md:p-5">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {diasSemana.map((dia) => (
                        <div
                            key={dia}
                            className="text-center text-xs md:text-sm font-bold text-medium-gray uppercase py-2 bg-light-gray/40 rounded-lg"
                        >
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 md:gap-3">
                    {Array.from({ length: espaciosIniciales }).map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="min-h-[9rem] md:min-h-[12rem] xl:min-h-[14rem] 2xl:min-h-[16rem] rounded-xl border border-transparent"
                        />
                    ))}

                    {dias.map((fecha) => {
                        const actividadesDelDia = actividades.filter((actividad) =>
                            actividadCubreFecha(actividad, fecha)
                        );

                        return (
                            <button
                                key={fecha}
                                type="button"
                                onClick={() => onFechaClick(fecha)}
                                className={`min-h-[9rem] md:min-h-[12rem] xl:min-h-[14rem] 2xl:min-h-[16rem] border rounded-2xl p-2 md:p-3 text-left transition-all group ${
                                    actividadesDelDia.length > 0
                                        ? 'bg-main-green/5 border-main-green/25 hover:bg-main-green/10'
                                        : 'bg-light-gray/20 border-light-gray hover:bg-institucional-blue/5 hover:border-secondary-blue/40'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white-main border border-light-gray text-sm font-extrabold text-institucional-blue shadow-sm">
                                            {obtenerDiaMes(fecha)}
                                        </span>

                                        <p className="text-[10px] md:text-xs text-medium-gray mt-1">
                                            {obtenerNombreDiaCompleto(fecha)}
                                        </p>
                                    </div>

                                    <Plus
                                        size={18}
                                        className="text-main-green opacity-60 group-hover:opacity-100"
                                    />
                                </div>

                                <div className="mt-3 space-y-2">
                                    {actividadesDelDia.length === 0 ? (
                                        <p className="text-[11px] text-medium-gray italic mt-6 text-center">
                                            Sin actividad
                                        </p>
                                    ) : (
                                        actividadesDelDia.map((actividad) => (
                                            <div
                                                key={actividad.id_actividad}
                                                className={`border rounded-xl px-2.5 py-2 shadow-sm ${obtenerClaseActividad(
                                                    actividad.color
                                                )}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-xs md:text-sm font-bold line-clamp-2">
                                                            {actividad.titulo}
                                                        </p>

                                                        <p className="text-[10px] md:text-xs opacity-80 line-clamp-2 mt-1">
                                                            {actividad.descripcion}
                                                        </p>

                                                        <p className="text-[10px] md:text-xs opacity-90 mt-2 flex items-center gap-1">
                                                            <UserCircle size={11} />
                                                            {obtenerNombrePasante(actividad)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onEditarActividad(actividad)}
                                                        className="px-2 py-1 rounded-lg bg-secondary-blue text-white-main hover:bg-institucional-blue"
                                                        title="Editar"
                                                    >
                                                        <Edit size={12} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={eliminando === actividad.id_actividad}
                                                        onClick={() => onEliminarActividad(actividad)}
                                                        className="px-2 py-1 rounded-lg bg-red-600 text-white-main hover:bg-red-700 disabled:opacity-60"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const generarDiasEntreFechas = (inicio: string, fin: string) => {
    const dias: string[] = [];

    const fechaActual = crearFechaLocal(inicio);
    const fechaFin = crearFechaLocal(fin);

    while (fechaActual <= fechaFin) {
        dias.push(formatearFechaInput(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return dias;
};

const crearFechaLocal = (fecha: string) => {
    return new Date(`${fecha}T00:00:00`);
};

const formatearFechaInput = (fecha: Date) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const obtenerEspaciosIniciales = (fecha: string) => {
    const dia = crearFechaLocal(fecha).getDay();

    return (dia + 6) % 7;
};

const obtenerDiaMes = (fecha: string) => {
    return crearFechaLocal(fecha).getDate();
};

const obtenerNombreDiaCompleto = (fecha: string) => {
    return crearFechaLocal(fecha).toLocaleDateString('es-BO', {
        weekday: 'short',
    });
};

const formatearFechaTexto = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return crearFechaLocal(fecha.substring(0, 10)).toLocaleDateString('es-BO');
};

const actividadCubreFecha = (actividad: ActividadJefe, fecha: string) => {
    const inicio = actividad.fecha_inicio.substring(0, 10);
    const fin = actividad.fecha_fin.substring(0, 10);

    return fecha >= inicio && fecha <= fin;
};

const obtenerNombrePasante = (actividad: ActividadJefe) => {
    const usuario = actividad.pasante?.usuario;

    if (!usuario) {
        return 'Sin pasante asignado';
    }

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
};

const obtenerClaseActividad = (color?: string) => {
    const clases: Record<string, string> = {
        verde: 'bg-main-green/10 border-main-green/30 text-main-green',
        azul: 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue',
        morado: 'bg-purple-100 border-purple-200 text-purple-700',
        naranja: 'bg-orange-100 border-orange-200 text-orange-700',
        rojo: 'bg-red-100 border-red-200 text-red-700',
    };

    return clases[color || 'azul'] || clases.azul;
};

const obtenerClasePuntoColor = (color?: string) => {
    const clases: Record<string, string> = {
        verde: 'bg-main-green',
        azul: 'bg-institucional-blue',
        morado: 'bg-purple-600',
        naranja: 'bg-orange-500',
        rojo: 'bg-red-600',
    };

    return clases[color || 'azul'] || clases.azul;
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