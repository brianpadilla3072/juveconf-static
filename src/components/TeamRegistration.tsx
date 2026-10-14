import { useEffect, useMemo, useState } from 'react';
import {
  createTeam,
  editLink,
  fetchTeam,
  fetchTeamTypes,
  filledPlayers,
  updateTeam,
  type TeamPlayerInput,
  type TeamTypeOption,
  type TeamView,
} from '../lib/teams';

const primaryButtonClass =
  'w-full flex items-center justify-center gap-3 bg-[#8B3FFF] hover:bg-[#7A35E6] text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg border-2 border-[#8B3FFF]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
const secondaryButtonClass =
  'flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const inputClass =
  'w-full bg-black/40 border border-white/30 rounded-lg px-3 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#8B3FFF]';
const panelClass = 'bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 p-4 space-y-3';
const labelClass = 'block text-sm text-white/80 mb-1';

const emptyPlayer = (): TeamPlayerInput => ({ firstName: '', lastName: '' });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Mode = 'loading' | 'create' | 'edit' | 'created' | 'error';

export default function TeamRegistration() {
  const [mode, setMode] = useState<Mode>('loading');
  const [loadError, setLoadError] = useState('');
  const [types, setTypes] = useState<TeamTypeOption[]>([]);
  const [typeId, setTypeId] = useState('');
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [players, setPlayers] = useState<TeamPlayerInput[]>([emptyPlayer()]);
  const [team, setTeam] = useState<TeamView | null>(null);
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const fillForm = (t: TeamView) => {
    setName(t.name);
    setLeaderName(t.leaderName);
    setLeaderPhone(t.leaderPhone);
    setLeaderEmail(t.leaderEmail ?? '');
    setPlayers(t.players.length ? t.players : [emptyPlayer()]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const tk = params.get('token');

    const load = async () => {
      try {
        if (id && tk) {
          const t = await fetchTeam(id, tk);
          setTeam(t);
          setToken(tk);
          fillForm(t);
          setMode('edit');
          return;
        }
        const eventId = import.meta.env.PUBLIC_EVENT_ID;
        if (!eventId) throw new Error('Evento no configurado');
        const list = await fetchTeamTypes(eventId);
        setTypes(list);
        setTypeId(list.find((t) => !t.full)?.id ?? '');
        setMode('create');
      } catch (e: any) {
        setLoadError(e?.message || 'No se pudo cargar la página');
        setMode('error');
      }
    };
    load();
  }, []);

  // Un error de validación viejo no debe quedar visible una vez que se edita el formulario
  useEffect(() => {
    setError('');
  }, [typeId, name, leaderName, leaderPhone, leaderEmail, players]);

  const currentType = useMemo(() => {
    if (mode === 'edit' && team) return { ...team.teamType, remaining: null, full: false };
    return types.find((t) => t.id === typeId) ?? null;
  }, [mode, team, types, typeId]);

  const filled = filledPlayers(players).length;
  const max = currentType?.maxPlayers ?? 10;
  const min = currentType?.minPlayers ?? 1;
  const canAdd = players.length < max;

  const setPlayer = (i: number, patch: Partial<TeamPlayerInput>) =>
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const removePlayer = (i: number) =>
    setPlayers((prev) => (prev.length <= 1 ? [emptyPlayer()] : prev.filter((_, idx) => idx !== i)));

  const validate = (): string | null => {
    if (mode === 'create' && !currentType) return 'Elegí un tipo de equipo';
    if (name.trim().length < 2) return 'Poné un nombre al equipo';
    if (leaderName.trim().length < 2) return 'Completá el nombre del líder';
    if (leaderPhone.trim().length < 6) return 'Completá un teléfono de contacto';
    const rows = filledPlayers(players);
    if (rows.some((p) => !p.firstName.trim() || !p.lastName.trim())) {
      return 'Cada participante necesita nombre y apellido';
    }
    if (rows.length < min) return `Este equipo necesita al menos ${plural(min, 'participante', 'participantes')}`;
    if (rows.length > max) return `Este equipo admite como máximo ${plural(max, 'participante', 'participantes')}`;
    return null;
  };

  const payload = () => ({
    name: name.trim(),
    leaderName: leaderName.trim(),
    leaderPhone: leaderPhone.trim(),
    ...(leaderEmail.trim() ? { leaderEmail: leaderEmail.trim() } : {}),
    players: filledPlayers(players).map((p) => ({
      ...(p.id ? { id: p.id } : {}),
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
    })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const problem = validate();
    if (problem) return setError(problem);

    setSubmitting(true);
    try {
      if (mode === 'edit' && team) {
        const updated = await updateTeam(team.id, token, payload());
        setTeam(updated);
        fillForm(updated);
        setNotice('¡Cambios guardados!');
      } else {
        const created = await createTeam(typeId, payload());
        setTeam(created);
        setToken(created.editToken ?? '');
        setMode('created');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const link = team && token ? editLink(window.location.origin, team.id, token) : '';
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el link queda visible para copiarlo a mano */
    }
  };

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <a href="/" className="text-sm text-white/60 hover:text-white">
          ← Volver
        </a>
        {children}
      </div>
    </main>
  );

  if (mode === 'loading') return shell(<p className="text-white/70">Cargando…</p>);

  if (mode === 'error') {
    return shell(
      <div className={panelClass}>
        <p className="text-red-300">{loadError}</p>
      </div>,
    );
  }

  if (mode === 'created' && team) {
    return shell(
      <>
        <h1 className="text-3xl font-bold text-[#CCFF00]">¡Equipo inscripto!</h1>
        <div className={panelClass}>
          <p className="font-medium">
            {team.name} · {team.teamType.name}
          </p>
          <ul className="text-white/80 text-sm list-disc pl-5">
            {team.players.map((p) => (
              <li key={p.id}>
                {p.firstName} {p.lastName}
              </li>
            ))}
          </ul>
        </div>
        <div className={panelClass}>
          <h2 className="font-medium">Guardá este link</h2>
          <p className="text-sm text-white/70">
            Con este link privado podés corregir el nombre del equipo o los participantes más adelante. Quien lo tenga
            puede editar el equipo.
          </p>
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={inputClass} />
          <button type="button" onClick={copyLink} className={secondaryButtonClass}>
            {copied ? '¡Copiado!' : 'Copiar link'}
          </button>
        </div>
      </>,
    );
  }

  return shell(
    <>
      <h1 className="text-3xl font-bold text-[#CCFF00]">
        {mode === 'edit' ? 'Editar mi equipo' : 'Inscribir mi equipo'}
      </h1>

      <form onSubmit={submit} className="space-y-6" noValidate>
        {mode === 'create' && (
          <div className={panelClass}>
            <label className={labelClass} htmlFor="teamType">
              Tipo de equipo
            </label>
            {types.length === 0 ? (
              <p className="text-white/70 text-sm">Por ahora no hay inscripciones de equipos abiertas.</p>
            ) : (
              <select id="teamType" value={typeId} onChange={(e) => setTypeId(e.target.value)} className={inputClass}>
                {types.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.full} className="text-black">
                    {t.name}
                    {t.full ? ' — Completo' : t.remaining !== null ? ` — quedan ${plural(t.remaining, 'cupo', 'cupos')}` : ''}
                  </option>
                ))}
              </select>
            )}
            {currentType?.description && <p className="text-sm text-white/70">{currentType.description}</p>}
            {currentType && currentType.price > 0 && (
              <p className="text-sm text-white/70">Inscripción: ${currentType.price.toLocaleString('es-AR')}</p>
            )}
          </div>
        )}

        {mode === 'edit' && team && (
          <p className="text-white/70 text-sm">
            Categoría: <span className="text-white">{team.teamType.name}</span>
          </p>
        )}

        {(mode === 'edit' || types.length > 0) && (
          <>
            <div className={panelClass}>
              <div>
                <label className={labelClass} htmlFor="teamName">
                  Nombre del equipo
                </label>
                <input id="teamName" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="leaderName">
                  Líder del equipo (nombre y apellido)
                </label>
                <input id="leaderName" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} maxLength={80} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="leaderPhone">
                    Teléfono
                  </label>
                  <input id="leaderPhone" type="tel" value={leaderPhone} onChange={(e) => setLeaderPhone(e.target.value)} maxLength={30} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="leaderEmail">
                    Email (opcional)
                  </label>
                  <input id="leaderEmail" type="email" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} maxLength={120} className={inputClass} />
                </div>
              </div>
            </div>

            <div className={panelClass}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">Participantes</h2>
                <span className="text-sm text-white/70">
                  {filled} de {max} · mínimo {min}
                </span>
              </div>
              {players.map((p, i) => (
                <div key={p.id ?? i} className="flex items-center gap-2">
                  <span className="w-6 text-right text-white/50 text-sm">{i + 1}.</span>
                  <input
                    aria-label={`Nombre del participante ${i + 1}`}
                    placeholder="Nombre"
                    value={p.firstName}
                    onChange={(e) => setPlayer(i, { firstName: e.target.value })}
                    maxLength={60}
                    className={inputClass}
                  />
                  <input
                    aria-label={`Apellido del participante ${i + 1}`}
                    placeholder="Apellido"
                    value={p.lastName}
                    onChange={(e) => setPlayer(i, { lastName: e.target.value })}
                    maxLength={60}
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removePlayer(i)} aria-label={`Quitar participante ${i + 1}`} className={secondaryButtonClass}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setPlayers((prev) => [...prev, emptyPlayer()])} disabled={!canAdd} className={secondaryButtonClass}>
                + Agregar participante
              </button>
              {!canAdd && <p className="text-xs text-white/60">Llegaste al máximo de {max} participantes.</p>}
            </div>

            {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
            {notice && <p role="status" className="text-[#CCFF00] text-sm">{notice}</p>}

            <button type="submit" disabled={submitting || (mode === 'create' && !currentType)} className={primaryButtonClass}>
              {submitting ? 'Enviando…' : mode === 'edit' ? 'Guardar cambios' : 'Inscribir equipo'}
            </button>
          </>
        )}
      </form>
    </>,
  );
}
