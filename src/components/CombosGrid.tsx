import { useState, useEffect } from 'react';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '../styles/inscripcion.css';
import FireBackground from './FireBackground';
import { fetchTeamTypes, type TeamTypeOption } from '../lib/teams';
import type { MealsConfig } from '../lib/meals';
import { fetchMealsConfig, fetchPublishedPackages, registrationHref, type Package } from '../lib/combos';

export default function CombosGrid() {
  const [combos, setCombos] = useState<Package[]>([]);
  const [meals, setMeals] = useState<MealsConfig | null>(null);
  const [teamTypes, setTeamTypes] = useState<TeamTypeOption[]>([]);
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

        const [mappedCombos, mealsConfig, teams] = await Promise.all([
          fetchPublishedPackages(apiUrl, eventId),
          fetchMealsConfig(apiUrl, eventId),
          // Los equipos son opcionales: si falla, simplemente no se muestra su tarjeta
          fetchTeamTypes(eventId).catch(() => [] as TeamTypeOption[]),
        ]);

        setCombos(mappedCombos);
        setMeals(mealsConfig);
        setTeamTypes(teams);
      } catch (err: any) {
        console.error('Error fetching combos:', err);
        setError(err.message || 'Error al cargar los combos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, []);


  // No renderizar nada si hay error
  if (error) {
    console.error('CombosGrid error:', error);
    return null;
  }

  // No renderizar nada si no hay combos ni inscripción de equipos (después de cargar)
  if (!isLoading && combos.length === 0 && teamTypes.length === 0) {
    return null;
  }

  // Mientras carga, no renderizar nada (opcional: podría mostrar loading)
  if (isLoading) {
    return null;
  }
  const allTeamsFree = teamTypes.every((t) => t.price === 0);

  return (
    <section id="inscripcion" className="insc" aria-labelledby="insc-title">
      <FireBackground />

      <div className="insc__inner">
        <header className="insc__header">
          <h2 id="insc-title" className="insc__title">Inscripción</h2>
          <blockquote className="insc__verse">
            "Amados hermanos, les ruego que entreguen su cuerpo a Dios por todo lo que él ha hecho a favor de ustedes.
            Que sea un sacrificio vivo y santo, la clase de sacrificio que a él le agrada. Esa es la verdadera forma de
            adorarlo."
            <cite>ROMANOS 12:1 · NTV</cite>
          </blockquote>
        </header>

        <div className="insc__grid">
          {combos.map((paquete, index) => (
            <a
              key={paquete.id}
              href={registrationHref(paquete.id)}
              className="insc-card"
              style={{ animationDelay: `${0.15 + index * 0.12}s` }}
            >
              <h3 className="insc-card__title">{paquete.titulo}</h3>
              {paquete.descripcion && <p className="insc-card__desc">{paquete.descripcion}</p>}

              <div className="insc-card__price">
                <span className="insc-card__amount">${paquete.precio.toLocaleString('es-AR')}</span>
                {paquete.gratuito && <span className="insc-card__tag">/GRATUITO</span>}
              </div>

              {paquete.caracteristicas.length > 0 && (
                <ul className="insc-card__features">
                  {paquete.caracteristicas.map((caracteristica, i) => (
                    <li key={i}>
                      <CheckIcon />
                      <span>{caracteristica}</span>
                    </li>
                  ))}
                </ul>
              )}

              <span className="insc-card__cta">
                Inscribirme
                <span className="insc-card__arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </span>
            </a>
          ))}

          {teamTypes.length > 0 && (
            <a href="/equipos" className="insc-card" style={{ animationDelay: `${0.15 + combos.length * 0.12}s` }}>
              <h3 className="insc-card__title">Inscripción de equipos</h3>
              <p className="insc-card__desc">
                ¿Querés competir con tu equipo? Un líder inscribe al equipo y carga a los participantes.
              </p>

              <div className="insc-card__price">
                <span className="insc-card__amount">
                  {allTeamsFree ? 'GRATIS' : `DESDE $${Math.min(...teamTypes.map((t) => t.price)).toLocaleString('es-AR')}`}
                </span>
              </div>

              <ul className="insc-card__features">
                {teamTypes.map((t) => (
                  <li key={t.id} className={t.full ? 'insc-card__muted' : undefined}>
                    <CheckIcon />
                    <span>
                      {t.name}
                      {t.full ? ' — completo' : ''}
                    </span>
                  </li>
                ))}
              </ul>

              <span className="insc-card__cta">
                Inscribir mi equipo
                <span className="insc-card__arrow" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </span>
            </a>
          )}
        </div>

        <footer className="insc__footer">
          <img src="/hero/juveconfe.webp" alt="JUVECONFE" className="insc__brand" loading="lazy" />
        </footer>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg className="insc-card__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
