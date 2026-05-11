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

            cargarPasantias();
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
        <div className="space-y-6">
            {aviso && <AvisoTailwind aviso={aviso} />}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                        Mis Pasantías
                    </h2>

                    <p className="text-sm text-medium-gray">
                        Selecciona una pasantía y registra actividades dentro de su
                        calendario.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-institucional-blue">
                        Pasantías asignadas
                    </h3>

                    {pasantias.map((pasantia) => {
                        const activa = pasantia.id_pasantia === pasantiaActiva.id_pasantia;

                        return (
                            <button
                                key={pasantia.id_pasantia}
                                type="button"
                                onClick={() => setIdPasantiaActiva(pasantia.id_pasantia)}
                                className={`w-full text-left bg-white-main p-5 rounded-xl shadow-sm border transition-all ${activa
                                        ? 'border-main-green ring-2 ring-main-green/20'
                                        : 'border-light-gray hover:border-secondary-blue'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Briefcase
                                        className={activa ? 'text-main-green' : 'text-medium-gray'}
                                        size={28}
                                    />

                                    <div>
                                        <p className="font-bold text-institucional-blue">
                                            {pasantia.nombre}
                                        </p>

                                        <p className="text-xs text-medium-gray mt-1">
                                            {pasantia.fecha_inicio} hasta {pasantia.fecha_fin}
                                        </p>

                                        <p className="text-xs text-dark-gray mt-2 line-clamp-2">
                                            {pasantia.descripcion}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <ResumenPasantia pasantia={pasantiaActiva} />

                    <CalendarioPasantia
                        pasantia={pasantiaActiva}
                        actividades={actividades}
                        eliminando={eliminando}
                        onFechaClick={abrirCrearActividad}
                        onEditarActividad={abrirEditarActividad}
                        onEliminarActividad={handleEliminarActividad}
                    />
                </div>
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

interface ResumenPasantiaProps {
    pasantia: PasantiaAsignada;
}

const ResumenPasantia: React.FC<ResumenPasantiaProps> = ({ pasantia }) => {
    return (
        <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
            <div className="flex items-start gap-3">
                <CheckCircle2 className="text-main-green mt-1" size={30} />

                <div>
                    <h3 className="text-lg font-bold text-institucional-blue">
                        {pasantia.nombre}
                    </h3>

                    <p className="text-sm text-dark-gray mt-2">{pasantia.descripcion}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-dark-gray mt-5">
                        <DatoResumen
                            icono={<Calendar size={16} />}
                            label="Inicio"
                            valor={pasantia.fecha_inicio}
                        />

                        <DatoResumen
                            icono={<Calendar size={16} />}
                            label="Fin"
                            valor={pasantia.fecha_fin}
                        />

                        <DatoResumen
                            icono={<Clock size={16} />}
                            label="Horario"
                            valor={pasantia.horario}
                        />
                    </div>
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

            <p className="font-bold text-dark-gray mt-1">{valor}</p>
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

    const espaciosIniciales = obtenerEspaciosIniciales(dias[0]);

    return (
        <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray">
            <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-lg font-bold text-institucional-blue">
                        Calendario de Actividades
                    </h3>

                    <p className="text-sm text-medium-gray">
                        Haz clic en una fecha para agregar una actividad.
                    </p>
                </div>

                <span className="text-xs font-bold bg-main-green/10 text-main-green px-3 py-1 rounded-full">
                    {actividades.length} actividades
                </span>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {diasSemana.map((dia) => (
                    <div
                        key={dia}
                        className="text-center text-xs font-bold text-medium-gray uppercase"
                    >
                        {dia}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: espaciosIniciales }).map((_, index) => (
                    <div key={`empty-${index}`} />
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
                            className="min-h-32 bg-light-gray/30 hover:bg-main-green/10 border border-light-gray rounded-xl p-2 text-left transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-institucional-blue">
                                    {obtenerDiaMes(fecha)}
                                </span>

                                <Plus size={14} className="text-main-green" />
                            </div>

                            <div className="mt-2 space-y-1">
                                {actividadesDelDia.map((actividad) => (
                                    <div
                                        key={actividad.id_actividad}
                                        className="bg-white-main border border-main-green/30 rounded-lg px-2 py-1 shadow-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <p className="text-[11px] font-bold text-institucional-blue line-clamp-1">
                                            {actividad.titulo}
                                        </p>

                                        <p className="text-[10px] text-medium-gray line-clamp-1">
                                            {actividad.descripcion}
                                        </p>

                                        <div className="flex gap-1 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => onEditarActividad(actividad)}
                                                className="text-[10px] px-2 py-1 rounded bg-secondary-blue text-white-main hover:bg-institucional-blue"
                                            >
                                                <Edit size={10} />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={eliminando === actividad.id_actividad}
                                                onClick={() => onEliminarActividad(actividad)}
                                                className="text-[10px] px-2 py-1 rounded bg-red-600 text-white-main hover:bg-red-700 disabled:opacity-60"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
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
    const date = crearFechaLocal(fecha);

    return date.getDate();
};

const actividadCubreFecha = (actividad: ActividadJefe, fecha: string) => {
    const inicio = actividad.fecha_inicio.substring(0, 10);
    const fin = actividad.fecha_fin.substring(0, 10);

    return fecha >= inicio && fecha <= fin;
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