// Inscripción de equipos: tipos y llamadas a la API (sin dependencias de React).

export interface TeamTypeOption {
  id: string;
  name: string;
  description: string | null;
  minPlayers: number;
  maxPlayers: number;
  price: number;
  /** null = sin límite de equipos */
  remaining: number | null;
  full: boolean;
}

export interface TeamPlayerInput {
  id?: string;
  firstName: string;
  lastName: string;
}

export interface TeamView {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail: string | null;
  teamType: { id: string; name: string; minPlayers: number; maxPlayers: number };
  players: Required<TeamPlayerInput>[];
  /** Solo viene al crear el equipo */
  editToken?: string;
}

export interface TeamPayload {
  name: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail?: string;
  players: TeamPlayerInput[];
}

const apiUrl = () => import.meta.env.PUBLIC_API_URL || 'http://localhost:3072';

async function readError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    const msg = Array.isArray(data?.message) ? data.message.join('. ') : data?.message;
    return new Error(msg || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchTeamTypes(eventId: string): Promise<TeamTypeOption[]> {
  const res = await fetch(`${apiUrl()}/teams/public/types?eventId=${encodeURIComponent(eventId)}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw await readError(res, 'No se pudieron cargar los tipos de equipo');
  return res.json();
}

export async function createTeam(teamTypeId: string, payload: TeamPayload): Promise<TeamView> {
  const res = await fetch(`${apiUrl()}/teams/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamTypeId, ...payload }),
  });
  if (!res.ok) throw await readError(res, 'No se pudo inscribir el equipo');
  return res.json();
}

export async function fetchTeam(id: string, token: string): Promise<TeamView> {
  const res = await fetch(`${apiUrl()}/teams/public/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw await readError(res, 'No se encontró el equipo. Revisá el link.');
  return res.json();
}

export async function updateTeam(id: string, token: string, payload: Partial<TeamPayload>): Promise<TeamView> {
  const res = await fetch(`${apiUrl()}/teams/public/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await readError(res, 'No se pudo guardar el equipo');
  return res.json();
}

/** Link privado para que el líder edite su equipo */
export function editLink(origin: string, id: string, token: string): string {
  return `${origin}/equipos?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
}

/** Cantidad de filas con datos (ignora filas vacías) */
export function filledPlayers(players: TeamPlayerInput[]): TeamPlayerInput[] {
  return players.filter((p) => p.firstName.trim() || p.lastName.trim());
}
