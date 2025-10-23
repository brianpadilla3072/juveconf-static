import { useState } from 'react';
import RegistrationForm from './RegistrationForm';

const PAQUETES = [
  {
    id: 'esencial',
    titulo: 'ESENCIAL',
    descripcion: 'IDEAL SI QUERÉS VENIR A LAS REUNIONES PRINCIPALES Y NO PODES QUEDARTE TODO EL FIN DE SEMANA.',
    precio: 0,
    gratuito: true,
    caracteristicas: [
      'ACCESO A LAS 4 PLENARIAS GENERALES',
      'ESCUCHA LA PALABRA DE DIOS JUNTO A TODA LA COMUNIDAD',
      'PARTICIPACIÓN LIBRE Y ABIERTA SIN COSTO'
    ],
    icono: '→'
  },
  {
    id: 'completo',
    titulo: 'COMPLETO',
    descripcion: 'IDEAL PARA VIVIR TODA LA EXPERIENCIA COMPLETA DE JUVECONF',
    precio: 10000,
    gratuito: false,
    caracteristicas: [
      'ACCESO A LAS 4 PLENARIAS GENERALES',
      '2 MENÚ DEL BUFFET OFICIAL DEL EVENTO',
      'PARTICIPACIÓN EN TODOS LOS TALLERES',
      'KIT DE INSCRIPCIÓN',
      'HOSPEDAJE GRATUITO EN CASA DE LOS HERMANOS DE LA IGLESIA'
    ],
    icono: '→'
  },
  {
    id: 'plus',
    titulo: 'PLUS',
    descripcion: 'IDEAL PARA QUIENES QUIEREN TODO EL PAQUETE COMPLETO Y LLEVARSE LA REMERA OFICIAL',
    precio: 30000,
    gratuito: false,
    caracteristicas: [
      'ACCESO A LAS 4 PLENARIAS GENERALES',
      '2 MENÚ DEL BUFFET OFICIAL DEL EVENTO',
      'PARTICIPACIÓN EN TODOS LOS TALLERES',
      'KIT DE INSCRIPCIÓN',
      'HOSPEDAJE GRATUITO EN CASA DE LOS HERMANOS DE LA IGLESIA',
      'REMERA OFICIAL'
    ],
    icono: '→'
  }
];

export default function CombosGrid() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setTimeout(() => {
      document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (selectedPackage) {
    const paquete = PAQUETES.find(p => p.id === selectedPackage);
    if (paquete) {
      return (
        <RegistrationForm
          selectedPackage={paquete}
          onBack={() => setSelectedPackage(null)}
        />
      );
    }
  }
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
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
          <h1 className="text-[#CCFF00] font-black text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none">
            INSCRIPCIÓN
          </h1>

          {/* Versículo bíblico - Desktop only */}
          <div className="hidden lg:block text-white text-right max-w-md">
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
              {PAQUETES.map((paquete) => (
                <div
                  key={paquete.id}
                  onClick={() => handleSelectPackage(paquete.id)}
                  className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 transform active:scale-95"
                >
                  {/* Título */}
                  <h2 className="text-[#8B3FFF] font-black text-3xl lg:text-4xl mb-4">
                    {paquete.titulo}
                  </h2>

                  {/* Descripción */}
                  <p className="text-black text-sm lg:text-base leading-relaxed mb-6">
                    {paquete.descripcion}
                  </p>

                  {/* Precio */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-200">
                    <span className="text-black font-black text-5xl lg:text-6xl">
                      ${paquete.precio.toLocaleString('es-AR')}
                    </span>
                    {paquete.gratuito && (
                      <span className="text-black font-bold text-base lg:text-lg align-super ml-2">
                        /GRATUITO
                      </span>
                    )}
                  </div>

                  {/* Lista de características */}
                  <ul className="space-y-3 mb-16">
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
                        <span className="text-black text-xs lg:text-sm leading-tight">
                          {caracteristica}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón circular con ícono */}
                  <div
                    className="absolute bottom-8 right-8 w-14 h-14 bg-[#8B3FFF] rounded-full flex items-center justify-center text-white text-2xl font-bold transition-transform duration-200 shadow-lg pointer-events-none"
                    aria-hidden="true"
                  >
                    {paquete.icono}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Desktop only */}
        <div className="hidden lg:flex justify-end items-center gap-4 mt-8">
          <div className="text-right">
            <p className="text-[#CCFF00] text-base lg:text-lg font-normal leading-tight">
              CONFERENCIA JUVENIL<br/>
              BAHIA BLANCA
            </p>
          </div>
          <div className="bg-[#CCFF00] px-6 py-2 rounded">
            <span className="text-[#8B3FFF] font-black text-2xl lg:text-3xl">
              JUVECONFE
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
