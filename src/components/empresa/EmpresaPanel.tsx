import React, { useEffect, useState } from 'react';
import {
    Building2,
    CheckCircle2,
    Edit,
    MapPin,
    Phone,
    FileText,
    Plus,
    Trash2,
    AlertCircle,
} from 'lucide-react';

import {
    actualizarMiEmpresa,
    eliminarMiEmpresa,
    mostrarMiEmpresa,
    registrarMiEmpresa,
} from '../../services/empresaService';

import type { Empresa } from '../../services/empresaService';

import { EmpresaFormModal } from './EmpresaFormModal';
import { EliminarEmpresaModal } from './EliminarEmpresaModal';
import { JefesPasantesPanel } from './JefesPasantesPanel';

interface Aviso {
    tipo: 'success' | 'error' | 'warning';
    mensaje: string;
}

interface EmpresaPanelProps {
    puedeGestionarEmpresa: boolean;
    puedeGestionarEncargados: boolean;
}

export const EmpresaPanel: React.FC<EmpresaPanelProps> = ({
    puedeGestionarEmpresa,
    puedeGestionarEncargados,
}) => {
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [modoFormulario, setModoFormulario] = useState<'crear' | 'editar'>('crear');

    const [aviso, setAviso] = useState<Aviso | null>(null);

    const cargarEmpresa = async () => {
        setCargando(true);
        setAviso(null);

        try {
            const data = await mostrarMiEmpresa();
            setEmpresa(data.empresa);
        } catch (error: any) {
            if (error?.empresa === null) {
                setEmpresa(null);
            } else {
                setAviso({
                    tipo: 'error',
                    mensaje: error.message || 'No se pudo cargar la empresa.',
                });
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmpresa();
    }, []);

    const abrirRegistro = () => {
        if (!puedeGestionarEmpresa) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permiso para registrar una empresa.',
            });
            return;
        }

        setModoFormulario('crear');
        setModalFormulario(true);
    };

    const abrirEdicion = () => {
        if (!puedeGestionarEmpresa) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permiso para editar la empresa.',
            });
            return;
        }

        setModoFormulario('editar');
        setModalFormulario(true);
    };

    const abrirEliminar = () => {
        if (!puedeGestionarEmpresa) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permiso para eliminar la empresa.',
            });
            return;
        }

        setModalEliminar(true);
    };

    const handleSubmitEmpresa = async (datos: Empresa) => {
        if (!puedeGestionarEmpresa) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permiso para guardar cambios de la empresa.',
            });
            return;
        }

        setGuardando(true);
        setAviso(null);

        try {
            const data =
                modoFormulario === 'crear'
                    ? await registrarMiEmpresa(datos)
                    : await actualizarMiEmpresa(datos);

            setEmpresa(data.empresa);
            setModalFormulario(false);

            setAviso({
                tipo: 'success',
                mensaje:
                    modoFormulario === 'crear'
                        ? 'Empresa registrada correctamente.'
                        : 'Empresa actualizada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudo guardar la empresa. Revisa los datos ingresados.',
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminarEmpresa = async () => {
        if (!puedeGestionarEmpresa) {
            setAviso({
                tipo: 'warning',
                mensaje: 'No tienes permiso para eliminar la empresa.',
            });
            return;
        }

        setEliminando(true);
        setAviso(null);

        try {
            await eliminarMiEmpresa();

            setEmpresa(null);
            setModalEliminar(false);

            setAviso({
                tipo: 'success',
                mensaje: 'Empresa eliminada correctamente.',
            });
        } catch (error: any) {
            setAviso({
                tipo: 'error',
                mensaje:
                    error.message ||
                    'No se pudo eliminar la empresa. Verifica el controlador.',
            });
        } finally {
            setEliminando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-institucional-blue font-semibold animate-pulse">
                    Cargando datos de la empresa...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {aviso && <AvisoTailwind aviso={aviso} />}

            {!empresa ? (
                <div className="space-y-6">
                    <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                        Mi Empresa
                    </h2>

                    <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="text-medium-gray" size={34} />

                            <div>
                                <h3 className="text-lg font-bold text-dark-gray">
                                    Aún no tienes una empresa registrada
                                </h3>

                                <p className="text-sm text-medium-gray">
                                    {puedeGestionarEmpresa
                                        ? 'Registra los datos de tu empresa para poder publicar pasantías.'
                                        : 'Tu usuario todavía no tiene una empresa asignada. Contacta al gerente de empresa.'}
                                </p>
                            </div>
                        </div>

                        {puedeGestionarEmpresa ? (
                            <button
                                type="button"
                                onClick={abrirRegistro}
                                className="mt-4 bg-main-green hover:bg-soft-green text-white-main font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Registrar Empresa
                            </button>
                        ) : (
                            <div className="mt-4 bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm">
                                No tienes permisos para registrar una empresa desde este usuario.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
                            Mi Empresa
                        </h2>

                        {puedeGestionarEmpresa && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={abrirEdicion}
                                    className="bg-secondary-blue hover:bg-institucional-blue text-white-main font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Edit size={18} />
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={abrirEliminar}
                                    className="bg-red-600 hover:bg-red-700 text-white-main font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="text-main-green" size={32} />

                            <div>
                                <h3 className="text-lg font-bold text-dark-gray">
                                    Empresa activada
                                </h3>

                                <p className="text-sm text-medium-gray">
                                    Los datos de la empresa están registrados correctamente.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-gray mt-6">
                            <p>
                                <strong>Nombre:</strong> {empresa.nombre}
                            </p>

                            <p>
                                <strong>NIT:</strong> {empresa.nit}
                            </p>

                            <p>
                                <strong>Teléfono:</strong> {empresa.telefono}
                            </p>

                            <p>
                                <strong>Dirección:</strong> {empresa.direccion}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TarjetaEmpresa
                            titulo="Estado"
                            valor="Activa"
                            icono={<CheckCircle2 className="text-main-green w-12 h-12" />}
                        />

                        <TarjetaEmpresa
                            titulo="Identificación"
                            valor={empresa.nit}
                            icono={<FileText className="text-light-gray w-12 h-12" />}
                        />

                        <TarjetaEmpresa
                            titulo="Contacto"
                            valor={empresa.telefono}
                            icono={<Phone className="text-light-gray w-12 h-12" />}
                        />
                    </div>

                    <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray flex items-start gap-3">
                        <MapPin className="text-secondary-blue mt-1" size={24} />

                        <div>
                            <p className="text-sm text-medium-gray font-semibold">
                                Dirección registrada
                            </p>

                            <p className="text-dark-gray font-medium mt-1">
                                {empresa.direccion}
                            </p>
                        </div>
                    </div>

                    {puedeGestionarEncargados && (
                        <JefesPasantesPanel puedeGestionar={puedeGestionarEncargados} />
                    )}

                    {!puedeGestionarEmpresa && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                            Estás visualizando la empresa en modo consulta. No puedes editar ni eliminar estos datos.
                        </div>
                    )}
                </div>
            )}

            {puedeGestionarEmpresa && (
                <EmpresaFormModal
                    abierto={modalFormulario}
                    modo={modoFormulario}
                    empresaInicial={empresa}
                    cargando={guardando}
                    onClose={() => setModalFormulario(false)}
                    onSubmit={handleSubmitEmpresa}
                />
            )}

            {puedeGestionarEmpresa && (
                <EliminarEmpresaModal
                    abierto={modalEliminar}
                    cargando={eliminando}
                    nombreEmpresa={empresa?.nombre}
                    onClose={() => setModalEliminar(false)}
                    onConfirmar={handleEliminarEmpresa}
                />
            )}
        </div>
    );
};

interface TarjetaEmpresaProps {
    titulo: string;
    valor: string;
    icono: React.ReactNode;
}

const TarjetaEmpresa: React.FC<TarjetaEmpresaProps> = ({
    titulo,
    valor,
    icono,
}) => {
    return (
        <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray flex flex-col justify-between">
            <div>
                <p className="text-sm text-medium-gray font-semibold">
                    {titulo}
                </p>

                <p className="text-xl font-bold text-institucional-blue mt-2">
                    {valor}
                </p>
            </div>

            <div className="self-end mt-2">{icono}</div>
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