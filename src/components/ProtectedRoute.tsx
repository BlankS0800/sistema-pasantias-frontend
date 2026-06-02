import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUsuario, limpiarSesion } from '../api/api';
import { me } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    rolPermitido?: 'GER_EMP' | 'PAS' | 'ENC_PAS' | 'TUT' | 'TUTOR' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    rolPermitido,
}) => {
    const [verificando, setVerificando] = useState(true);
    const [autenticado, setAutenticado] = useState(false);

    useEffect(() => {
        const validarSesion = async () => {
            const token = getToken();
            const usuario = getUsuario();

            if (!token || !usuario) {
                limpiarSesion();
                setAutenticado(false);
                setVerificando(false);
                return;
            }

            if (rolPermitido && usuario?.rol?.abreviacion !== rolPermitido) {
                setAutenticado(false);
                setVerificando(false);
                return;
            }

            try {
                await me();
                setAutenticado(true);
            } catch (error) {
                limpiarSesion();
                setAutenticado(false);
            } finally {
                setVerificando(false);
            }
        };

        validarSesion();
    }, [rolPermitido]);

    if (verificando) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Verificando sesión...</p>
            </div>
        );
    }

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    return children;
};