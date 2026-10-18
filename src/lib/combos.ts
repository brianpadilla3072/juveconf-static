// Combos publicados del evento y configuración de comidas, compartido entre la página principal
// (tarjetas de Inscripción) y la página /inscripcion (registro de entrada).
import type { MealsConfig } from './meals';

export interface Combo {
  id: string;
  name: string;
  price: number;
  personsIncluded: number;
  maxPersons?: number;
  description: string;
  isFree: boolean;
  mealsEnabled?: boolean;
  metadata: {
    benefits: string[];
    merchandise?: {
      enabled: boolean;
      allMerchandise: Array<{
        type: string;
        label: string;
        sizes: string[];
      }>;
    };
  };
  displayOrder: number;
}

export interface Package {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  personsIncluded: number;
  maxPersons?: number;
  gratuito: boolean;
  mealsEnabled: boolean;
  caracteristicas: string[];
  icono: string;
  metadata?: {
    benefits: string[];
    merchandise?: {
      enabled: boolean;
      allMerchandise: Array<{
        type: string;
        label: string;
        sizes: string[];
      }>;
    };
  };
}

// Menús y descuentos de comidas del evento. Solo se usan en los combos con `mealsEnabled`. Si falla o no hay configuración => null (el sitio queda como siempre).
export async function fetchMealsConfig(apiUrl: string, eventId: string): Promise<MealsConfig | null> {
  try {
    const response = await fetch(`${apiUrl}/meals/public/${eventId}`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.enabled !== true) return null; // deshabilitado: no se descarga nada más
    const { parseMealsConfig } = await import('./meals');
    return parseMealsConfig(data);
  } catch {
    return null;
  }
}

/** Combos publicados del evento, mapeados al formato de las tarjetas y del formulario */
export async function fetchPublishedPackages(apiUrl: string, eventId: string): Promise<Package[]> {
  const response = await fetch(`${apiUrl}/combos/event/${eventId}/published`);
  if (!response.ok) throw new Error('Error al cargar los combos');
  const data: Combo[] = await response.json();
  return data.map((combo) => ({
    id: combo.id,
    titulo: combo.name.toUpperCase(),
    descripcion: combo.description?.toUpperCase() || '',
    precio: combo.price,
    personsIncluded: combo.personsIncluded,
    maxPersons: combo.maxPersons,
    gratuito: combo.isFree,
    mealsEnabled: combo.mealsEnabled === true,
    caracteristicas: combo.metadata?.benefits || [],
    icono: '→',
    metadata: combo.metadata,
  }));
}

/** Link a la página de registro de entrada de un combo */
export function registrationHref(comboId: string): string {
  return `/inscripcion?combo=${encodeURIComponent(comboId)}`;
}

/** Un combo es gratis si el API lo marca como tal o si su precio es cero */
export function esGratuito(pkg: { gratuito: boolean; precio: number }): boolean {
  return pkg.gratuito || pkg.precio === 0;
}
