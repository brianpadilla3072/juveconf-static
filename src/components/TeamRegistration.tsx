import { useEffect, useMemo, useState } from 'react';
import FireBackground from './FireBackground';
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

// Misma identidad visual que el Registro de Entrada (RegistrationForm)
const primaryButtonClass =
  'w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] hover:from-[#7A35E6] hover:to-[#7A35E6] text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg border-2 border-[#8B3FFF]/20 hover:border-[#8B3FFF]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
const secondaryButtonClass =
  'flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const inputClass =
  'flex h-11 w-full bg-black/20 text-white/90 placeholder-white/40 backdrop-blur-sm px-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors outline-none';
const panelClass = 'space-y-4 border border-white/20 p-6 rounded-lg';
const panelTitleClass = 'text-lg font-medium text-white/90';
const panelHintClass = 'text-sm text-white/60';
const labelClass = 'block text-sm font-medium text-white/90 mb-2';

const emptyPlayer = (): TeamPlayerInput => ({ firstName: '', lastName: '' });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Mode = 'loading' | 'create' | 'edit' | 'created' | 'error';

export default function TeamRegistration() {
  const [mode, setMode] = useState<Mode>('loading');
  const [loadError, setLoadError] = useState('');
  const [types, setTypes] = useState<TeamTypeOption[]>([]);
  const [typeId, setTypeId] = useState('');
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<TeamPlayerInput[]>([emptyPlayer()]);
  const [team, setTeam] = useState<TeamView | null>(null);
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const fillForm = (t: TeamView) => {
    setName(t.name);
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
  }, [typeId, name, players]);

  const currentType = useMemo(() => {
    if (mode === 'edit' && team) return { ...team.teamType, description: null, price: 0, remaining: null, full: false };
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

  // Encabezado y contenedor iguales al Registro de Entrada
  const shell = (title: string, subtitle: string, children: React.ReactNode) => (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <FireBackground />
      <div className="relative z-10 p-4 sm:p-6 md:p-10">
        <div className="max-w-3xl mx-auto bg-black/10 rounded-2xl shadow-xl border border-white/30 p-5 sm:p-8 backdrop-blur-xs">
          <div className="flex flex-col space-y-1.5 pb-2 mb-4">
            <a href="/#inscripcion" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 self-start transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Volver</span>
            </a>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white break-words">{title}</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] rounded-full my-3 m-auto" />
            {subtitle && <p className="text-sm text-center text-white/80">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );

  if (mode === 'loading') return shell('Inscribir mi equipo', '', <p className="text-center text-white/70 py-6">Cargando…</p>);

  if (mode === 'error') {
    return shell(
      'Inscribir mi equipo',
      '',
      <div className={panelClass}>
        <p className="text-red-300">{loadError}</p>
      </div>,
    );
  }

  if (mode === 'created' && team) {
    return shell(
      '¡Equipo inscripto!',
      `${team.name} · ${team.teamType.name}`,
      <div className="space-y-6">
        <div className={panelClass}>
          <h2 className={panelTitleClass}>Participantes</h2>
          <ol className="text-white/85 text-sm list-decimal pl-5 space-y-1">
            {team.players.map((p) => (
              <li key={p.id}>
                {p.firstName} {p.lastName}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-3 p-4 rounded-lg border border-[#8B3FFF]/60 bg-gradient-to-r from-[#8B3FFF]/25 to-[#8B3FFF]/10">
          <h2 className={panelTitleClass}>Guardá este link</h2>
          <p className="text-sm text-white/80">
            Con este link privado podés corregir el nombre del equipo o los participantes más adelante. Quien lo tenga
            puede editar el equipo.
          </p>
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={inputClass} />
          <button type="button" onClick={copyLink} className={secondaryButtonClass}>
            {copied ? '¡Copiado!' : 'Copiar link'}
          </button>
        </div>
      </div>,
    );
  }

  return shell(
    mode === 'edit' ? 'Editar mi equipo' : 'Inscribir mi equipo',
    mode === 'edit' && team ? `Categoría: ${team.teamType.name}` : 'Elegí la categoría y cargá a los participantes',
    <form onSubmit={submit} className="space-y-6" noValidate>
      {mode === 'create' && (
        <fieldset className={panelClass}>
          <legend className="sr-only">Categoría</legend>
          <div className="space-y-1">
            <h2 className={panelTitleClass}>Categoría</h2>
            <p className={panelHintClass}>¿En qué vas a competir?</p>
          </div>
          {types.length === 0 ? (
            <p className="text-white/70 text-sm">Por ahora no hay inscripciones de equipos abiertas.</p>
          ) : (
            <div role="radiogroup" aria-label="Categoría" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((t) => {
                const selected = t.id === typeId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={t.full}
                    onClick={() => setTypeId(t.id)}
                    className={`flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      selected
                        ? 'border-[#8B3FFF] bg-gradient-to-r from-[#8B3FFF]/35 to-[#8B3FFF]/15 text-white'
                        : 'border-white/15 bg-black/20 text-white/85 hover:border-white/30'
                    }`}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-white/60 whitespace-nowrap">
                      {t.full ? 'Completo' : t.remaining !== null ? plural(t.remaining, 'cupo', 'cupos') : `hasta ${t.maxPlayers}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {currentType?.description && <p className="text-sm text-white/70">{currentType.description}</p>}
          {currentType && currentType.price > 0 && (
            <p className="text-sm text-white/70">Inscripción: ${currentType.price.toLocaleString('es-AR')}</p>
          )}
        </fieldset>
      )}

      {(mode === 'edit' || types.length > 0) && (
        <>
          <div className={panelClass}>
            <label className={labelClass} htmlFor="teamName">
              Nombre del equipo
            </label>
            <input id="teamName" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ej: Las Panteras" className={inputClass} />
          </div>

          <div className={panelClass}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="space-y-1">
                <h2 className={panelTitleClass}>Participantes</h2>
                <p className={panelHintClass}>Nombre y apellido de cada uno</p>
              </div>
              <span className="text-sm text-white/70 whitespace-nowrap">
                {filled} de {max} · mín. {min}
              </span>
            </div>
            {players.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-[#8B3FFF] text-sm font-semibold">{i + 1}.</span>
                <input
                  aria-label={`Nombre del participante ${i + 1}`}
                  placeholder="Nombre"
                  value={p.firstName}
                  onChange={(e) => setPlayer(i, { firstName: e.target.value })}
                  maxLength={60}
                  className={`${inputClass} min-w-0`}
                />
                <input
                  aria-label={`Apellido del participante ${i + 1}`}
                  placeholder="Apellido"
                  value={p.lastName}
                  onChange={(e) => setPlayer(i, { lastName: e.target.value })}
                  maxLength={60}
                  className={`${inputClass} min-w-0`}
                />
                <button type="button" onClick={() => removePlayer(i)} aria-label={`Quitar participante ${i + 1}`} className={`${secondaryButtonClass} h-11 shrink-0`}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setPlayers((prev) => [...prev, emptyPlayer()])} disabled={!canAdd} className={secondaryButtonClass}>
              + Agregar participante
            </button>
            {!canAdd && <p className="text-xs text-white/60">Llegaste al máximo de {max} participantes.</p>}
          </div>

          {error && (
            <p role="alert" className="text-sm text-white p-3 rounded-lg border border-red-400/60 bg-red-500/15">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-white p-3 rounded-lg border border-[#8B3FFF]/60 bg-[#8B3FFF]/20">
              {notice}
            </p>
          )}

          <button type="submit" disabled={submitting || (mode === 'create' && !currentType)} className={primaryButtonClass}>
            {submitting ? 'Enviando…' : mode === 'edit' ? 'Guardar cambios' : 'Inscribir equipo'}
          </button>
        </>
      )}
    </form>,
  );
}
