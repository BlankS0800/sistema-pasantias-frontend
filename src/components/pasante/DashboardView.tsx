import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';

interface DashboardViewProps {
  usuario: any;
}

interface EstadoVista {
  tipo: 'exito' | 'info' | 'warning' | 'error';
  texto: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ usuario }) => {
  const [boleta, setBoleta] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [tieneHojaVida, setTieneHojaVida] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoVista, setEstadoVista] = useState<EstadoVista | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setIsLoading(true);

    try {
      await Promise.all([
        cargarBoleta(),
        cargarActividades(),
        cargarHojaVida(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarBoleta = async () => {
    try {
      const response = await fetch(`${baseUrl}/pasante/boleta`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setBoleta(data.boleta || null);
      }
    } catch (error) {
      console.error('Error al cargar boleta:', error);
    }
  };

  const cargarActividades = async () => {
    try {
      const response = await fetch(`${baseUrl}/pasante/actividades`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setActividades(data.actividades || []);
      }
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    }
  };

  const cargarHojaVida = async () => {
    try {
      const posiblesRutas = [
        `${baseUrl}/pasante/hoja-vida`,
        `${baseUrl}/pasante/hojas-vida`,
        `${baseUrl}/pasante/cv`,
      ];

      for (const url of posiblesRutas) {
        const response = await fetch(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);

          if (data?.hoja_vida || data?.hojas_vida?.length > 0) {
            setTieneHojaVida(true);
            return;
          }
        }
      }

      setTieneHojaVida(false);
    } catch (error) {
      setTieneHojaVida(false);
    }
  };

  const nombreCompleto = useMemo(() => {
    return `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();
  }, [usuario]);

  const pasante = boleta?.pasante;

  const obtenerNombreUsuario = (usuarioData?: any) => {
    if (!usuarioData) return null;

    const nombre = `${usuarioData.nombre || ''} ${
      usuarioData.apellido || ''
    }`.trim();

    return nombre || null;
  };

  const obtenerNombreTutor = () => {
    return (
      obtenerNombreUsuario(boleta?.tutor?.usuario) ||
      obtenerNombreUsuario(boleta?.pasante?.tutor?.usuario) ||
      'Tutor pendiente'
    );
  };

  const obtenerNombreJefe = () => {
    return (
      obtenerNombreUsuario(boleta?.jefe?.usuario) ||
      'Jefe pendiente'
    );
  };

  const obtenerEstadoBoleta = () => {
    if (!boleta) {
      return {
        texto: 'Sin postulación',
        descripcion: 'Aún no tienes una boleta de inscripción registrada.',
        clase: 'bg-light-gray text-medium-gray border-medium-gray/20',
      };
    }

    if (boleta.estado === 'aprobado') {
      return {
        texto: 'Aprobada',
        descripcion: 'Tu inscripción fue aprobada por la empresa.',
        clase: 'bg-main-green/10 text-main-green border-main-green/30',
      };
    }

    if (boleta.estado === 'rechazado') {
      return {
        texto: 'Rechazada',
        descripcion: 'Tu postulación fue rechazada.',
        clase: 'bg-red-50 text-red-700 border-red-200',
      };
    }

    return {
      texto: 'Pendiente',
      descripcion: 'Tu postulación está en espera de aprobación.',
      clase: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
  };

  const actividadesCompletadas = actividades.filter(
    (actividad) =>
      actividad.estado === 'completada' ||
      Number(actividad.progreso || actividad.avance || 0) >= 100
  ).length;

  const promedioAvance = useMemo(() => {
    if (actividades.length === 0) return 0;

    const suma = actividades.reduce((total, actividad) => {
      return total + Number(actividad.progreso || actividad.avance || 0);
    }, 0);

    return Math.round(suma / actividades.length);
  }, [actividades]);

  const estadoBoleta = obtenerEstadoBoleta();

  useEffect(() => {
    if (!boleta && !tieneHojaVida) {
      setEstadoVista({
        tipo: 'info',
        texto: 'Completa tu perfil y carga tu CV para postular a una pasantía.',
      });
      return;
    }

    if (boleta?.estado === 'pendiente') {
      setEstadoVista({
        tipo: 'warning',
        texto: 'Tu postulación está pendiente. Revisa tu boleta para conocer el estado.',
      });
      return;
    }

    if (boleta?.estado === 'aprobado' && actividades.length === 0) {
      setEstadoVista({
        tipo: 'info',
        texto: 'Tu pasantía está aprobada. Aún no tienes actividades asignadas.',
      });
      return;
    }

    if (boleta?.estado === 'aprobado' && actividades.length > 0) {
      setEstadoVista({
        tipo: 'exito',
        texto: 'Tu pasantía está activa. Revisa tus actividades y registra tu avance.',
      });
      return;
    }

    setEstadoVista(null);
  }, [boleta, tieneHojaVida, actividades.length]);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(`${fecha.substring(0, 10)}T00:00:00`).toLocaleDateString(
      'es-BO'
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse">
          Cargando resumen del pasante...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative overflow-hidden bg-gradient-to-r from-institucional-blue via-secondary-blue to-main-green rounded-3xl p-8 text-white-main shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white-main/10 rounded-full" />
        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white-main/10 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white-main/15 border border-white-main/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <GraduationCap size={16} />
              Panel del Pasante
            </div>

            <h2 className="text-3xl md:text-4xl font-montserrat font-extrabold">
              Bienvenido, {nombreCompleto || 'Pasante'}
            </h2>

            <p className="text-white-main/85 mt-3 max-w-2xl leading-relaxed">
              Aquí puedes revisar tu situación académica, tu estado de postulación,
              tu pasantía actual y el avance de tus actividades asignadas.
            </p>
          </div>

          <div className="bg-white-main/15 border border-white-main/20 rounded-2xl p-5 min-w-[260px] backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-white-main/70 font-bold">
              Estado actual
            </p>

            <p className="text-xl font-bold mt-1">
              {estadoBoleta.texto}
            </p>

            <p className="text-xs text-white-main/75 mt-2">
              {estadoBoleta.descripcion}
            </p>
          </div>
        </div>
      </div>

      {estadoVista && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
            estadoVista.tipo === 'exito'
              ? 'bg-main-green/10 border-main-green/30 text-main-green'
              : estadoVista.tipo === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : estadoVista.tipo === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-institucional-blue/10 border-institucional-blue/30 text-institucional-blue'
          }`}
        >
          <CheckCircle2 size={18} />
          {estadoVista.texto}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <TarjetaIndicador
          titulo="Estado CV"
          valor={tieneHojaVida ? 'Cargado' : 'Pendiente'}
          descripcion={
            tieneHojaVida
              ? 'Tu hoja de vida está registrada.'
              : 'Carga tu CV desde Mi Perfil.'
          }
          icono={<FileText size={26} />}
          clase={
            tieneHojaVida
              ? 'bg-main-green/10 text-main-green'
              : 'bg-yellow-50 text-yellow-700'
          }
        />

        <TarjetaIndicador
          titulo="Postulación"
          valor={estadoBoleta.texto}
          descripcion={boleta?.pasantia?.nombre || 'Sin pasantía activa'}
          icono={<Briefcase size={26} />}
          clase="bg-institucional-blue/10 text-institucional-blue"
        />

        <TarjetaIndicador
          titulo="Actividades"
          valor={`${actividadesCompletadas}/${actividades.length}`}
          descripcion="Actividades completadas"
          icono={<Activity size={26} />}
          clase="bg-secondary-blue/10 text-secondary-blue"
        />

        <TarjetaIndicador
          titulo="Avance"
          valor={`${promedioAvance}%`}
          descripcion="Promedio general"
          icono={<Award size={26} />}
          clase="bg-main-green/10 text-main-green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-institucional-blue/10 flex items-center justify-center">
              <UserCircle className="text-institucional-blue" size={26} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-institucional-blue">
                Mi información académica
              </h3>

              <p className="text-sm text-medium-gray">
                Datos registrados actualmente en el sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatoAcademico
              icono={<Mail size={18} />}
              label="Correo"
              value={usuario?.email || 'No registrado'}
            />

            <DatoAcademico
              icono={<Phone size={18} />}
              label="Teléfono"
              value={pasante?.telefono || usuario?.telefono || 'No registrado'}
            />

            <DatoAcademico
              icono={<GraduationCap size={18} />}
              label="Registro Universitario"
              value={pasante?.reg_universitario || 'No registrado'}
            />

            <DatoAcademico
              icono={<Building2 size={18} />}
              label="Institución / Universidad"
              value={
                pasante?.institucion?.nombre ||
                boleta?.pasante?.institucion?.nombre ||
                'No registrada'
              }
            />

            <DatoAcademico
              icono={<UserCircle size={18} />}
              label="Tutor Académico"
              value={obtenerNombreTutor()}
            />

            <DatoAcademico
              icono={<ShieldCheck size={18} />}
              label="CI"
              value={pasante?.ci || 'No registrado'}
            />
          </div>
        </div>

        <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-main-green/10 flex items-center justify-center">
              <Briefcase className="text-main-green" size={26} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-institucional-blue">
                Pasantía actual
              </h3>

              <p className="text-sm text-medium-gray">
                Información de tu inscripción.
              </p>
            </div>
          </div>

          {boleta ? (
            <div className="space-y-4">
              <DatoSimple
                label="Pasantía"
                value={boleta.pasantia?.nombre || 'Sin nombre'}
              />

              <DatoSimple
                label="Empresa"
                value={boleta.pasantia?.empresa?.nombre || 'Sin empresa'}
              />

              <DatoSimple
                label="Jefe de Pasantes"
                value={obtenerNombreJefe()}
              />

              <DatoSimple
                label="Fecha de inscripción"
                value={formatearFecha(boleta.fecha)}
              />

              <span
                className={`inline-flex border px-3 py-1.5 rounded-full text-xs font-bold ${estadoBoleta.clase}`}
              >
                {estadoBoleta.texto}
              </span>
            </div>
          ) : (
            <div className="bg-light-gray/40 rounded-xl p-5 text-center">
              <Briefcase className="mx-auto text-medium-gray/60 mb-3" size={38} />

              <p className="font-bold text-dark-gray">
                Sin pasantía registrada
              </p>

              <p className="text-sm text-medium-gray mt-1">
                Cuando postules a una pasantía, aparecerá aquí tu información.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary-blue/10 flex items-center justify-center shrink-0">
            <Clock className="text-secondary-blue" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-institucional-blue">
              Seguimiento general
            </h3>

            <p className="text-sm text-medium-gray mt-1">
              {actividades.length === 0
                ? 'Todavía no tienes actividades asignadas. Cuando tu jefe de pasantes registre actividades, aparecerán en el módulo Actividades y Bitácora.'
                : `Tienes ${actividades.length} actividad(es) asignada(s). Has completado ${actividadesCompletadas}. Tu avance promedio es ${promedioAvance}%.`}
            </p>

            {actividades.length > 0 && (
              <div className="mt-4 w-full bg-light-gray rounded-full h-3 overflow-hidden">
                <div
                  className="bg-main-green h-3 rounded-full transition-all"
                  style={{ width: `${promedioAvance}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TarjetaIndicador: React.FC<{
  titulo: string;
  valor: string;
  descripcion: string;
  icono: React.ReactNode;
  clase: string;
}> = ({ titulo, valor, descripcion, icono, clase }) => {
  return (
    <div className="bg-white-main rounded-2xl shadow-sm border border-light-gray p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${clase}`}>
          {icono}
        </div>
      </div>

      <p className="text-sm font-semibold text-medium-gray mt-4">
        {titulo}
      </p>

      <p className="text-2xl font-extrabold text-dark-gray mt-1">
        {valor}
      </p>

      <p className="text-xs text-medium-gray mt-1">
        {descripcion}
      </p>
    </div>
  );
};

const DatoAcademico: React.FC<{
  icono: React.ReactNode;
  label: string;
  value: string;
}> = ({ icono, label, value }) => {
  return (
    <div className="border border-light-gray rounded-xl p-4 bg-light-gray/20">
      <div className="flex items-start gap-3">
        <div className="text-main-green mt-0.5">{icono}</div>

        <div>
          <p className="text-xs font-bold text-medium-gray uppercase">
            {label}
          </p>

          <p className="font-semibold text-dark-gray mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const DatoSimple: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="border-b border-light-gray pb-3 last:border-b-0">
      <p className="text-xs font-bold text-medium-gray uppercase">
        {label}
      </p>

      <p className="font-semibold text-dark-gray mt-1">
        {value}
      </p>
    </div>
  );
};