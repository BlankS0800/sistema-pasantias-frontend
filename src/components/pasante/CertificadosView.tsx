import React, { useEffect, useState } from 'react';
import { Award, Eye, Printer, X } from 'lucide-react';

import {
  listarMisCertificados,
  obtenerCertificadoPasanteHtml,
} from '../../services/certificadoPasanteService';

import type { InformePasante } from '../../services/certificadoPasanteService';

export const CertificadosView: React.FC = () => {
  const [informes, setInformes] = useState<InformePasante[]>([]);
  const [certificadoHtml, setCertificadoHtml] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarCertificados();
  }, []);

  const cargarCertificados = async () => {
    try {
      setCargando(true);
      const data = await listarMisCertificados();

      setInformes(data.informes || []);
    } catch (error: any) {
      setMensaje(error.message || 'No se pudieron cargar los certificados.');
    } finally {
      setCargando(false);
    }
  };

  const verCertificado = async (idInforme: number) => {
    try {
      const html = await obtenerCertificadoPasanteHtml(idInforme);
      setCertificadoHtml(html);
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo cargar el certificado.');
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-institucional-blue animate-pulse">
          Cargando certificados...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">
          Mis Certificados
        </h2>

        <p className="text-sm text-medium-gray mt-1">
          Aquí podrás ver e imprimir tus certificados cuando tu evaluación final sea registrada.
        </p>
      </div>

      {mensaje && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl text-sm font-semibold">
          {mensaje}
        </div>
      )}

      {informes.length === 0 ? (
        <div className="bg-white-main p-12 rounded-xl shadow-sm border border-light-gray text-center">
          <Award size={52} className="mx-auto text-medium-gray/50 mb-4" />

          <h3 className="text-lg font-bold text-dark-gray">
            Aún no tienes certificados disponibles
          </h3>

          <p className="text-sm text-medium-gray mt-2">
            Cuando el jefe registre tu evaluación final, aparecerá aquí tu certificado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {informes.map((informe) => (
            <div
              key={informe.id_informe}
              className="bg-white-main p-5 rounded-xl shadow-sm border border-light-gray flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p className="font-bold text-institucional-blue">
                  {informe.boleta?.pasantia?.nombre || 'Pasantía'}
                </p>

                <p className="text-sm text-medium-gray mt-1">
                  Empresa: {informe.boleta?.pasantia?.empresa?.nombre || 'Empresa'}
                </p>

                <p className="text-sm font-bold text-main-green mt-1">
                  Nota final: {informe.nota}/100
                </p>
              </div>

              <button
                type="button"
                onClick={() => verCertificado(informe.id_informe)}
                className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                Ver certificado
              </button>
            </div>
          ))}
        </div>
      )}

      {certificadoHtml && (
        <div className="fixed inset-0 bg-dark-gray/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white-main w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden h-[92vh] flex flex-col">
            <div className="p-4 bg-institucional-blue text-white-main flex justify-between items-center">
              <h3 className="font-bold">Vista previa del certificado</h3>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById('certificado-pasante-frame') as HTMLIFrameElement | null;
                    iframe?.contentWindow?.print();
                  }}
                  className="bg-main-green px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir
                </button>

                <button type="button" onClick={() => setCertificadoHtml(null)}>
                  <X size={22} />
                </button>
              </div>
            </div>

            <iframe
              id="certificado-pasante-frame"
              title="Certificado"
              srcDoc={certificadoHtml}
              className="w-full flex-1 bg-white-main"
            />
          </div>
        </div>
      )}
    </div>
  );
};
