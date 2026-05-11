import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    FileText,
    Calendar,
    Briefcase,
    AlignLeft,
} from 'lucide-react';

import type {
    ActividadJefe,
    ActividadPayload,
    PasantiaAsignada,
} from '../../services/actividadJefeService';

interface ActividadJefeModalProps {
    abierto: boolean;
    modo: 'crear' | 'editar';
    actividadInicial?: ActividadJefe | null;
    pasantias: PasantiaAsignada[];
    idPasantiaSeleccionada?: number | null;
    fechaSeleccionada?: string | null;
    cargando?: boolean;
    onClose: () => void;
    onSubmit: (payload: ActividadPayload) => void;
}

interface FormDataActividad {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    id_pasantia: string;
}

type ErroresActividad = Partial<Record<keyof FormDataActividad, string>>;

export const ActividadJefeModal: React.FC<ActividadJefeModalProps> = ({
    abierto,
    modo,
    actividadInicial,
    pasantias,
    idPasantiaSeleccionada,
    fechaSeleccionada,
    cargando = false,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<FormDataActividad>({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_pasantia: '',
    });

    const [errores, setErrores] = useState<ErroresActividad>({});

    useEffect(() => {
        if (abierto) {
            setFormData({
                titulo: actividadInicial?.titulo || '',
                descripcion: actividadInicial?.descripcion || '',
                fecha_inicio: actividadInicial?.fecha_inicio
                    ? actividadInicial.fecha_inicio.substring(0, 10)
                    : fechaSeleccionada || '',
                fecha_fin: actividadInicial?.fecha_fin
                    ? actividadInicial.fecha_fin.substring(0, 10)
                    : fechaSeleccionada || '',
                id_pasantia: actividadInicial?.id_pasantia
                    ? String(actividadInicial.id_pasantia)
                    : idPasantiaSeleccionada
                        ? String(idPasantiaSeleccionada)
                        : '',
            });

            setErrores({});
        }
    }, [abierto, actividadInicial, fechaSeleccionada, idPasantiaSeleccionada]);

    if (!abierto) return null;

    const pasantiaSeleccionada = pasantias.find(
        (pasantia) => String(pasantia.id_pasantia) === formData.id_pasantia
    );

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        setErrores({
            ...errores,
            [name]: '',
        });
    };

    const validar = () => {
        const nuevosErrores: ErroresActividad = {};

        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es obligatorio.';
        } else if (formData.titulo.trim().length < 3) {
            nuevosErrores.titulo = 'El título debe tener al menos 3 caracteres.';
        }

        if (!formData.descripcion.trim()) {
            nuevosErrores.descripcion = 'La descripción es obligatoria.';
        }

        if (!formData.id_pasantia) {
            nuevosErrores.id_pasantia = 'Selecciona una pasantía.';
        }

        if (!formData.fecha_inicio) {
            nuevosErrores.fecha_inicio = 'La fecha de inicio es obligatoria.';
        }

        if (!formData.fecha_fin) {
            nuevosErrores.fecha_fin = 'La fecha de fin es obligatoria.';
        }

        if (
            formData.fecha_inicio &&
            formData.fecha_fin &&
            formData.fecha_fin < formData.fecha_inicio
        ) {
            nuevosErrores.fecha_fin =
                'La fecha de fin no puede ser menor a la fecha de inicio.';
        }

        if (pasantiaSeleccionada && formData.fecha_inicio) {
            const inicioPasantia = pasantiaSeleccionada.fecha_inicio.substring(0, 10);
            const finPasantia = pasantiaSeleccionada.fecha_fin.substring(0, 10);

            if (
                formData.fecha_inicio < inicioPasantia ||
                formData.fecha_inicio > finPasantia
            ) {
                nuevosErrores.fecha_inicio =
                    'La fecha debe estar dentro del periodo de la pasantía.';
            }

            if (formData.fecha_fin < inicioPasantia || formData.fecha_fin > finPasantia) {
                nuevosErrores.fecha_fin =
                    'La fecha debe estar dentro del periodo de la pasantía.';
            }
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        onSubmit({
            titulo: formData.titulo.trim(),
            descripcion: formData.descripcion.trim(),
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            id_pasantia: Number(formData.id_pasantia),
        });
    };

    const inputClass = (campo: keyof FormDataActividad) => {
        return `w-full pl-10 pr-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    const textAreaClass = (campo: keyof FormDataActividad) => {
        return `w-full px-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors min-h-28 resize-none ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-institucional-blue text-white-main px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-montserrat font-bold text-xl">
                            {modo === 'crear' ? 'Agregar Actividad' : 'Editar Actividad'}
                        </h3>
                        <p className="text-sm opacity-80">
                            Registra la actividad dentro de una pasantía asignada.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={cargando}
                        className="p-2 hover:bg-white-main/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <CampoActividad label="Pasantía" error={errores.id_pasantia}>
                        <div className="relative">
                            <Briefcase
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />

                            <select
                                name="id_pasantia"
                                value={formData.id_pasantia}
                                onChange={handleChange}
                                className={inputClass('id_pasantia')}
                            >
                                <option value="">Selecciona una pasantía...</option>

                                {pasantias.map((pasantia) => (
                                    <option
                                        key={pasantia.id_pasantia}
                                        value={pasantia.id_pasantia}
                                    >
                                        {pasantia.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CampoActividad>

                    {pasantiaSeleccionada && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                            Periodo permitido:{' '}
                            <strong>{pasantiaSeleccionada.fecha_inicio}</strong> hasta{' '}
                            <strong>{pasantiaSeleccionada.fecha_fin}</strong>
                        </div>
                    )}

                    <CampoActividad label="Título" error={errores.titulo}>
                        <div className="relative">
                            <FileText
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />

                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className={inputClass('titulo')}
                                placeholder="Ej: Inducción inicial"
                            />
                        </div>
                    </CampoActividad>

                    <CampoActividad label="Descripción" error={errores.descripcion}>
                        <div className="relative">
                            <AlignLeft
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />

                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className={`${textAreaClass('descripcion')} pl-10`}
                                placeholder="Describe la actividad que deberá realizarse..."
                            />
                        </div>
                    </CampoActividad>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CampoActividad label="Fecha de inicio" error={errores.fecha_inicio}>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-3.5 text-medium-gray"
                                    size={20}
                                />

                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    className={inputClass('fecha_inicio')}
                                />
                            </div>
                        </CampoActividad>

                        <CampoActividad label="Fecha de fin" error={errores.fecha_fin}>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-3.5 text-medium-gray"
                                    size={20}
                                />

                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    className={inputClass('fecha_fin')}
                                />
                            </div>
                        </CampoActividad>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={cargando}
                            className="w-1/3 bg-light-gray hover:bg-medium-gray/20 text-dark-gray font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-2/3 bg-main-green hover:bg-soft-green text-white-main font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <Save size={19} />
                            {cargando
                                ? 'Guardando...'
                                : modo === 'crear'
                                    ? 'Registrar Actividad'
                                    : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CampoActividadProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const CampoActividad: React.FC<CampoActividadProps> = ({
    label,
    error,
    children,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">
                {label}
            </label>

            {children}

            {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
        </div>
    );
};