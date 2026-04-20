import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VerticalInfoSection } from "../components/VerticalInfoSection";
import { ChevronDown } from 'lucide-react';

import logoText from '../assets/logo_text.png';

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

      <section className="relative h-[65vh] flex items-center justify-center bg-radial-[at_50%_50%] from-secondary-blue/10 via-white-main to-white-main px-6 mt-[-1px]">
        <div className="text-center flex flex-col items-center">
          <img 
            src={logoText} 
            alt="Sistema de Pasantías" 
            className="h-28 md:h-36 w-auto object-contain mb-6 opacity-90" 
          />
          <p className="text-xl text-dark-gray font-poppins max-w-2xl mx-auto">
            La plataforma definitiva para la gestión de pasantías académicas y profesionales.
          </p>
          <div className="pt-16 animate-bounce">
            <ChevronDown className="mx-auto text-medium-gray/70" size={32} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* Cuerpo Principal */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-20 w-full space-y-4">
        <VerticalInfoSection 
          title="Misión" 
          content={platformData.mision} 
          type="mision" 
        />
        <VerticalInfoSection 
          title="Visión" 
          content={platformData.vision} 
          type="vision" 
        />
        <VerticalInfoSection 
          title="Objetivo" 
          content={platformData.objetivo} 
          type="objetivo" 
        />
      </main>
      <Footer />
    </div>
  );
};