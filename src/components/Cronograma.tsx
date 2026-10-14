import '@fontsource/poppins/300.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '../styles/cronograma.css';

// Cronograma de la conferencia (pieza C/a4475ab6-…jpeg), maquetado en HTML para que
// se lea bien en cualquier pantalla. Para cambiar horarios, editar DAYS.

interface Activity {
  name: string;
  detail?: string;
  time: string;
}

interface Day {
  number: string;
  weekday: string;
  activities: Activity[];
}

const DAYS: Day[] = [
  {
    number: '20',
    weekday: 'Viernes',
    activities: [
      { name: 'Acreditación', time: '19 HS' },
      { name: 'Plenaria N°1', detail: '"INFLUENCIA"', time: '20 HS' },
      { name: 'Buffet', time: '21 HS' },
      { name: 'Fogón', detail: 'Donado 533', time: '22 HS' },
    ],
  },
  {
    number: '21',
    weekday: 'Sábado',
    activities: [
      { name: 'Deportes', detail: 'Zapiola 833', time: '09 HS' },
      { name: 'Taller', detail: '"Evangelismo y discípulado n°1"', time: '17 HS' },
      { name: 'Plenaria N°2', detail: '"IDENTIDAD"', time: '19 HS' },
      { name: 'Buffet', time: '21 HS' },
      { name: 'Fogón', detail: 'Donado 533', time: '22 HS' },
    ],
  },
  {
    number: '22',
    weekday: 'Domingo',
    activities: [
      { name: 'Cena del Señor', time: '09 HS' },
      { name: 'Taller', detail: '"Evangelismo y discípulado n°2"', time: '11 HS' },
      { name: 'Buffet', time: '12:30 HS' },
      { name: 'Fogón', detail: 'Donado 533', time: '14 HS' },
      { name: 'Plenaria N°3', detail: '"SACRIFICIO"', time: '19 HS' },
      { name: 'Buffet', time: '21:30 HS' },
    ],
  },
];

const VENUE = "O'Higgins 467, Bahía Blanca";

export default function Cronograma() {
  return (
    <section id="cronograma" className="crono" aria-labelledby="crono-title">
      <img src="/hero/cronograma-fondo.webp" alt="" aria-hidden="true" loading="lazy" className="crono__bg" />

      <div className="crono__inner">
        <h2 id="crono-title" className="crono__title">
          <span>Crono-</span>
          <span>grama</span>
        </h2>

        {DAYS.map((day) => (
          <div key={day.number} className="crono__day">
            <p className="crono__date">
              <span className="crono__number">{day.number}</span>
              <span className="crono__weekday">{day.weekday}</span>
            </p>
            <span aria-hidden="true" className="crono__rule" />
            <ul className="crono__list" aria-label={`${day.weekday} ${day.number}`}>
              {day.activities.map((a, i) => (
                <li key={i} className="crono__item">
                  <span className="crono__name">
                    {a.name}
                    {a.detail && <span className="crono__detail">{a.detail}</span>}
                  </span>
                  <span className="crono__time">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="crono__footer">
          <span className="crono__tag">JUVECONFE2026</span>
          <a
            className="crono__venue"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="crono__pin">
              <path
                fill="currentColor"
                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
              />
            </svg>
            <span>
              O'Higgins 467
              <br />
              Bahía Blanca
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
