import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VerticalInfoSection } from "../components/VerticalInfoSection";
// Añadimos ChevronLeft y ChevronRight para los controles del carrusel
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlatformData {
  mision: string;
  vision: string;
  objetivo: string;
}

// Array con las imágenes del carrusel (Puedes cambiarlas por tus propias imágenes después)
const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    alt: "Estudiantes universitarios colaborando"
  },
  {
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
    alt: "Entrevista de trabajo profesional"
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    alt: "Trabajo en equipo corporativo"
  }
];

export const HomePage: React.FC = () => {
  // Estado para los datos de la base de datos
  const [platformData, setPlatformData] = useState<PlatformData>({
    mision: "Cargando información estratégica...",
    vision: "Cargando proyección...",
    objetivo: "Cargando metas..."
  });

  // Estado para controlar la imagen actual del carrusel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Simulación de carga de datos
  useEffect(() => {
    setTimeout(() => {
      setPlatformData({
        mision: "Facilitar la inserción laboral de los estudiantes mediante un ecosistema digital eficiente que garantice prácticas de alto valor académico.",
        vision: "Ser el referente tecnológico nacional en la gestión de pasantías, impulsando la innovación en el vínculo universidad-empresa.",
        objetivo: "Digitalizar y optimizar cada etapa del proceso de pasantía, asegurando transparencia y calidad para todos los usuarios."
      });
    }, 800);
  }, []);

  // Efecto para que el carrusel avance automáticamente cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Funciones para los botones de "Siguiente" y "Anterior"
  const nextSlide = () => setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));

  return (
    <div className="min-h-screen flex flex-col bg-white-main">
      <Header />

      {/* Cambiamos la altura fija (h-[60vh]) por padding (py-16) para que el carrusel quepa de forma fluida */}
      <section className="relative w-full flex flex-col items-center bg-radial-[at_50%_50%] from-secondary-blue/10 via-transparent to-transparent px-6 py-16">
        
        {/* Textos Principales */}
        <div className="text-center space-y-6 max-w-4xl z-10">
          <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-institucional-blue tracking-tight leading-tight">
            Impulsa tu <span className="text-main-green">Carrera</span> Profesional
          </h1>
          <div className="pt-8 pb-10 animate-bounce">
            <ChevronDown className="mx-auto text-medium-gray/50" size={36} strokeWidth={1.5} />
          </div>
        </div>
        {/* Carrusel de Imágenes Dinámico */}
        <div className="relative w-full max-w-5xl h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl group border-[6px] border-white-main">
          {carouselImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={image.url} 
                alt={image.alt} 
                className="w-full h-full object-cover"
              />
              {/* Filtro oscuro muy sutil para mejorar el contraste */}
              <div className="absolute inset-0 bg-institucional-blue/10"></div>
            </div>
          ))}

          {/* Botón Anterior (Solo aparece al pasar el cursor) */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white-main/40 hover:bg-white-main text-institucional-blue p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20 shadow-md"
          >
            <ChevronLeft size={28} />
          </button>
          
          {/* Botón Siguiente (Solo aparece al pasar el cursor) */}
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white-main/40 hover:bg-white-main text-institucional-blue p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20 shadow-md"
          >
            <ChevronRight size={28} />
          </button>

          {/* Indicadores de posición (Puntitos abajo) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${index === currentSlide ? 'bg-white-main w-8' : 'bg-white-main/50 w-2.5 hover:bg-white-main/80'}`}
                aria-label={`Ir a la imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contenido Vertical */}
      <main className="max-w-6xl mx-auto px-6 py-12 w-full space-y-2">
        <VerticalInfoSection title="Misión" content={platformData.mision} type="mision" />
        <VerticalInfoSection title="Visión" content={platformData.vision} type="vision" />
        <VerticalInfoSection title="Objetivo" content={platformData.objetivo} type="objetivo" />
      </main>
      <Footer />
    </div>
  );
};