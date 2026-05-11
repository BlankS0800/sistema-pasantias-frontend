import React, { useEffect, useState } from 'react';
import {
    Plus,
    UserCircle,
    Mail,
    Phone,
    Briefcase,
    X,
    Save,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import {
    listarEncargadosPasantes,
    registrarEncargadoPasante,
} from '../../services/jefePasanteService';

import type {
    EncargadoPasante,
    EncargadoPasantePayload,
} from '../../services/jefePasanteService';

interface JefesPasantesPanelProps {
    puedeGestionar: boolean;
}

interface Aviso {
    tipo: 'success' | 'error' | 'warning';
    mensaje: string;
}

export const JefesPasantesPanel: React.FC<JefesPasantesPanelProps> = ({
    puedeGestionar,
}) => {
    const [encargados, setEncargados] = useState<EncargadoPasante[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [aviso, setAviso] = useState<Aviso | null>(null);

    const cargarEncargados = async () => {
        setCargando(true);

        try {
            const data = await listarEncargadosPasantes();
            setEncargados(data.encargados || []);
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje: error.message || 'No se pudieron cargar los encargados.',
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (puedeGestionar) {
            cargarEncargados();
        } else {
            setCargando(false);
        }
    }, [puedeGestionar]);

    const handleCrearEncargado = async (payload: EncargadoPasantePayload) => {
        setGuardando(true);
        setAviso(null);

        try {
            await registrarEncargadoPasante(payload);

            setAviso({
                tipo: 'success',
                mensaje: 'Encargado de pasante registrado correctamente.',
            });

            setModalAbierto(false);
            cargarEncargados();
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudo registrar el encargado. Revisa los datos ingresados.',
            });
        } finally {
            setGuardando(false);
        }
    };

    if (!puedeGestionar) {
        return null;
    }

    return (
        <div className="space-y-6">
            {aviso && <AvisoTailwind aviso={aviso} />}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-montserrat font-bold text-institucional-blue">
                        Encargados de Pasantes
                    </h3>
                    <p className="text-sm text-medium-gray">
                        Registra y consulta los encargados asociados a tu empresa.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setModalAbierto(true)}
                    className="bg-main-green hover:bg-soft-green text-white-main font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Agregar Encargado
                </button>
            </div>

            <div className="bg-white-main rounded-xl shadow-sm border border-light-gray overflow-hidden">
                {cargando ? (
                    <div className="p-6">
                        <p className="text-institucional-blue font-semibold animate-pulse">
                            Cargando encargados...
                        </p>
                    </div>
                ) : encargados.length === 0 ? (
                    <div className="p-6">
                        <p className="text-sm text-medium-gray">
                            Todavía no hay encargados registrados para esta empresa.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-light-gray">
                        {encargados.map((encargado) => (
                            <div
                                key={encargado.id_usuario}
                                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <UserCircle size={42} className="text-secondary-blue" />

                                    <div>
                                        <p className="font-bold text-dark-gray">
                                            {encargado.usuario?.nombre}{' '}
                                            {encargado.usuario?.apellido}
                                        </p>

                                        <p className="text-sm text-medium-gray flex items-center gap-1">
                                            <Mail size={14} />
                                            {encargado.usuario?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-dark-gray">
                                    <p className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-main-green" />
                                        {encargado.cargo}
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <Phone size={16} className="text-main-green" />
                                        {encargado.telefono}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EncargadoModal
                abierto={modalAbierto}
                cargando={guardando}
                onClose={() => setModalAbierto(false)}
                onSubmit={handleCrearEncargado}
            />
        </div>
    );
};

interface EncargadoModalProps {
    abierto: boolean;
    cargando: boolean;
    onClose: () => void;
    onSubmit: (payload: EncargadoPasantePayload) => void;
}

const EncargadoModal: React.FC<EncargadoModalProps> = ({
    abierto,
    cargando,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<EncargadoPasantePayload>({
        nombre: '',
        apellido: '',
        email: '',
        contrasena: '',
        telefono: '',
        cargo: '',
    });

    const [errores, setErrores] = useState<
        Partial<Record<keyof EncargadoPasantePayload, string>>
    >({});

    if (!abierto) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const nuevosErrores: Partial<
            Record<keyof EncargadoPasantePayload, string>
        > = {};

        if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
        if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio.';

        if (!formData.email.trim()) {
            nuevosErrores.email = 'El correo es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nuevosErrores.email = 'Ingresa un correo válido.';
        }

        if (!formData.contrasena.trim()) {
            nuevosErrores.contrasena = 'La contraseña es obligatoria.';
        } else if (formData.contrasena.length < 6) {
            nuevosErrores.contrasena = 'Mínimo 6 caracteres.';
        }

        if (!formData.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio.';
        if (!formData.cargo.trim()) nuevosErrores.cargo = 'El cargo es obligatorio.';

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        onSubmit({
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim().toLowerCase(),
            contrasena: formData.contrasena,
            telefono: formData.telefono.trim(),
            cargo: formData.cargo.trim(),
        });
    };

    const inputClass = (campo: keyof EncargadoPasantePayload) => {
        return `w-full px-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white-main w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-institucional-blue text-white-main px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-montserrat font-bold text-xl">
                            Agregar Encargado de Pasante
                        </h3>
                        <p className="text-sm opacity-80">
                            Se asignará automáticamente a tu empresa.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Campo label="Nombre" error={errores.nombre}>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={inputClass('nombre')}
                                placeholder="Ej: Luis"
                            />
                        </Campo>

                        <Campo label="Apellido" error={errores.apellido}>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className={inputClass('apellido')}
                                placeholder="Ej: Mamani"
                            />
                        </Campo>
                    </div>

                    <Campo label="Correo electrónico" error={errores.email}>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClass('email')}
                            placeholder="encargado@correo.com"
                        />
                    </Campo>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Campo label="Teléfono" error={errores.telefono}>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={inputClass('telefono')}
                                placeholder="Ej: 71234567"
                            />
                        </Campo>

                        <Campo label="Cargo" error={errores.cargo}>
                            <input
                                type="text"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleChange}
                                className={inputClass('cargo')}
                                placeholder="Ej: Encargado de Pasantes"
                            />
                        </Campo>
                    </div>

                    <Campo label="Contraseña inicial" error={errores.contrasena}>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            className={inputClass('contrasena')}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </Campo>

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
                            {cargando ? 'Guardando...' : 'Registrar Encargado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CampoProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const Campo: React.FC<CampoProps> = ({ label, error, children }) => {
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