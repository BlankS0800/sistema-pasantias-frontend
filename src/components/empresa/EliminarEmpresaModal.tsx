import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface EliminarEmpresaModalProps {
    abierto: boolean;
    cargando?: boolean;
    nombreEmpresa?: string;
    onClose: () => void;
    onConfirmar: () => void;
}

export const EliminarEmpresaModal: React.FC<EliminarEmpresaModalProps> = ({
    abierto,
    cargando = false,
    nombreEmpresa,
    onClose,
    onConfirmar,
}) => {
    const [confirmacion, setConfirmacion] = useState('');

    if (!abierto) return null;

    const puedeEliminar = confirmacion.trim().toUpperCase() === 'ELIMINAR';

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="bg-white-main w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-red-600 text-white-main px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={28} />
                        <div>
                            <h3 className="font-montserrat font-bold text-xl">
                                Confirmar eliminación
                            </h3>
                            <p className="text-sm opacity-90">
                                Esta acción necesita doble confirmación.
                            </p>
                        </div>
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

                <div className="p-6 space-y-5">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        Vas a eliminar la empresa{' '}
                        <strong>{nombreEmpresa || 'registrada'}</strong>. Para confirmar,
                        escribe <strong>ELIMINAR</strong> en el campo inferior.
                    </div>

                    <input
                        type="text"
                        value={confirmacion}
                        onChange={(e) => setConfirmacion(e.target.value)}
                        placeholder="Escribe ELIMINAR"
                        className="w-full px-4 py-3 bg-light-gray/40 border border-medium-gray/20 rounded-xl focus:border-red-500 focus:bg-white-main outline-none transition-colors"
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={cargando}
                            className="w-1/3 bg-light-gray hover:bg-medium-gray/20 text-dark-gray font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={onConfirmar}
                            disabled={!puedeEliminar || cargando}
                            className="w-2/3 bg-red-600 hover:bg-red-700 text-white-main font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={19} />
                            {cargando ? 'Eliminando...' : 'Eliminar definitivamente'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};