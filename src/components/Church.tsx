export default function Church() {
  const churches = [
    { id: 1, name: "IGLESIA 1", icon: "/icons/church1.svg" },
    { id: 2, name: "IGLESIA 2", icon: "/icons/church2.svg" },
    { id: 3, name: "IGLESIA 3", icon: "/icons/church3.svg" }
  ];

  return (
    <section className="relative w-full h-[200px] overflow-hidden bg-black">
      {/* Fondo texturizado */}
      <img
        src="/hero-background.webp"
        alt="Fondo texturizado"
        className="absolute inset-0 w-full h-full "
        style={{ zIndex: 0 ,objectFit: "unset"}}
      />

      {/* Degradados superior e inferior */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 w-full h-full flex items-center  gap-8 md:gap-12" style={{ padding: '0 20px' ,justifyContent: "space-around"}}>
        {/* Grid de Iglesias */}
        {churches.map((church) => (
          <div key={church.id} className="flex items-center justify-center group">
            {/* SVG de Iglesia */}
            <img
              src={church.icon}
              alt={church.name}
              className="w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
