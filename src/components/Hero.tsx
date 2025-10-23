export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Capa 1: Fondo base negro texturizado (siempre visible) */}
      <img
        src="/bg-texture-dark.png"
        alt="Fondo texturizado"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Capa 2: Desktop - Imagen principal */}
      <img
        src="/hero-desktop.jpg"
        alt="JUVECONF Desktop"
        className="hidden lg:block absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
      />

      {/* Capa 2: Mobile/Tablet - Imagen principal */}
      <img
        src="/hero-mobile.png"
        alt="JUVECONF Mobile"
        className="lg:hidden absolute inset-0 w-full h-full object-contain"
        style={{
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
        }}
      />

      {/* Capa 3: Degradados superior e inferior para suavizar uniones (solo mobile/tablet) */}
      <div
        className="lg:hidden absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 15%, transparent 87%, rgb(0, 0, 0) 100%)'
        }}
      />
    </section>
  );
}
