import { useEffect, useState } from 'react';
import { fetchTeamTypes } from '../lib/teams';

/** Botón "Inscribir mi equipo": solo aparece si hay tipos de equipo activos y publicados. */
export default function TeamsButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const eventId = import.meta.env.PUBLIC_EVENT_ID;
    if (!eventId) return;
    fetchTeamTypes(eventId)
      .then((types) => setVisible(types.length > 0))
      .catch(() => setVisible(false));
  }, []);

  if (!visible) return null;

  return (
    <section className="w-full bg-black py-10 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <h2 className="text-[#CCFF00] text-2xl lg:text-3xl font-bold">¿Querés competir con tu equipo?</h2>
        <p className="text-white/80 text-sm lg:text-base">Vóley, fútbol, juegos de mesa y más. Un líder inscribe al equipo.</p>
        <a
          href="/equipos"
          className="inline-flex items-center justify-center bg-[#8B3FFF] hover:bg-[#7A35E6] text-white font-bold text-lg py-4 px-8 rounded-lg shadow-lg border-2 border-[#8B3FFF]/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          Inscribir mi equipo
        </a>
      </div>
    </section>
  );
}
