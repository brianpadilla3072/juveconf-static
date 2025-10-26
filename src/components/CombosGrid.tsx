import { useState, useEffect } from 'react';
import RegistrationForm from './RegistrationForm';

interface Combo {
  id: string;
  name: string;
  price: number;
  description: string;
  isFree: boolean;
  metadata: {
    benefits: string[];
    merchandise?: {
      enabled: boolean;
      allMerchandise: Array<{
        type: string;
        label: string;
        sizes: string[];
      }>;
    };
  };
  displayOrder: number;
}

interface Package {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  gratuito: boolean;
  caracteristicas: string[];
  icono: string;
  metadata?: {
    benefits: string[];
    merchandise?: {
      enabled: boolean;
      allMerchandise: Array<{
        type: string;
        label: string;
        sizes: string[];
      }>;
    };
  };
}

export default function CombosGrid() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [combos, setCombos] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const eventId = import.meta.env.PUBLIC_EVENT_ID;
        const apiUrl = import.meta.env.PUBLIC_API_URL;

        if (!eventId) {
          throw new Error('Event ID no configurado');
        }

        const response = await fetch(`${apiUrl}/combos/event/${eventId}/published`);

        if (!response.ok) {
          throw new Error('Error al cargar los combos');
        }

        const data: Combo[] = await response.json();

        // Mapear datos del backend al formato del componente
        const mappedCombos: Package[] = data.map((combo) => ({
          id: combo.id,
          titulo: combo.name.toUpperCase(),
          descripcion: combo.description?.toUpperCase() || '',
          precio: combo.price,
          gratuito: combo.isFree,
          caracteristicas: combo.metadata?.benefits || [],
          icono: '→',
          metadata: combo.metadata
        }));

        setCombos(mappedCombos);
      } catch (err: any) {
        console.error('Error fetching combos:', err);
        setError(err.message || 'Error al cargar los combos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setTimeout(() => {
      document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // No renderizar nada si hay error
  if (error) {
    console.error('CombosGrid error:', error);
    return null;
  }

  // No renderizar nada si no hay combos (después de cargar)
  if (!isLoading && combos.length === 0) {
    return null;
  }

  // Mostrar formulario de registro si hay un paquete seleccionado
  if (selectedPackage) {
    const paquete = combos.find(p => p.id === selectedPackage);
    if (paquete) {
      return (
        <RegistrationForm
          selectedPackage={paquete}
          onBack={() => setSelectedPackage(null)}
        />
      );
    }
  }

  // Mientras carga, no renderizar nada (opcional: podría mostrar loading)
  if (isLoading) {
    return null;
  }
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 63, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(139, 63, 255, 0);
          }
        }
      `}</style>
      {/* Capa 1: Fondo base negro texturizado (siempre visible) */}
      <img
        src="/bg-texture-dark.png"
        alt="Fondo texturizado"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Capa 2: Desktop - Imagen principal */}
      <img
        src="/inscripcion-desktop.jpg"
        alt="Background Desktop"
        className="hidden lg:block absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
      />

      {/* Capa 2: Mobile/Tablet - Imagen principal */}
      <img
        src="/bg-texture-dark.png"
        alt="Background Mobile"
        className="lg:hidden absolute inset-0 w-full h-full object-contain"
        style={{
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
        }}
      />

      {/* Capa 3: Degradados superior e inferior (solo mobile/tablet) */}
      <div
        className="lg:hidden absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 15%, transparent 87%, rgb(0, 0, 0) 100%)'
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-6 md:p-10 lg:p-12 xl:p-16">

        {/* Header: Título INSCRIPCIÓN + Versículo */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start gap-6 mb-8 lg:mb-12">
          {/* Título INSCRIPCIÓN */}
          <h1
            className="text-[#CCFF00] font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none break-words"
            style={{
              animation: 'fadeInUp 0.8s ease-out'
            }}
          >
            INSCRIPCIÓN
          </h1>

          {/* Versículo bíblico - Desktop only */}
          <div
            className="hidden lg:block text-white text-right max-w-md"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s both'
            }}
          >
            <p className="font-light text-sm lg:text-base leading-tight">
              "A LA MEDIDA DE LA ESTATURA<br/>
              DE LA PLENITUD DE CRISTO"<br/>
              <span className="text-xs lg:text-sm">EFESIOS 4:13</span>
            </p>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {combos.map((paquete, index) => (
                <div
                  key={paquete.id}
                  onClick={() => handleSelectPackage(paquete.id)}
                  className="relative bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.08] hover:-rotate-1 transform active:scale-95 overflow-hidden group"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${0.4 + index * 0.15}s both`,
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  {/* Efecto de brillo en hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(139, 63, 255, 0.15), transparent)',
                      animation: 'shimmer 2s infinite',
                      backgroundSize: '200% 100%'
                    }}
                  />

                  {/* Título */}
                  <h2 className="text-[#8B3FFF] font-black text-2xl sm:text-3xl lg:text-4xl mb-4 relative z-10 break-words overflow-wrap-anywhere">
                    {paquete.titulo}
                  </h2>

                  {/* Descripción */}
                  <p className="text-black text-sm lg:text-base leading-relaxed mb-6 break-words hyphens-auto">
                    {paquete.descripcion}
                  </p>

                  {/* Precio */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-200">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-black font-black text-4xl sm:text-5xl lg:text-6xl break-words">
                        ${paquete.precio.toLocaleString('es-AR')}
                      </span>
                      {paquete.gratuito && (
                        <span className="text-black font-bold text-sm sm:text-base lg:text-lg">
                          /GRATUITO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de características */}
                  <ul className="space-y-3 mb-20">
                    {paquete.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {/* Checkmark púrpura */}
                        <svg
                          className="w-5 h-5 text-[#8B3FFF] flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-black text-xs lg:text-sm leading-tight break-words hyphens-auto">
                          {caracteristica}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón circular con ícono */}
                  <div
                    className="absolute bottom-8 right-8 w-14 h-14 bg-[#8B3FFF] rounded-full flex items-center justify-center transition-all duration-500 shadow-lg pointer-events-none group-hover:rotate-[360deg] group-hover:scale-110"
                    style={{
                      animation: 'pulse-border 2s infinite'
                    }}
                    aria-hidden="true"
                  >
                    <img
                      src="/icons/row-right.svg"
                      alt="arrow"
                      className="w-full h-full transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <div className="text-right">
            <p className="text-[#CCFF00] text-base lg:text-lg font-normal leading-tight">
              CONFERENCIA JUVENIL<br/>
              BAHIA BLANCA
            </p>
          </div>
          <div className="bg-[#ADFF00] px-4 py-2 rounded">
            <img
              src="/icons/juveconfe.svg"
              alt="JUVECONFE"
              className="h-9 lg:h-10 w-auto"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
