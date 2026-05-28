import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Building2,
  Calendar,
  UserCircle,
  Briefcase,
  Clock,
  Download,
  CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';

export const BoletaView: React.FC = () => {
  const [boleta, setBoleta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState<string>('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        const response = await fetch(`${baseUrl}/pasante/boleta`, {
          headers: getAuthHeaders(),
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          setBoleta(data.boleta);
        } else {
          setMensaje(data?.message || 'No se encontró boleta de inscripción.');
        }
      } catch (error) {
        console.error('Error al cargar la boleta', error);
        setMensaje('No se pudo conectar con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoleta();
  }, []);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';

    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-BO');
  };

  const obtenerNombreUsuario = (usuario?: any) => {
    if (!usuario) return null;

    const nombreCompleto = `${usuario.nombre || ''} ${
      usuario.apellido || ''
    }`.trim();

    return nombreCompleto || null;
  };

  const obtenerNombrePasante = () => {
    return (
      obtenerNombreUsuario(boleta?.pasante?.usuario) ||
      obtenerNombreUsuario(boleta?.pasante) ||
      'Pasante'
    );
  };

  const obtenerNombreJefe = () => {
    return (
      obtenerNombreUsuario(boleta?.jefe?.usuario) ||
      obtenerNombreUsuario(boleta?.jefe) ||
      'Asignación pendiente'
    );
  };

  const obtenerNombreTutor = () => {
    return (
      obtenerNombreUsuario(boleta?.tutor?.usuario) ||
      obtenerNombreUsuario(boleta?.pasante?.tutor?.usuario) ||
      obtenerNombreUsuario(boleta?.tutor) ||
      obtenerNombreUsuario(boleta?.pasante?.tutor) ||
      'Asignación pendiente'
    );
  };

  const obtenerEstadoTexto = () => {
    if (boleta?.estado === 'aprobado') {
      return 'Inscripción aprobada por la empresa.';
    }

    if (boleta?.estado === 'rechazado') {
      return 'Postulación rechazada.';
    }

    if (boleta?.estado === 'pendiente') {
      return 'Postulación pendiente de aprobación.';
    }

    return boleta?.descripcion || 'En revisión';
  };

  const obtenerBadgeEstado = () => {
    if (boleta?.estado === 'aprobado') {
      return {
        texto: 'Aprobado',
        clase: 'bg-main-green/10 text-main-green',
      };
    }

    if (boleta?.estado === 'rechazado') {
      return {
        texto: 'Rechazado',
        clase: 'bg-red-100 text-red-700',
      };
    }

    if (boleta?.estado === 'pendiente') {
      return {
        texto: 'Pendiente',
        clase: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      texto: 'Inscrito',
      clase: 'bg-main-green/10 text-main-green',
    };
  };

  const descargarBoletaPDF = () => {
    if (!boleta) return;

    const doc = new jsPDF('p', 'mm', 'a4');

    const estado = obtenerBadgeEstado();
    const nombrePasante = obtenerNombrePasante();
    const nombreJefe = obtenerNombreJefe();
    const nombreTutor = obtenerNombreTutor();

    const nombrePasantia = boleta.pasantia?.nombre || 'Pasantía Profesional';
    const nombreEmpresa = boleta.pasantia?.empresa?.nombre || 'Empresa asignada';
    const fechaInscripcion = formatearFecha(boleta.fecha);
    const observacion = obtenerEstadoTexto();

    const margenX = 20;
    let y = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Registro de Pasantía', margenX, y);

    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Comprobante Oficial de Inscripción', margenX, y);

    y += 10;

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.8);
    doc.line(margenX, y, 190, y);

    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Estado:', margenX, y);

    doc.setFont('helvetica', 'normal');
    doc.text(estado.texto, margenX + 22, y);

    y += 12;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margenX, y, 170, 45, 4, 4, 'F');

    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Pasante:', margenX + 5, y);

    doc.setFont('helvetica', 'normal');
    doc.text(nombrePasante, margenX + 38, y);

    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.text('Programa:', margenX + 5, y);

    doc.setFont('helvetica', 'normal');
    const pasantiaLineas = doc.splitTextToSize(nombrePasantia, 120);
    doc.text(pasantiaLineas, margenX + 38, y);

    y += pasantiaLineas.length > 1 ? 13 : 9;

    doc.setFont('helvetica', 'bold');
    doc.text('Empresa:', margenX + 5, y);

    doc.setFont('helvetica', 'normal');
    const empresaLineas = doc.splitTextToSize(nombreEmpresa, 120);
    doc.text(empresaLineas, margenX + 38, y);

    y += empresaLineas.length > 1 ? 13 : 16;

    const agregarCampo = (titulo: string, valor: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(titulo, margenX, y);

      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const lineas = doc.splitTextToSize(valor || 'Sin información', 165);
      doc.text(lineas, margenX, y);

      y += lineas.length * 6 + 8;
    };

    agregarCampo('Fecha de inscripción', fechaInscripcion);
    agregarCampo('Estado / Observación', observacion);
    agregarCampo('Jefe de Pasantes', nombreJefe);
    agregarCampo('Tutor Académico', nombreTutor);

    y += 4;

    doc.setDrawColor(220, 220, 220);
    doc.line(margenX, y, 190, y);

    y += 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(
      'Documento generado desde el Sistema de Gestión de Pasantías.',
      margenX,
      y
    );

    const nombreArchivo = `boleta_inscripcion_${nombrePasante
      .replace(/\s+/g, '_')
      .replace(/[^\wñÑáéíóúÁÉÍÓÚ_-]/g, '')
      .toLowerCase()}.pdf`;

    doc.save(nombreArchivo);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue font-semibold animate-pulse flex items-center gap-2">
          <FileCheck className="animate-spin" size={20} />
          Cargando boleta...
        </p>
      </div>
    );
  }

  const estado = obtenerBadgeEstado();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Mi Boleta de Inscripción
        </h2>
      </div>

      {!boleta ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <Briefcase size={48} className="mx-auto text-medium-gray/50 mb-4" />

          <h3 className="text-lg font-bold text-dark-gray">
            Aún no estás inscrito en ninguna pasantía
          </h3>

          <p className="text-sm text-medium-gray mt-2 mb-6">
            {mensaje ||
              'Ve a la sección "Buscar Pasantías" para explorar las ofertas disponibles y postularte a una.'}
          </p>
        </div>
      ) : (
        <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray max-w-3xl mx-auto">
          <div className="border-b-2 border-main-green/20 pb-6 mb-6 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-medium-gray uppercase tracking-widest mb-1">
                Comprobante Oficial
              </p>

              <h3 className="text-2xl font-bold text-institucional-blue">
                Registro de Pasantía
              </h3>
            </div>

            <div
              className={`${estado.clase} px-4 py-2 rounded-lg flex items-center gap-2 font-bold`}
            >
              <CheckCircle2 size={20} />
              {estado.texto}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-light-gray/20 p-5 rounded-xl border border-light-gray flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <p className="text-xs font-bold text-medium-gray uppercase">
                  Programa de Pasantía
                </p>

                <p className="text-lg font-bold text-dark-gray mt-1">
                  {boleta.pasantia?.nombre || 'Pasantía Profesional'}
                </p>

                <p className="text-sm font-semibold text-secondary-blue flex items-center gap-2 mt-1">
                  <Building2 size={16} />
                  {boleta.pasantia?.empresa?.nombre || 'Empresa asignada'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">
                  Fecha de Inscripción
                </p>

                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <Calendar size={18} className="text-institucional-blue" />
                  {formatearFecha(boleta.fecha)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">
                  Estado / Observación
                </p>

                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <Clock size={18} className="text-institucional-blue" />
                  {obtenerEstadoTexto()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">
                  Jefe de Pasantes
                </p>

                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <UserCircle size={18} className="text-institucional-blue" />
                  {obtenerNombreJefe()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-medium-gray uppercase">
                  Tutor Académico
                </p>

                <p className="text-dark-gray font-medium flex items-center gap-2">
                  <UserCircle size={18} className="text-institucional-blue" />
                  {obtenerNombreTutor()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-light-gray flex justify-end">
            <button
              type="button"
              onClick={descargarBoletaPDF}
              className="bg-light-gray hover:bg-medium-gray/20 text-dark-gray px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-medium-gray/20"
            >
              <Download size={18} />
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};