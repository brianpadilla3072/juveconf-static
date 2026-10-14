import '../styles/hero.css';

// Portada "Consumidos en el altar" (diseño C/C.png). El fondo es el del diseño sin los
// textos, y cada texto es una capa (exportada de los SVG del diseño) ubicada en las mismas
// coordenadas del póster. El posicionamiento está en src/styles/hero.css.

export default function Hero() {
  return (
    <section className="hero text-white">
      <h1 className="sr-only">JUVECONFE 2026 — Consumidos en el altar (Romanos 12:1)</h1>

      <img src="/hero/fondo.webp" alt="" aria-hidden="true" fetchPriority="high" className="hero__bg" />
      <div aria-hidden="true" className="hero__shade" />
      <div aria-hidden="true" className="hero__fade" />

      <img src="/hero/juveconfe.webp" alt="JUVECONFE" className="hero__layer hero__brand" />
      <img
        src="/hero/consumidos.webp"
        alt="Consumidos en el altar — Romanos 12:1"
        className="hero__layer hero__logo"
      />

      <div className="hero__info">
        <img src="/hero/fecha.webp" alt="21 al 23 de noviembre, Bahía Blanca" className="hero__fecha" />
        <span aria-hidden="true" className="hero__divider" />
        <img src="/hero/orador.webp" alt="Orador: Marcos Arévalo" className="hero__orador" />
      </div>

      {/* Iglesias organizadoras: fila extraída del diseño (logos + divisores) */}
      <img
        src="/hero/iglesias.webp"
        alt="Iglesias organizadoras: Vida Eterna, ICE Cerri e ICE Chiclana"
        className="hero__layer hero__churches"
      />

    </section>
  );
}
