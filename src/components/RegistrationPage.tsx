import { useEffect, useState } from 'react';
import RegistrationForm from './RegistrationForm';
import FireBackground from './FireBackground';
import { fetchMealsConfig, fetchPublishedPackages, type Package } from '../lib/combos';
import type { MealsConfig } from '../lib/meals';

const BACK_HREF = '/#inscripcion';

/** Página /inscripcion?combo=<id>: registro de entrada del combo elegido */
export default function RegistrationPage() {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [meals, setMeals] = useState<MealsConfig | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const comboId = new URLSearchParams(window.location.search).get('combo');
    const eventId = import.meta.env.PUBLIC_EVENT_ID;
    const apiUrl = import.meta.env.PUBLIC_API_URL;

    const load = async () => {
      try {
        if (!comboId) throw new Error('Elegí un combo para inscribirte.');
        if (!eventId) throw new Error('Evento no configurado');
        // Las comidas se esperan junto con el combo para que el formulario no cambie de modo una vez abierto
        const [combos, mealsConfig] = await Promise.all([
          fetchPublishedPackages(apiUrl, eventId),
          fetchMealsConfig(apiUrl, eventId),
        ]);
        const found = combos.find((c) => c.id === comboId);
        if (!found) throw new Error('Ese combo ya no está disponible.');
        setPkg(found);
        setMeals(found.mealsEnabled ? mealsConfig : null);
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar la inscripción.');
      }
    };
    load();
  }, []);

  const goBack = () => {
    window.location.href = BACK_HREF;
  };

  if (pkg) return <RegistrationForm selectedPackage={pkg} meals={meals} onBack={goBack} />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">
      <FireBackground />
      <div className="relative z-10 text-center space-y-4">
        {error ? (
          <>
            <p className="text-white/85">{error}</p>
            <a href={BACK_HREF} className="inline-block bg-[#C46810] hover:bg-[#e3832a] text-white font-semibold py-3 px-6 rounded-lg">
              Ver combos
            </a>
          </>
        ) : (
          <p className="text-white/70">Cargando…</p>
        )}
      </div>
    </main>
  );
}
