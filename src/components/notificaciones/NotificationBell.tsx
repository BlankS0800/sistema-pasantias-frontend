import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../../services/notificacionService';

import type { Notificacion } from '../../services/notificacionService';

interface Props {
  onNavigate?: (url: string | null | undefined) => void;
}

export const NotificationBell: React.FC<Props> = ({ onNavigate }) => {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarNotificaciones();

    const interval = window.setInterval(() => {
      cargarNotificaciones();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      const data = await listarNotificaciones();

      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.no_leidas || 0);
    } catch (error) {
      console.error('Error cargando notificaciones', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirCerrar = async () => {
    setAbierto((prev) => !prev);

    if (!abierto) {
      await cargarNotificaciones();
    }
  };

  const marcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotificaciones((prev) =>
        prev.map((item) => ({
          ...item,
          leida: true,
        }))
      );
      setNoLeidas(0);
    } catch (error) {
      console.error('Error marcando notificaciones', error);
    }
  };

  const abrirNotificacion = async (notificacion: Notificacion) => {
    try {
      if (!notificacion.leida) {
        await marcarNotificacionLeida(notificacion.id_notificacion);
      }

      setNotificaciones((prev) =>
        prev.map((item) =>
          item.id_notificacion === notificacion.id_notificacion
            ? { ...item, leida: true }
            : item
        )
      );

      setNoLeidas((prev) => Math.max(prev - 1, 0));
      setAbierto(false);

      if (onNavigate) {
        onNavigate(notificacion.url);
      }
    } catch (error) {
      console.error('Error abriendo notificación', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-BO');
    } catch {
      return fecha;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={abrirCerrar}
        className="relative p-2 rounded-xl hover:bg-light-gray transition-colors"
      >
        <Bell size={22} className="text-institucional-blue" />

        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white-main text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white-main border border-light-gray rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 bg-institucional-blue text-white-main flex justify-between items-center">
            <div>
              <p className="font-bold">Notificaciones</p>
              <p className="text-xs opacity-90">
                {noLeidas} sin leer
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="hover:text-red-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-3 border-b border-light-gray flex justify-end">
            <button
              type="button"
              onClick={marcarTodas}
              className="text-xs font-bold text-institucional-blue hover:underline flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Marcar todas como leídas
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando && notificaciones.length === 0 ? (
              <p className="text-sm text-medium-gray p-5 text-center">
                Cargando...
              </p>
            ) : notificaciones.length === 0 ? (
              <p className="text-sm text-medium-gray p-5 text-center">
                No tienes notificaciones.
              </p>
            ) : (
              notificaciones.map((notificacion) => (
                <button
                  key={notificacion.id_notificacion}
                  type="button"
                  onClick={() => abrirNotificacion(notificacion)}
                  className={`w-full text-left p-4 border-b border-light-gray hover:bg-light-gray/40 transition-colors ${
                    !notificacion.leida ? 'bg-institucional-blue/5' : 'bg-white-main'
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-bold text-dark-gray">
                      {notificacion.titulo}
                    </p>

                    {!notificacion.leida && (
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-1 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-medium-gray mt-1">
                    {notificacion.mensaje}
                  </p>

                  <p className="text-[10px] text-medium-gray mt-2">
                    {formatearFecha(notificacion.fecha)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
