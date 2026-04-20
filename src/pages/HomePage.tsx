import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VerticalInfoSection } from "../components/VerticalInfoSection";
import { ChevronDown } from 'lucide-react';

interface PlatformData {
  mision: string;
  vision: string;
  objetivo: string;
}

export const HomePage: React.FC = () => {
  const [platformData, setPlatformData] = useState<PlatformData>({
    mision: "Cargando información estratégica...",
    vision: "Cargando proyección...",
    objetivo: "Cargando metas..."
  });

  useEffect(() => {
    setTimeout(() => {
      setPlatformData({
        mision: "Facilitar la inserción laboral de los estudiantes mediante un ecosistema digital eficiente que garantice prácticas de alto valor académico.",
        vision: "Ser el referente tecnológico nacional en la gestión de pasantías, impulsando la innovación en el vínculo universidad-empresa.",
        objetivo: "Digitalizar y optimizar cada etapa del proceso de pasantía, asegurando transparencia y calidad para todos los usuarios."
      });
    }, 800);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white-main">
      <Header />

      <section className="relative h-[60vh] flex items-center justify-center bg-radial-[at_50%_50%] from-secondary-blue/10 via-transparent to-transparent px-6">
        <div className="text-center space-y-6 max-w-4xl">
          {/* Tamaño de texto corregido para ser menos invasivo */}
          <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-institucional-blue tracking-tight leading-tight">
            Impulsa tu <span className="text-main-green">Carrera</span> Profesional
          </h1>
          
          <div className="w-16 h-1 bg-soft-green mx-auto rounded-full"></div>

          <p className="text-lg md:text-xl text-dark-gray font-poppins max-w-xl mx-auto leading-relaxed opacity-80">
            Conectamos el talento universitario con las empresas líderes del sector. 
          </p>
          
          <div className="pt-10 animate-bounce">
            <ChevronDown className="mx-auto text-medium-gray/30" size={36} strokeWidth={1} />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10 w-full space-y-2">
        <VerticalInfoSection title="Misión" content={platformData.mision} type="mision" />
        <VerticalInfoSection title="Visión" content={platformData.vision} type="vision" />
        <VerticalInfoSection title="Objetivo" content={platformData.objetivo} type="objetivo" />
      </main>

      <Footer />
    </div>
  );
};