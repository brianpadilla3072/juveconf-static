import '../styles/fire-background.css';

interface FireBackgroundProps {
  /** Punto de la imagen que queda a la vista (object-position). Por defecto, las brasas. */
  focus?: string;
}

/**
 * Fondo del sitio con la fogata del diseño "Consumidos en el altar".
 * Usar dentro de un contenedor `relative overflow-hidden`, con el contenido en `relative z-10`.
 */
export default function FireBackground({ focus }: FireBackgroundProps) {
  return (
    <div className="fire-bg" aria-hidden="true" style={focus ? ({ '--fire-bg-focus': focus } as React.CSSProperties) : undefined}>
      <img src="/hero/brasas.webp" alt="" loading="lazy" className="fire-bg__img" />
      <div className="fire-bg__shade" />
    </div>
  );
}
