import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AtSign,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  IdCard,
  MapPin,
  GraduationCap,
  AlertCircle,
  BookUser,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

type TipoUsuario = '' | 'pasante' | 'gerente' | 'tutor';

interface RegisterFormData {
  nombre: string;
  apellido: string;
  usuario: string;
  tipo_usuario: TipoUsuario;
  correo: string;
  telefono: string;
  password: string;
  cargo: string;
  ci: string;
  registro_universitario: string;
  direccion: string;
  codigo_docente: string;
  aceptaTerminos: boolean;
}

type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;

interface Aviso {
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errores, setErrores] = useState<RegisterErrors>({});

  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: '',
    apellido: '',
    usuario: '',
    tipo_usuario: '',
    correo: '',
    telefono: '',
    password: '',
    cargo: '',
    ci: '',
    registro_universitario: '',
    direccion: '',
    codigo_docente: '',
    aceptaTerminos: false,
  });

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      tipo_usuario: '',
      correo: '',
      telefono: '',
      password: '',
      cargo: '',
      ci: '',
      registro_universitario: '',
      direccion: '',
      codigo_docente: '',
      aceptaTerminos: false,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    setErrores({
      ...errores,
      [name]: '',
    });
  };

  const validarPaso1 = () => {
    const nuevosErrores: RegisterErrors = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio.';
    } else if (formData.apellido.trim().length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres.';
    }

    if (!formData.usuario.trim()) {
      nuevosErrores.usuario = 'El usuario es obligatorio.';
    } else if (formData.usuario.trim().length < 3) {
      nuevosErrores.usuario = 'El usuario debe tener al menos 3 caracteres.';
    }

    if (!formData.tipo_usuario) {
      nuevosErrores.tipo_usuario = 'Selecciona un tipo de usuario.';
    }

    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido.';
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio.';
    } else if (!/^[0-9+\-\s]{7,20}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Ingresa un teléfono válido.';
    }

    if (!formData.password.trim()) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener mínimo 6 caracteres.';
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setAviso({
        tipo: 'warning',
        mensaje: 'Revisa los campos marcados antes de continuar.',
      });

      return false;
    }

    setAviso(null);
    return true;
  };

  const validarPaso2 = () => {
    const nuevosErrores: RegisterErrors = {};

    if (formData.tipo_usuario === 'gerente') {
      if (!formData.cargo.trim()) {
        nuevosErrores.cargo = 'El cargo es obligatorio.';
      } else if (formData.cargo.trim().length < 3) {
        nuevosErrores.cargo = 'El cargo debe tener al menos 3 caracteres.';
      }
    }

    if (formData.tipo_usuario === 'pasante') {
      if (!formData.ci.trim()) {
        nuevosErrores.ci = 'La cédula de identidad es obligatoria.';
      }

      if (!formData.registro_universitario.trim()) {
        nuevosErrores.registro_universitario =
          'El registro universitario es obligatorio.';
      }

      if (!formData.direccion.trim()) {
        nuevosErrores.direccion = 'La dirección es obligatoria.';
      } else if (formData.direccion.trim().length < 5) {
        nuevosErrores.direccion = 'La dirección debe ser más específica.';
      }
    }

    if (formData.tipo_usuario === 'tutor') {
      if (!formData.codigo_docente.trim()) {
        nuevosErrores.codigo_docente = 'El código docente es obligatorio.';
      } else if (formData.codigo_docente.trim().length < 3) {
        nuevosErrores.codigo_docente =
          'El código docente debe tener al menos 3 caracteres.';
      }
    }

    if (!formData.aceptaTerminos) {
      nuevosErrores.aceptaTerminos =
        'Debes aceptar los términos y condiciones.';
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setAviso({
        tipo: 'warning',
        mensaje: 'Completa correctamente los datos adicionales.',
      });

      return false;
    }

    setAviso(null);
    return true;
  };

  const nextStep = () => {
    if (validarPaso1()) {
      setStep(2);
    }
  };

  const volverPaso1 = () => {
    setAviso(null);
    setErrores({});
    setStep(1);
  };

  const mapearErroresLaravel = (errors: any) => {
    const nuevosErrores: RegisterErrors = {};

    Object.entries(errors).forEach(([campo, mensajes]) => {
      const mensaje = Array.isArray(mensajes)
        ? String(mensajes[0])
        : String(mensajes);

      nuevosErrores[campo as keyof RegisterFormData] = mensaje;
    });

    setErrores(nuevosErrores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarPaso2()) {
      return;
    }

    if (!API_URL) {
      setAviso({
        tipo: 'error',
        mensaje: 'No se encontró VITE_API_URL en el archivo .env del frontend.',
      });

      return;
    }

    setCargando(true);
    setAviso(null);

    const payload: any = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      correo: formData.correo.trim().toLowerCase(),
      telefono: formData.telefono.trim(),
      password: formData.password,
      tipo_usuario: formData.tipo_usuario,
    };

    if (formData.tipo_usuario === 'pasante') {
      payload.ci = formData.ci.trim();
      payload.registro_universitario =
        formData.registro_universitario.trim();
      payload.direccion = formData.direccion.trim();
    }

    if (formData.tipo_usuario === 'gerente') {
      payload.cargo = formData.cargo.trim();
    }

    if (formData.tipo_usuario === 'tutor') {
      payload.codigo_docente = formData.codigo_docente.trim();
    }
    console.log(payload)
    try {
      const response = await fetch(`${API_URL}/RegistrarUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.errors) {
          mapearErroresLaravel(data.errors);
        }

        setAviso({
          tipo: 'error',
          mensaje:
            data?.message ||
            'No se pudo completar el registro. Revisa los datos ingresados.',
        });

        return;
      }

      setAviso({
        tipo: 'success',
        mensaje: 'Usuario registrado correctamente. Ahora puedes iniciar sesión.',
      });

      limpiarFormulario();
      setErrores({});
      setStep(1);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (error) {
      setAviso({
        tipo: 'error',
        mensaje:
          'No se pudo conectar con el servidor. Verifica que Laravel esté encendido.',
      });
    } finally {
      setCargando(false);
    }
  };

  const inputClass = (campo: keyof RegisterFormData) => {
    return `w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border rounded-xl focus:bg-white-main outline-none transition-colors ${
      errores[campo]
        ? 'border-red-400 focus:border-red-500'
        : 'border-medium-gray/20 focus:border-main-green'
    }`;
  };

  const simpleInputClass = (campo: keyof RegisterFormData) => {
    return `w-full px-4 py-2.5 bg-light-gray/30 border rounded-xl focus:bg-white-main outline-none transition-colors appearance-none cursor-pointer ${
      errores[campo]
        ? 'border-red-400 focus:border-red-500'
        : 'border-medium-gray/20 focus:border-main-green'
    }`;
  };

  const textoAyudaPaso2 = () => {
    if (formData.tipo_usuario === 'gerente') {
      return 'Completa el cargo que ocuparás dentro de la empresa.';
    }

    if (formData.tipo_usuario === 'pasante') {
      return 'Completa tus datos académicos y personales como pasante.';
    }

    if (formData.tipo_usuario === 'tutor') {
      return 'Completa tu código docente para identificar tu perfil de tutor.';
    }

    return 'Completa los datos adicionales.';
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-gray font-poppins">
      <Header />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-medium-gray/20 flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-main-green p-8 text-white-main flex flex-col justify-center space-y-4">
            <CheckCircle2 size={48} />

            <h2 className="text-2xl font-montserrat font-bold">
              Únete a la Red
            </h2>

            <p className="text-sm opacity-90 leading-relaxed">
              Forma parte del ecosistema que conecta el talento académico con el
              mundo profesional.
            </p>

            <div className="pt-8 flex gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 1 ? 'bg-white-main' : 'bg-white-main/30'
                }`}
              />

              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 2 ? 'bg-white-main' : 'bg-white-main/30'
                }`}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="md:w-2/3 p-8 space-y-5"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-2xl font-bold text-institucional-blue font-montserrat">
                  {step === 1 ? 'Crear Cuenta' : 'Datos Adicionales'}
                </h3>

                {step === 2 && (
                  <p className="text-xs text-medium-gray mt-1">
                    {textoAyudaPaso2()}
                  </p>
                )}
              </div>

              <span className="text-xs font-bold text-medium-gray bg-light-gray px-2 py-1 rounded-md">
                Paso {step} de 2
              </span>
            </div>

            {aviso && <AvisoTailwind aviso={aviso} />}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoError label="Nombre" error={errores.nombre}>
                    <div className="relative group">
                      <User
                        className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                        size={18}
                      />

                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={inputClass('nombre')}
                        placeholder="Ej: Juan"
                      />
                    </div>
                  </CampoError>

                  <CampoError label="Apellido" error={errores.apellido}>
                    <div className="relative group">
                      <User
                        className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                        size={18}
                      />

                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        className={inputClass('apellido')}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                  </CampoError>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoError label="Usuario" error={errores.usuario}>
                    <div className="relative group">
                      <AtSign
                        className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                        size={18}
                      />

                      <input
                        type="text"
                        name="usuario"
                        value={formData.usuario}
                        onChange={handleChange}
                        className={inputClass('usuario')}
                        placeholder="juanp123"
                      />
                    </div>
                  </CampoError>

                  <CampoError
                    label="Tipo de Usuario"
                    error={errores.tipo_usuario}
                  >
                    <select
                      name="tipo_usuario"
                      value={formData.tipo_usuario}
                      onChange={handleChange}
                      className={simpleInputClass('tipo_usuario')}
                    >
                      <option value="" disabled>
                        Selecciona un rol...
                      </option>

                      <option value="pasante">Pasante</option>
                      <option value="gerente">Gerente de Empresa</option>
                      <option value="tutor">Tutor</option>
                    </select>
                  </CampoError>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CampoError label="Correo" error={errores.correo}>
                    <div className="relative group">
                      <Mail
                        className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                        size={18}
                      />

                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        className={inputClass('correo')}
                        placeholder="juan@correo.com"
                      />
                    </div>
                  </CampoError>

                  <CampoError label="Teléfono" error={errores.telefono}>
                    <div className="relative group">
                      <Phone
                        className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                        size={18}
                      />

                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={inputClass('telefono')}
                        placeholder="Ej: 71234567"
                      />
                    </div>
                  </CampoError>
                </div>

                <CampoError label="Contraseña" error={errores.password}>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                      size={18}
                    />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass('password')}
                      placeholder="••••••••"
                    />
                  </div>
                </CampoError>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-institucional-blue hover:bg-secondary-blue text-white-main font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4"
                >
                  Siguiente Paso <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {formData.tipo_usuario === 'gerente' && (
                  <div className="space-y-4">
                    <CampoError
                      label="Cargo en la Empresa"
                      error={errores.cargo}
                    >
                      <div className="relative group">
                        <Briefcase
                          className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                          size={18}
                        />

                        <input
                          type="text"
                          name="cargo"
                          value={formData.cargo}
                          onChange={handleChange}
                          className={inputClass('cargo')}
                          placeholder="Ej: Director de Recursos Humanos"
                        />
                      </div>
                    </CampoError>
                  </div>
                )}

                {formData.tipo_usuario === 'pasante' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CampoError
                        label="Cédula de Identidad"
                        error={errores.ci}
                      >
                        <div className="relative group">
                          <IdCard
                            className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                            size={18}
                          />

                          <input
                            type="text"
                            name="ci"
                            value={formData.ci}
                            onChange={handleChange}
                            className={inputClass('ci')}
                            placeholder="Ej: 1234567 LP"
                          />
                        </div>
                      </CampoError>

                      <CampoError
                        label="Registro Universitario"
                        error={errores.registro_universitario}
                      >
                        <div className="relative group">
                          <GraduationCap
                            className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                            size={18}
                          />

                          <input
                            type="text"
                            name="registro_universitario"
                            value={formData.registro_universitario}
                            onChange={handleChange}
                            className={inputClass('registro_universitario')}
                            placeholder="Ej: 1789456"
                          />
                        </div>
                      </CampoError>
                    </div>

                    <CampoError
                      label="Dirección de Residencia"
                      error={errores.direccion}
                    >
                      <div className="relative group">
                        <MapPin
                          className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                          size={18}
                        />

                        <input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          className={inputClass('direccion')}
                          placeholder="Zona, Calle, Nro"
                        />
                      </div>
                    </CampoError>
                  </div>
                )}

                {formData.tipo_usuario === 'tutor' && (
                  <div className="space-y-4">
                    <CampoError
                      label="Código Docente"
                      error={errores.codigo_docente}
                    >
                      <div className="relative group">
                        <BookUser
                          className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green"
                          size={18}
                        />

                        <input
                          type="text"
                          name="codigo_docente"
                          value={formData.codigo_docente}
                          onChange={handleChange}
                          className={inputClass('codigo_docente')}
                          placeholder="Ej: DOC-001"
                        />
                      </div>
                    </CampoError>

                    <div className="bg-institucional-blue/10 border border-institucional-blue/20 text-institucional-blue rounded-xl px-4 py-3 text-xs font-semibold">
                      El código docente servirá para identificar tu perfil como
                      tutor dentro del sistema.
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-main-green focus:ring-main-green cursor-pointer"
                      id="terms"
                    />

                    <label
                      htmlFor="terms"
                      className="text-xs text-dark-gray cursor-pointer"
                    >
                      Acepto los términos y condiciones de uso.
                    </label>
                  </div>

                  {errores.aceptaTerminos && (
                    <p className="text-xs text-red-600 mt-1">
                      {errores.aceptaTerminos}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={volverPaso1}
                    disabled={cargando}
                    className="w-1/3 bg-light-gray hover:bg-medium-gray/20 text-dark-gray font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} /> Atrás
                  </button>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-2/3 bg-main-green hover:bg-soft-green text-white-main font-bold py-3 rounded-xl transition-all shadow-lg shadow-main-green/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {cargando ? 'Registrando...' : 'Completar Registro'}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-dark-gray pt-2">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-secondary-blue font-bold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface CampoErrorProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const CampoError: React.FC<CampoErrorProps> = ({
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
