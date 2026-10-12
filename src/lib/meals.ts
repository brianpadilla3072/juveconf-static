// Módulo de comidas: tipos y funciones puras (sin dependencias de React).
// El servidor es la autoridad de precios; acá solo se calcula una vista previa.

export interface MealOption {
  n: number;
  name: string;
  price: number;
}

export interface MealSlot {
  code: string;
  name: string;
  order: number;
  options: MealOption[];
}

export interface MealsConfig {
  slots: MealSlot[];
  /** Porcentaje de descuento por cantidad de comidas de una misma persona. Ej: { "2": 10, "3": 15 } */
  discountTiers: Record<string, number>;
}

export interface MealPick {
  slotCode: string;
  optionNumber: number;
}

export interface MealsQuoteItem {
  slotCode: string;
  slotName: string;
  optionNumber: number;
  optionName: string;
  price: number;
}

export interface MealsQuote {
  items: MealsQuoteItem[];
  /** Cantidad de comidas elegidas (una por franja como máximo). */
  count: number;
  subtotal: number;
  /** Porcentaje de descuento aplicado (0 si no corresponde). */
  percent: number;
  /** Monto descontado (subtotal - total). */
  discount: number;
  total: number;
}

/**
 * Cotiza las comidas de UNA persona.
 * - subtotal = suma de precios de las opciones elegidas
 * - percent = discountTiers[k] para la MAYOR clave k <= cantidad de comidas (0 si ninguna)
 * - total = Math.round(subtotal * (100 - percent) / 100)
 */
export function quoteMeals(picks: MealPick[], config: MealsConfig): MealsQuote {
  const items: MealsQuoteItem[] = [];
  const usedSlots = new Set<string>();

  for (const pick of picks) {
    if (usedSlots.has(pick.slotCode)) continue; // máximo una opción por franja
    const slot = config.slots.find((s) => s.code === pick.slotCode);
    const option = slot?.options.find((o) => o.n === pick.optionNumber);
    if (!slot || !option) continue;
    usedSlots.add(slot.code);
    items.push({
      slotCode: slot.code,
      slotName: slot.name,
      optionNumber: option.n,
      optionName: option.name,
      price: option.price,
    });
  }

  const count = items.length;
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  let percent = 0;
  let bestKey = 0;
  for (const [key, value] of Object.entries(config.discountTiers || {})) {
    const k = Number(key);
    if (Number.isFinite(k) && k <= count && k > bestKey) {
      bestKey = k;
      percent = Number(value) || 0;
    }
  }

  const total = Math.round((subtotal * (100 - percent)) / 100);
  return { items, count, subtotal, percent, discount: subtotal - total, total };
}

/** Próximo escalón de descuento por encima de `count` comidas (o null si ya está en el máximo). */
export function nextDiscountTier(count: number, tiers: Record<string, number>): { count: number; percent: number } | null {
  let next: { count: number; percent: number } | null = null;
  for (const [key, value] of Object.entries(tiers || {})) {
    const k = Number(key);
    if (Number.isFinite(k) && k > count && (!next || k < next.count)) {
      next = { count: k, percent: Number(value) || 0 };
    }
  }
  return next;
}

/** Valida y normaliza la respuesta de GET /meals/public/:eventId. Devuelve null si está deshabilitado o es inválida. */
export function parseMealsConfig(data: any): MealsConfig | null {
  if (!data || data.enabled !== true || !Array.isArray(data.slots)) return null;

  const slots: MealSlot[] = data.slots
    .filter((s: any) => s && typeof s.code === 'string' && Array.isArray(s.options) && s.options.length > 0)
    .map((s: any) => ({
      code: s.code,
      name: String(s.name ?? s.code),
      order: Number(s.order) || 0,
      options: s.options
        .map((o: any) => ({ n: Number(o.n), name: String(o.name ?? ''), price: Number(o.price) || 0 }))
        .sort((a: MealOption, b: MealOption) => a.n - b.n),
    }))
    .sort((a: MealSlot, b: MealSlot) => a.order - b.order);

  if (slots.length === 0) return null;

  const discountTiers: Record<string, number> = {};
  for (const [key, value] of Object.entries(data.discountTiers || {})) {
    if (Number.isFinite(Number(key)) && Number.isFinite(Number(value))) {
      discountTiers[key] = Number(value);
    }
  }

  return { slots, discountTiers };
}

/** Formato de moneda es-AR, igual al resto del sitio: $12.500 */
export function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR')}`;
}

// ---------------------------------------------------------------------------
// Datos de inscripción adicionales (solo cuando el evento tiene comidas)
// ---------------------------------------------------------------------------

export interface GuestExtra {
  group: string;
  lodgingNeeded: boolean;
  lodgingNights: string[]; // "FRI" | "SAT"
  dietary: string;
  emergencyName: string;
  emergencyPhone: string;
  guardianName: string;
  guardianDni: string;
  guardianPhone: string;
}

export type GuestExtraErrors = Partial<Record<keyof GuestExtra | 'phone' | 'birthdate', string>>;

export const LODGING_NIGHTS = [
  { code: 'FRI', label: 'Viernes' },
  { code: 'SAT', label: 'Sábado' },
] as const;

/** Edad en años cumplidos a la fecha `today` a partir de "YYYY-MM-DD". null si la fecha no es válida. */
export function calcAge(birthdate: string, today: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const born = new Date(year, month - 1, day);
  if (born.getFullYear() !== year || born.getMonth() !== month - 1 || born.getDate() !== day) return null;

  let age = today.getFullYear() - year;
  const hadBirthday =
    today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

export function isMinor(birthdate: string, today: Date = new Date()): boolean {
  const age = calcAge(birthdate, today);
  return age !== null && age >= 0 && age < 18;
}

const MIN_PHONE_LENGTH = 6;
const validPhone = (value: string) => value.trim().length >= MIN_PHONE_LENGTH;

/** Valida los datos que exige el servidor cuando el evento tiene comidas (los campos base ya se validan aparte). */
export function validateGuestExtras(
  guest: { phone: string; birthdate: string; extra: GuestExtra },
  today: Date = new Date(),
): GuestExtraErrors {
  const errors: GuestExtraErrors = {};
  const { extra } = guest;

  if (!validPhone(guest.phone)) {
    errors.phone = 'Ingresá un WhatsApp válido (mínimo 6 caracteres).';
  }

  const age = calcAge(guest.birthdate, today);
  if (age === null || age < 0 || age > 120) {
    errors.birthdate = 'Ingresá una fecha de nacimiento válida.';
  }

  if (!extra.emergencyName.trim()) errors.emergencyName = 'Ingresá el nombre del contacto de emergencia.';
  if (!validPhone(extra.emergencyPhone)) errors.emergencyPhone = 'Ingresá un teléfono válido (mínimo 6 caracteres).';

  if (extra.lodgingNeeded && extra.lodgingNights.length === 0) {
    errors.lodgingNights = 'Elegí al menos una noche.';
  }

  if (isMinor(guest.birthdate, today)) {
    if (!extra.guardianName.trim()) errors.guardianName = 'Ingresá el nombre del responsable.';
    if (!extra.guardianDni.trim()) errors.guardianDni = 'Ingresá el DNI del responsable.';
    if (!validPhone(extra.guardianPhone)) errors.guardianPhone = 'Ingresá un teléfono válido del responsable (mínimo 6 caracteres).';
  }

  return errors;
}

/** Campos extra que se suman al `metadata` del invitado cuando el evento tiene comidas. */
export function buildExtraMetadata(
  guest: { birthdate: string; extra: GuestExtra },
  today: Date = new Date(),
): Record<string, unknown> {
  const { extra } = guest;
  const metadata: Record<string, unknown> = {
    emergency: { name: extra.emergencyName.trim(), phone: extra.emergencyPhone.trim() },
    lodging: {
      needed: extra.lodgingNeeded,
      nights: extra.lodgingNeeded ? extra.lodgingNights : [],
    },
  };
  if (extra.group.trim()) metadata.group = extra.group.trim();
  if (extra.dietary.trim()) metadata.dietary = extra.dietary.trim();
  if (isMinor(guest.birthdate, today)) {
    metadata.guardian = {
      name: extra.guardianName.trim(),
      dni: extra.guardianDni.trim(),
      phone: extra.guardianPhone.trim(),
    };
  }
  return metadata;
}

// ---------------------------------------------------------------------------
// Entrada: nombres de franjas por código (la API de entradas solo devuelve el código)
// ---------------------------------------------------------------------------

const SLOT_LABELS: Record<string, string> = {
  FRI_NIGHT: 'Viernes noche',
  SAT_NOON: 'Sábado mediodía',
  SAT_NIGHT: 'Sábado noche',
  SUN_NOON: 'Domingo mediodía',
  SUN_NIGHT: 'Domingo noche',
};
const SLOT_ORDER = Object.keys(SLOT_LABELS);

export interface MealSelectionItem {
  slotCode: string;
  optionNumber: number;
  optionName: string;
}

/** Comidas de una entrada con nombre de franja legible, en orden cronológico. */
export function describeMealSelection(selection: MealSelectionItem[] | null | undefined) {
  return (selection ?? [])
    .map((m) => ({ label: SLOT_LABELS[m.slotCode] ?? m.slotCode, name: m.optionName, code: m.slotCode }))
    .sort((a, b) => {
      const ia = SLOT_ORDER.indexOf(a.code);
      const ib = SLOT_ORDER.indexOf(b.code);
      return (ia === -1 ? SLOT_ORDER.length : ia) - (ib === -1 ? SLOT_ORDER.length : ib);
    });
}
