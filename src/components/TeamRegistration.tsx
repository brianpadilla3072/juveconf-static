import { useEffect, useMemo, useState } from 'react';
import FireBackground from './FireBackground';
import {
  createTeam,
  createTeamOrder,
  editLink,
  fetchTeam,
  fetchTeamTypes,
  filledPlayers,
  orderConfirmationHref,
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
const money = (value: number) => `$${value.toLocaleString('es-AR')}`;

type Mode = 'loading' | 'create' | 'edit' | 'created' | 'error';

export default function TeamRegistration() {
  const [mode, setMode] = useState<Mode>('loading');
  const [loadError, setLoadError] = useState('');
  const [types, setTypes] = useState<TeamTypeOption[]>([]);
  const [typeId, setTypeId] = useState('');
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<TeamPlayerInput[]>([emptyPlayer()]);
  const [leaderName, setLeaderName] = useState('');
  const [leaderCuil, setLeaderCuil] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
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
  }, [typeId, name, players, leaderName, leaderCuil, leaderEmail, leaderPhone]);

  const currentType = useMemo(() => {
    if (mode === 'edit' && team) return { ...team.teamType, description: null, price: 0, remaining: null, full: false };
    return types.find((t) => t.id === typeId) ?? null;
  }, [mode, team, types, typeId]);

  const filled = filledPlayers(players).length;
  const max = currentType?.maxPlayers ?? 10;
  const min = currentType?.minPlayers ?? 1;
  const canAdd = players.length < max;
  // Las categorías gratuitas se inscriben al instante; las pagas generan una orden de transferencia
  const isPaid = !!currentType && currentType.price > 0;

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
    // Los datos del responsable solo son necesarios para procesar el pago de las categorías pagas
    if (mode === 'create' && isPaid) {
      if (leaderName.trim().length < 2) return 'Escribí el nombre y apellido del responsable del equipo';
      if (!/^\d{7,11}$/.test(leaderCuil.replace(/\D/g, ''))) return 'Revisá el DNI del responsable (7 a 11 números)';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leaderEmail.trim())) return 'Revisá el email del responsable';
      if (leaderPhone.replace(/\D/g, '').length < 6) return 'Revisá el teléfono del responsable';
    }
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
      } else if (isPaid) {
        // Inscripción con pago: se crea una orden y el equipo nace cuando se aprueba el pago
        const { orderID } = await createTeamOrder({
          teamTypeId: typeId,
          name: name.trim(),
          leaderName: leaderName.trim(),
          leaderCuil: leaderCuil.replace(/\D/g, ''),
          leaderEmail: leaderEmail.trim(),
          leaderPhone: leaderPhone.trim(),
          players: payload().players,
        });
        window.location.href = orderConfirmationHref(orderID);
      } else {
        // Categoría gratuita: el equipo se crea al instante, sin pedir datos del responsable
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
    mode === 'edit' && team
      ? `Categoría: ${team.teamType.name}`
      : isPaid
        ? 'Elegí la categoría, cargá a los participantes y pagá la inscripción'
        : 'Elegí la categoría y cargá a los participantes',
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
            <p className="text-sm text-white/70">
              Inscripción: <strong className="text-white">{money(currentType.price)}</strong> por equipo
            </p>
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

          {mode === 'create' && isPaid && (
            <fieldset className={panelClass}>
              <div className="space-y-1">
                <h2 className={panelTitleClass}>Responsable del equipo</h2>
                <p className={panelHintClass}>Con estos datos te avisamos cuando se acredite el pago y te mandamos el link para editar el equipo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="leaderName">
                    Nombre y apellido
                  </label>
                  <input id="leaderName" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} maxLength={80} placeholder="Ej: Ana Pérez" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="leaderCuil">
                    DNI
                  </label>
                  <input id="leaderCuil" value={leaderCuil} onChange={(e) => setLeaderCuil(e.target.value)} inputMode="numeric" maxLength={11} placeholder="Sin puntos" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="leaderEmail">
                    Email
                  </label>
                  <input id="leaderEmail" type="email" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} maxLength={120} placeholder="tu@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="leaderPhone">
                    Teléfono
                  </label>
                  <input id="leaderPhone" value={leaderPhone} onChange={(e) => setLeaderPhone(e.target.value)} inputMode="tel" maxLength={30} placeholder="Ej: 291 412 7933" className={inputClass} />
                </div>
              </div>
            </fieldset>
          )}

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

          {mode === 'create' && isPaid && currentType && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#8B3FFF]/60 bg-gradient-to-r from-[#8B3FFF]/25 to-[#8B3FFF]/10">
              <div>
                <p className="text-sm text-white/80">Total a pagar</p>
                <p className="text-xs text-white/60">El equipo queda inscripto cuando acreditamos el pago (aprox. 24 h).</p>
              </div>
              <span className="text-xl font-black text-white whitespace-nowrap">{money(currentType.price)}</span>
            </div>
          )}

          <button type="submit" disabled={submitting || (mode === 'create' && !currentType)} className={primaryButtonClass}>
            {submitting
              ? 'Enviando…'
              : mode === 'edit'
                ? 'Guardar cambios'
                : isPaid
                  ? 'Continuar: pagar inscripción'
                  : 'Confirmar inscripción'}
          </button>
        </>
      )}
    </form>,
  );
}
