import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit,
  KeyRound,
  LogOut,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { logout } from '../services/authService';
import {
  actualizarUsuarioAdmin,
  eliminarUsuarioAdmin,
  listarRolesAdmin,
  listarUsuariosAdmin,
  obtenerResumenAdmin,
  restablecerPasswordAdmin,
} from '../services/adminService';

import type {
  ActualizarUsuarioPayload,
  ResumenAdmin,
  RolAdmin,
  UsuarioAdmin,
} from '../services/adminService';

type Mensaje = {
  tipo: 'exito' | 'error' | 'info';
  texto: string;
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<RolAdmin[]>([]);
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null);

  const [buscar, setBuscar] = useState('');
  const [idRolFiltro, setIdRolFiltro] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null);
  const [formUsuario, setFormUsuario] = useState<ActualizarUsuarioPayload>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    id_rol: 0,
  });

  const [usuarioPassword, setUsuarioPassword] = useState<UsuarioAdmin | null>(null);
  const [nuevoPassword, setNuevoPassword] = useState('');

  const usuarioActual = useMemo(() => {
    const guardado = localStorage.getItem('usuario');

    if (!guardado) return null;

    try {
      return JSON.parse(guardado);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setMensaje(null);

    try {
      const [resumenData, rolesData, usuariosData] = await Promise.all([
        obtenerResumenAdmin(),
        listarRolesAdmin(),
        listarUsuariosAdmin(),
      ]);

      setResumen(resumenData.resumen);
      setRoles(rolesData.roles || []);
      setUsuarios(usuariosData.usuarios || []);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron cargar los datos administrativos.',
      });
    } finally {
      setCargando(false);
    }
  };

  const buscarUsuarios = async () => {
    setCargando(true);
    setMensaje(null);

    try {
      const data = await listarUsuariosAdmin({
        buscar,
        id_rol: idRolFiltro,
      });

      setUsuarios(data.usuarios || []);
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudieron buscar usuarios.',
      });
    } finally {
      setCargando(false);
    }
  };

  const abrirEditar = (usuario: UsuarioAdmin) => {
    setUsuarioEditando(usuario);

    setFormUsuario({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      id_rol: usuario.id_rol,
    });
  };

  const guardarUsuario = async () => {
    if (!usuarioEditando) return;

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await actualizarUsuarioAdmin(
        usuarioEditando.id_usuario,
        formUsuario
      );

      setUsuarios((prev) =>
        prev.map((usuario) =>
          usuario.id_usuario === data.usuario.id_usuario ? data.usuario : usuario
        )
      );

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Usuario actualizado correctamente.',
      });

      setUsuarioEditando(null);
      await cargarDatos();
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo actualizar el usuario.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const guardarPassword = async () => {
    if (!usuarioPassword) return;

    if (nuevoPassword.trim().length < 6) {
      setMensaje({
        tipo: 'error',
        texto: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await restablecerPasswordAdmin(
        usuarioPassword.id_usuario,
        nuevoPassword
      );

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Contraseña restablecida correctamente.',
      });

      setUsuarioPassword(null);
      setNuevoPassword('');
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto: error.message || 'No se pudo restablecer la contraseña.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (usuario: UsuarioAdmin) => {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción puede fallar si el usuario tiene registros relacionados.`
    );

    if (!confirmado) return;

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await eliminarUsuarioAdmin(usuario.id_usuario);

      setUsuarios((prev) =>
        prev.filter((item) => item.id_usuario !== usuario.id_usuario)
      );

      setMensaje({
        tipo: 'exito',
        texto: data.message || 'Usuario eliminado correctamente.',
      });

      await cargarDatos();
    } catch (error: any) {
      setMensaje({
        tipo: 'error',
        texto:
          error.message ||
          'No se pudo eliminar el usuario. Puede tener registros relacionados.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const claseRol = (abreviacion?: string) => {
    if (abreviacion === 'ADMIN') return 'bg-red-100 text-red-700';
    if (abreviacion === 'GER_EMP') return 'bg-institucional-blue/10 text-institucional-blue';
    if (abreviacion === 'ENC_PAS') return 'bg-orange-100 text-orange-700';
    if (abreviacion === 'PAS') return 'bg-main-green/10 text-main-green';
    if (abreviacion === 'TUT' || abreviacion === 'TUTOR') return 'bg-purple-100 text-purple-700';

    return 'bg-light-gray text-dark-gray';
  };

  return (
    <div className="min-h-screen bg-light-gray font-poppins">
      <header className="bg-institucional-blue text-white-main px-6 md:px-10 py-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white-main/15 border border-white-main/20 flex items-center justify-center">
              <ShieldCheck size={31} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-white-main/70 font-bold">
                Panel Maestro
              </p>

              <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
                Super Administrador
              </h1>

              <p className="text-sm text-white-main/75 mt-1">
                {usuarioActual?.nombre} {usuarioActual?.apellido} ·{' '}
                {usuarioActual?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white-main px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 w-fit"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6 md:p-10 space-y-6">
        {mensaje && (
          <div
            className={`rounded-xl border px-5 py-4 text-sm font-semibold flex justify-between items-center ${
              mensaje.tipo === 'exito'
                ? 'bg-main-green/10 border-main-green/30 text-main-green'
                : mensaje.tipo === 'error'
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue'
            }`}
          >
            <span>{mensaje.texto}</span>

            <button
              type="button"
              onClick={() => setMensaje(null)}
              className="font-bold opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <TarjetaResumen
            titulo="Usuarios"
            valor={resumen?.usuarios_total ?? 0}
            icono={<Users size={24} />}
          />

          <TarjetaResumen
            titulo="Roles"
            valor={resumen?.roles_total ?? 0}
            icono={<ShieldCheck size={24} />}
          />

          <TarjetaResumen
            titulo="Pasantes"
            valor={resumen?.pasantes_total ?? 0}
            icono={<UserCog size={24} />}
          />

          <TarjetaResumen
            titulo="Gerentes"
            valor={resumen?.gerentes_total ?? 0}
            icono={<UserCog size={24} />}
          />

          <TarjetaResumen
            titulo="Jefes"
            valor={resumen?.jefes_total ?? 0}
            icono={<UserCog size={24} />}
          />

          <TarjetaResumen
            titulo="Tutores"
            valor={resumen?.tutores_total ?? 0}
            icono={<UserCog size={24} />}
          />
        </section>

        <section className="bg-white-main rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="p-6 border-b border-light-gray flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-institucional-blue">
                Gestión de usuarios
              </h2>

              <p className="text-sm text-medium-gray">
                Puedes editar datos, cambiar roles, restablecer contraseñas o eliminar usuarios.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-medium-gray"
                  size={18}
                />

                <input
                  type="text"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="pl-10 pr-4 py-2 bg-light-gray/40 border border-light-gray rounded-xl outline-none focus:border-main-green w-full md:w-64"
                />
              </div>

              <select
                value={idRolFiltro}
                onChange={(e) => setIdRolFiltro(e.target.value)}
                className="px-4 py-2 bg-light-gray/40 border border-light-gray rounded-xl outline-none focus:border-main-green"
              >
                <option value="">Todos los roles</option>

                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.descripcion}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={buscarUsuarios}
                className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 justify-center"
              >
                <Search size={17} />
                Buscar
              </button>

              <button
                type="button"
                onClick={cargarDatos}
                className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 justify-center"
              >
                <RefreshCw size={17} />
                Actualizar
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="p-10 text-center text-institucional-blue font-semibold animate-pulse">
              Cargando usuarios...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-light-gray/40 text-dark-gray uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Teléfono</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-gray">
                  {usuarios.map((usuario) => (
                    <tr
                      key={usuario.id_usuario}
                      className="hover:bg-light-gray/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-dark-gray">
                          {usuario.nombre} {usuario.apellido}
                        </p>

                        <p className="text-xs text-medium-gray">
                          ID: {usuario.id_usuario}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-dark-gray">
                        {usuario.email}
                      </td>

                      <td className="px-6 py-4 text-medium-gray">
                        {usuario.telefono || 'Sin teléfono'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${claseRol(
                            usuario.rol?.abreviacion
                          )}`}
                        >
                          {usuario.rol?.descripcion || 'Sin rol'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEditar(usuario)}
                            className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setUsuarioPassword(usuario);
                              setNuevoPassword('');
                            }}
                            className="bg-main-green hover:bg-soft-green text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <KeyRound size={14} />
                            Password
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarUsuario(usuario)}
                            disabled={guardando}
                            className="bg-red-600 hover:bg-red-700 text-white-main px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {usuarios.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-medium-gray"
                      >
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl p-5 flex gap-3">
          <AlertCircle size={22} className="shrink-0 mt-0.5" />

          <p className="text-sm">
            Recomendación: cuando el sistema esté más avanzado, es mejor
            desactivar usuarios en lugar de eliminarlos, para no perder historial
            de pasantías, boletas, informes y actividades.
          </p>
        </section>
      </main>

      {usuarioEditando && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <h3 className="text-lg font-bold">Editar usuario</h3>

              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoFormulario
                  label="Nombre"
                  value={formUsuario.nombre}
                  onChange={(value) =>
                    setFormUsuario((prev) => ({ ...prev, nombre: value }))
                  }
                />

                <CampoFormulario
                  label="Apellido"
                  value={formUsuario.apellido}
                  onChange={(value) =>
                    setFormUsuario((prev) => ({ ...prev, apellido: value }))
                  }
                />

                <CampoFormulario
                  label="Email"
                  value={formUsuario.email}
                  onChange={(value) =>
                    setFormUsuario((prev) => ({ ...prev, email: value }))
                  }
                />

                <CampoFormulario
                  label="Teléfono"
                  value={formUsuario.telefono || ''}
                  onChange={(value) =>
                    setFormUsuario((prev) => ({ ...prev, telefono: value }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-dark-gray uppercase">
                  Rol
                </label>

                <select
                  value={formUsuario.id_rol}
                  onChange={(e) =>
                    setFormUsuario((prev) => ({
                      ...prev,
                      id_rol: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green focus:bg-white-main outline-none"
                >
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.descripcion} ({rol.abreviacion})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-light-gray flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarUsuario}
                disabled={guardando}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioPassword && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-institucional-blue text-white-main flex justify-between items-center">
              <h3 className="text-lg font-bold">Restablecer contraseña</h3>

              <button
                type="button"
                onClick={() => setUsuarioPassword(null)}
                className="hover:text-red-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-medium-gray">
                Usuario:{' '}
                <strong>
                  {usuarioPassword.nombre} {usuarioPassword.apellido}
                </strong>
              </p>

              <div>
                <label className="text-xs font-bold text-dark-gray uppercase">
                  Nueva contraseña
                </label>

                <input
                  type="text"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  placeholder="Ej: Usuario123"
                  className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green focus:bg-white-main outline-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-light-gray flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUsuarioPassword(null)}
                className="bg-light-gray text-dark-gray px-5 py-2 rounded-lg text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarPassword}
                disabled={guardando}
                className="bg-main-green hover:bg-soft-green text-white-main px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <KeyRound size={16} />
                {guardando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TarjetaResumen: React.FC<{
  titulo: string;
  valor: number;
  icono: React.ReactNode;
}> = ({ titulo, valor, icono }) => {
  return (
    <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-5">
      <div className="w-12 h-12 rounded-xl bg-institucional-blue/10 text-institucional-blue flex items-center justify-center">
        {icono}
      </div>

      <p className="text-sm text-medium-gray font-bold mt-4">
        {titulo}
      </p>

      <p className="text-3xl font-extrabold text-dark-gray">
        {valor}
      </p>
    </div>
  );
};

const CampoFormulario: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="text-xs font-bold text-dark-gray uppercase">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-2 bg-light-gray/30 border border-medium-gray/20 rounded-lg focus:border-main-green focus:bg-white-main outline-none"
      />
    </div>
  );
};
