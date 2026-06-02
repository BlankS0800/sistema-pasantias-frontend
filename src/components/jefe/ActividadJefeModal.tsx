import React, { useEffect, useState } from 'react';
import { AlertCircle, Save, UserCircle, X } from 'lucide-react';

import { listarPasantesAprobadosPorPasantia } from '../../services/actividadJefeService';

import type {
  ActividadColor,
  ActividadJefe,
  ActividadPayload,
  PasanteAprobado,
  PasantiaAsignada,
} from '../../services/actividadJefeService';

interface ActividadJefeModalProps {
  abierto: boolean;
  modo: 'crear' | 'editar';
  actividadInicial: ActividadJefe | null;
  pasantias: PasantiaAsignada[];
  idPasantiaSeleccionada: number;
  fechaSeleccionada: string | null;
  cargando: boolean;
  onClose: () => void;
  onSubmit: (payload: ActividadPayload) => void;
}

const colores: Array<{ value: ActividadColor; label: string; clase: string }> = [
  { value: 'verde', label: 'Verde', clase: 'bg-main-green' },
  { value: 'azul', label: 'Azul', clase: 'bg-institucional-blue' },
  { value: 'morado', label: 'Morado', clase: 'bg-purple-600' },
  { value: 'naranja', label: 'Naranja', clase: 'bg-orange-500' },
  { value: 'rojo', label: 'Rojo', clase: 'bg-red-600' },
];

export const ActividadJefeModal: React.FC<ActividadJefeModalProps> = ({
  abierto,
  modo,
  actividadInicial,
  pasantias,
  idPasantiaSeleccionada,
  fechaSeleccionada,
  cargando,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ActividadPayload>({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_pasantia: idPasantiaSeleccionada,
    id_pasante: null,
    color: 'verde',
  });

  const [pasantes, setPasantes] = useState<PasanteAprobado[]>([]);
  const [cargandoPasantes, setCargandoPasantes] = useState(false);
  const [errorPasantes, setErrorPasantes] = useState('');

  useEffect(() => {
    if (!abierto) return;

    if (modo === 'editar' && actividadInicial) {
      setForm({
        titulo: actividadInicial.titulo || '',
        descripcion: actividadInicial.descripcion || '',
        fecha_inicio: actividadInicial.fecha_inicio?.substring(0, 10) || '',
        fecha_fin: actividadInicial.fecha_fin?.substring(0, 10) || '',
        id_pasantia: actividadInicial.id_pasantia,
        id_pasante: actividadInicial.id_pasante || null,
        color: actividadInicial.color || 'verde',
      });
      return;
    }

    setForm({
      titulo: '',
      descripcion: '',
      fecha_inicio: fechaSeleccionada || '',
      fecha_fin: fechaSeleccionada || '',
      id_pasantia: idPasantiaSeleccionada,
      id_pasante: null,
      color: 'verde',
    });
  }, [abierto, modo, actividadInicial, fechaSeleccionada, idPasantiaSeleccionada]);

  useEffect(() => {
    if (!abierto || !form.id_pasantia) return;

    cargarPasantes(form.id_pasantia);
  }, [abierto, form.id_pasantia]);

  const cargarPasantes = async (id_pasantia: number) => {
    setCargandoPasantes(true);
    setErrorPasantes('');

    try {
      const data = await listarPasantesAprobadosPorPasantia(id_pasantia);
      setPasantes(data.pasantes || []);
    } catch (error: any) {
      setPasantes([]);
      setErrorPasantes(error.message || 'No se pudieron cargar los pasantes aprobados.');
    } finally {
      setCargandoPasantes(false);
    }
  };

  const nombrePasante = (pasante: PasanteAprobado) => {
    const usuario = pasante.usuario;

    if (!usuario) return `Pasante #${pasante.id_pasante}`;

    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || `Pasante #${pasante.id_pasante}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...form,
      id_pasante: form.id_pasante || null,
    });
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-light-gray bg-institucional-blue text-white-main flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">
              {modo === 'crear' ? 'Crear actividad' : 'Editar actividad'}
            </h3>
            <p className="text-xs opacity-90">
              Puedes crearla sin pasante y asignarlo después.
            </p>
          </div>

          <button type="button" onClick={onClose} className="hover:text-red-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Pasantía
            </label>
            <select
              value={form.id_pasantia}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_pasantia: Number(e.target.value),
                  id_pasante: null,
                })
              }
              className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none"
            >
              {pasantias.map((pasantia) => (
                <option key={pasantia.id_pasantia} value={pasantia.id_pasantia}>
                  {pasantia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Pasante asignado
            </label>

            <select
              value={form.id_pasante || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_pasante: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none"
              disabled={cargandoPasantes}
            >
              <option value="">Sin asignar por ahora</option>
              {pasantes.map((pasante) => (
                <option key={pasante.id_pasante} value={pasante.id_pasante}>
                  {nombrePasante(pasante)} {pasante.reg_universitario ? `- ${pasante.reg_universitario}` : ''}
                </option>
              ))}
            </select>

            {cargandoPasantes && (
              <p className="text-xs text-medium-gray mt-2">Cargando pasantes aprobados...</p>
            )}

            {!cargandoPasantes && pasantes.length === 0 && (
              <div className="mt-2 flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-3 py-2 text-xs">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>
                  Todavía no hay pasantes aprobados en esta pasantía. Puedes guardar la actividad sin asignar y editarla después.
                </span>
              </div>
            )}

            {errorPasantes && (
              <p className="text-xs text-red-600 mt-2">{errorPasantes}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Título
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none"
              placeholder="Ej: Revisión de inventario"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="mt-2 w-full px-4 py-3 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none min-h-[110px] resize-y"
              placeholder="Describe qué debe realizar el pasante..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
                Fecha inicio
              </label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fecha_inicio: e.target.value,
                    fecha_fin: form.fecha_fin || e.target.value,
                  })
                }
                className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
                Fecha fin
              </label>
              <input
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Color en calendario
            </label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {colores.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: color.value })}
                  className={`border rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    form.color === color.value
                      ? 'border-institucional-blue ring-2 ring-institucional-blue/20'
                      : 'border-light-gray hover:border-medium-gray'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${color.clase}`} />
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {form.id_pasante && (
            <div className="bg-main-green/10 border border-main-green/30 rounded-xl px-4 py-3 text-sm text-main-green flex gap-2 items-center">
              <UserCircle size={18} />
              Esta actividad quedará asignada al pasante seleccionado.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-light-gray">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-bold text-dark-gray bg-light-gray hover:bg-medium-gray/20"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="bg-main-green hover:bg-soft-green text-white-main px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={17} />
              {cargando ? 'Guardando...' : modo === 'crear' ? 'Guardar actividad' : 'Actualizar actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
