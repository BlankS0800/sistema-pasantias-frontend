import React, { useEffect, useState } from 'react';
import {
    X,
    Save,
    Briefcase,
    FileText,
    Calendar,
    Clock,
    UserCircle,
    Upload,
} from 'lucide-react';

import type {
    EncargadoPasantia,
    EstadoPasantia,
    Pasantia,
    PasantiaPayload,
} from '../../services/pasantiaService';

interface PasantiaFormModalProps {
    abierto: boolean;
    modo: 'crear' | 'editar';
    pasantiaInicial?: Pasantia | null;
    encargados: EncargadoPasantia[];
    cargando?: boolean;
    onClose: () => void;
    onSubmit: (payload: PasantiaPayload) => void;
}

interface FormDataPasantia {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: EstadoPasantia;
    horario: string;
    id_jefe: string;
    documento: File | null;
}

type ErroresPasantia = Partial<Record<keyof FormDataPasantia, string>>;

export const PasantiaFormModal: React.FC<PasantiaFormModalProps> = ({
    abierto,
    modo,
    pasantiaInicial,
    encargados,
    cargando = false,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<FormDataPasantia>({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'habilitada',
        horario: '',
        id_jefe: '',
        documento: null,
    });

    const [errores, setErrores] = useState<ErroresPasantia>({});

    useEffect(() => {
        if (abierto) {
            setFormData({
                nombre: pasantiaInicial?.nombre || '',
                descripcion: pasantiaInicial?.descripcion || '',
                fecha_inicio: pasantiaInicial?.fecha_inicio
                    ? pasantiaInicial.fecha_inicio.substring(0, 10)
                    : '',
                fecha_fin: pasantiaInicial?.fecha_fin
                    ? pasantiaInicial.fecha_fin.substring(0, 10)
                    : '',
                estado: pasantiaInicial?.estado || 'habilitada',
                horario: pasantiaInicial?.horario || '',
                id_jefe: pasantiaInicial?.id_jefe
                    ? String(pasantiaInicial.id_jefe)
                    : '',
                documento: null,
            });

            setErrores({});
        }
    }, [abierto, pasantiaInicial]);

    if (!abierto) return null;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] || null;

        setFormData({
            ...formData,
            documento: archivo,
        });

        setErrores({
            ...errores,
            documento: '',
        });
    };

    const validar = () => {
        const nuevosErrores: ErroresPasantia = {};

        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre de la pasantía es obligatorio.';
        } else if (formData.nombre.trim().length < 3) {
            nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
        }

        if (!formData.descripcion.trim()) {
            nuevosErrores.descripcion = 'La descripción es obligatoria.';
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

        if (!formData.horario.trim()) {
            nuevosErrores.horario = 'El horario es obligatorio.';
        }

        if (!formData.id_jefe) {
            nuevosErrores.id_jefe = 'Selecciona un encargado de pasante.';
        }

        if (formData.documento) {
            const maxSize = 5 * 1024 * 1024;

            if (formData.documento.size > maxSize) {
                nuevosErrores.documento = 'El documento no debe superar los 5 MB.';
            }
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        onSubmit({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            estado: formData.estado,
            horario: formData.horario.trim(),
            id_jefe: Number(formData.id_jefe),
            documento: formData.documento,
        });
    };

    const inputClass = (campo: keyof FormDataPasantia) => {
        return `w-full pl-10 pr-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    const textAreaClass = (campo: keyof FormDataPasantia) => {
        return `w-full px-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors min-h-28 resize-none ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    const nombreEncargado = (encargado: EncargadoPasantia) => {
        const nombre = encargado.usuario?.nombre || '';
        const apellido = encargado.usuario?.apellido || '';

        return `${nombre} ${apellido}`.trim() || `Encargado #${encargado.id_usuario}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white-main w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-institucional-blue text-white-main px-6 py-5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="font-montserrat font-bold text-xl">
                            {modo === 'crear' ? 'Agregar Pasantía' : 'Editar Pasantía'}
                        </h3>
                        <p className="text-sm opacity-80">
                            Completa la información de la oferta y asigna un encargado.
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

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <CampoPasantia label="Nombre de la pasantía" error={errores.nombre}>
                        <div className="relative">
                            <Briefcase
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={inputClass('nombre')}
                                placeholder="Ej: Auxiliar de Sistemas"
                            />
                        </div>
                    </CampoPasantia>

                    <CampoPasantia label="Descripción" error={errores.descripcion}>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className={textAreaClass('descripcion')}
                            placeholder="Describe las funciones, requisitos y responsabilidades de la pasantía..."
                        />
                    </CampoPasantia>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CampoPasantia label="Fecha de inicio" error={errores.fecha_inicio}>
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
                        </CampoPasantia>

                        <CampoPasantia label="Fecha de fin" error={errores.fecha_fin}>
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
                        </CampoPasantia>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CampoPasantia label="Horario" error={errores.horario}>
                            <div className="relative">
                                <Clock
                                    className="absolute left-3 top-3.5 text-medium-gray"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    className={inputClass('horario')}
                                    placeholder="Ej: Lunes a viernes de 08:00 a 12:00"
                                />
                            </div>
                        </CampoPasantia>

                        <CampoPasantia label="Estado" error={errores.estado}>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-light-gray/40 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors"
                            >
                                <option value="habilitada">Habilitada</option>
                                <option value="inhabilitada">Inhabilitada</option>
                            </select>
                        </CampoPasantia>
                    </div>

                    <CampoPasantia label="Encargado de pasante" error={errores.id_jefe}>
                        <div className="relative">
                            <UserCircle
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />
                            <select
                                name="id_jefe"
                                value={formData.id_jefe}
                                onChange={handleChange}
                                className={inputClass('id_jefe')}
                            >
                                <option value="">Selecciona un encargado...</option>

                                {encargados.map((encargado) => (
                                    <option
                                        key={encargado.id_usuario}
                                        value={encargado.id_usuario}
                                    >
                                        {nombreEncargado(encargado)} - {encargado.cargo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CampoPasantia>

                    <CampoPasantia label="Documento adjunto" error={errores.documento}>
                        <div className="relative">
                            <Upload
                                className="absolute left-3 top-3.5 text-medium-gray"
                                size={20}
                            />
                            <input
                                type="file"
                                name="documento"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="w-full pl-10 pr-4 py-3 bg-light-gray/40 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors"
                            />
                        </div>

                        {modo === 'editar' && pasantiaInicial?.documento_nombre && (
                            <p className="text-xs text-medium-gray ml-1">
                                Documento actual: {pasantiaInicial.documento_nombre}
                            </p>
                        )}
                    </CampoPasantia>

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
                                    ? 'Registrar Pasantía'
                                    : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CampoPasantiaProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const CampoPasantia: React.FC<CampoPasantiaProps> = ({
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