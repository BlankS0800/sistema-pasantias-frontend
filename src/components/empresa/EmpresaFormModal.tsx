import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, FileText, X, Save } from 'lucide-react';
import type { Empresa } from '../../services/empresaService';

interface EmpresaFormModalProps {
    abierto: boolean;
    modo: 'crear' | 'editar';
    empresaInicial?: Empresa | null;
    cargando?: boolean;
    onClose: () => void;
    onSubmit: (empresa: Empresa) => void;
}

type EmpresaErrors = Partial<Record<keyof Empresa, string>>;

export const EmpresaFormModal: React.FC<EmpresaFormModalProps> = ({
    abierto,
    modo,
    empresaInicial,
    cargando = false,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<Empresa>({
        nombre: '',
        direccion: '',
        telefono: '',
        nit: '',
    });

    const [errores, setErrores] = useState<EmpresaErrors>({});

    useEffect(() => {
        if (abierto) {
            setFormData({
                nombre: empresaInicial?.nombre || '',
                direccion: empresaInicial?.direccion || '',
                telefono: empresaInicial?.telefono || '',
                nit: empresaInicial?.nit || '',
            });
            setErrores({});
        }
    }, [abierto, empresaInicial]);

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
        const nuevosErrores: EmpresaErrors = {};

        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre de la empresa es obligatorio.';
        } else if (formData.nombre.trim().length < 3) {
            nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
        }

        if (!formData.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección es obligatoria.';
        }

        if (!formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio.';
        } else if (!/^[0-9+\-\s]{7,20}$/.test(formData.telefono)) {
            nuevosErrores.telefono = 'Ingresa un teléfono válido.';
        }

        if (!formData.nit.trim()) {
            nuevosErrores.nit = 'El NIT es obligatorio.';
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        onSubmit({
            nombre: formData.nombre.trim(),
            direccion: formData.direccion.trim(),
            telefono: formData.telefono.trim(),
            nit: formData.nit.trim(),
        });
    };

    const inputClass = (campo: keyof Empresa) => {
        return `w-full pl-10 pr-4 py-3 bg-light-gray/40 border rounded-xl focus:bg-white-main outline-none transition-colors ${errores[campo]
                ? 'border-red-400 focus:border-red-500'
                : 'border-medium-gray/20 focus:border-main-green'
            }`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white-main w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-institucional-blue text-white-main px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-montserrat font-bold text-xl">
                            {modo === 'crear' ? 'Registrar Empresa' : 'Editar Empresa'}
                        </h3>
                        <p className="text-sm opacity-80">
                            Completa los datos principales de la empresa.
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
                    <CampoEmpresa label="Nombre de la Empresa" error={errores.nombre}>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3.5 text-medium-gray" size={20} />
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={inputClass('nombre')}
                                placeholder="Ej: TechCorp S.R.L."
                            />
                        </div>
                    </CampoEmpresa>

                    <CampoEmpresa label="Dirección" error={errores.direccion}>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-medium-gray" size={20} />
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className={inputClass('direccion')}
                                placeholder="Ej: Av. Arce Nro. 123"
                            />
                        </div>
                    </CampoEmpresa>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CampoEmpresa label="Teléfono" error={errores.telefono}>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-medium-gray" size={20} />
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className={inputClass('telefono')}
                                    placeholder="Ej: 71234567"
                                />
                            </div>
                        </CampoEmpresa>

                        <CampoEmpresa label="NIT" error={errores.nit}>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3.5 text-medium-gray" size={20} />
                                <input
                                    type="text"
                                    name="nit"
                                    value={formData.nit}
                                    onChange={handleChange}
                                    className={inputClass('nit')}
                                    placeholder="Ej: 123456789"
                                />
                            </div>
                        </CampoEmpresa>
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
                                    ? 'Registrar Empresa'
                                    : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CampoEmpresaProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const CampoEmpresa: React.FC<CampoEmpresaProps> = ({
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