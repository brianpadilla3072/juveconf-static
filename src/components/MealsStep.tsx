import {
  formatPrice,
  nextDiscountTier,
  quoteMeals,
  type MealPick,
  type MealsConfig,
  type MealSlot,
} from '../lib/meals';

interface GuestMeals {
  name: string;
  meals: MealPick[];
}

const primaryButtonClass =
  'w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] hover:from-[#7A35E6] hover:to-[#7A35E6] text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg border-2 border-[#8B3FFF]/20 hover:border-[#8B3FFF]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
const secondaryButtonClass =
  'w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-lg py-4 px-6 rounded-lg border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const panelClass = 'bg-black/30 backdrop-blur-sm rounded-lg border border-white/20';

const guestLabel = (guest: GuestMeals, index: number) =>
  guest.name.trim() ? `Invitado ${index + 1} · ${guest.name.trim()}` : `Invitado ${index + 1}`;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------------------
// Paso 2: elección de comidas por invitado
// ---------------------------------------------------------------------------

interface MealsStepProps {
  config: MealsConfig;
  guests: GuestMeals[];
  onChange: (guestIndex: number, meals: MealPick[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function MealsStep({ config, guests, onChange, onBack, onContinue }: MealsStepProps) {
  const tiers = Object.entries(config.discountTiers)
    .map(([count, percent]) => ({ count: Number(count), percent }))
    .filter((t) => t.percent > 0)
    .sort((a, b) => a.count - b.count);

  const mealsTotal = guests.reduce((acc, guest) => acc + quoteMeals(guest.meals, config).total, 0);

  const setPick = (guestIndex: number, slotCode: string, optionNumber: number | null) => {
    const others = guests[guestIndex].meals.filter((p) => p.slotCode !== slotCode);
    onChange(guestIndex, optionNumber === null ? others : [...others, { slotCode, optionNumber }]);
  };

  return (
    <div className="p-0">
      <div className="flex flex-col gap-6 mt-5">
        <div className={`${panelClass} p-4 space-y-2`}>
          <h3 className="text-lg font-medium text-white/90">Elegí las comidas de cada invitado</h3>
          <p className="text-sm text-white/70">
            Todas las comidas son opcionales: marcá solo las que quieras sumar. Se pagan junto con las entradas, en una
            única transferencia.
          </p>
          {tiers.length > 0 && (
            <p className="text-sm text-[#CCFF00]">
              Descuento por invitado según la cantidad de comidas:{' '}
              {tiers.map((t, i) => `${t.count}${i === tiers.length - 1 ? ' o más' : ''} comidas: ${t.percent}%`).join(' · ')}.
            </p>
          )}
        </div>

        {guests.map((guest, guestIndex) => {
          const quote = quoteMeals(guest.meals, config);
          const next = nextDiscountTier(quote.count, config.discountTiers);

          return (
            <div key={guestIndex} className={`${panelClass} p-4 space-y-5`}>
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{guestLabel(guest, guestIndex)}</span>
              </div>

              {config.slots.map((slot) => (
                <SlotPicker
                  key={slot.code}
                  slot={slot}
                  groupName={`meal-${guestIndex}-${slot.code}`}
                  selected={guest.meals.find((p) => p.slotCode === slot.code)?.optionNumber ?? null}
                  onSelect={(optionNumber) => setPick(guestIndex, slot.code, optionNumber)}
                />
              ))}

              <div className="pt-4 border-t border-white/10 space-y-1 text-sm">
                {next && (
                  <p className="text-[#CCFF00] text-xs">
                    {quote.count === 0
                      ? `Con ${plural(next.count, 'comida', 'comidas')} tenés ${next.percent}% de descuento.`
                      : `Sumá ${plural(next.count - quote.count, 'comida más', 'comidas más')} y tenés ${next.percent}% de descuento.`}
                  </p>
                )}
                <div className="flex justify-between text-white/80">
                  <span>Subtotal ({plural(quote.count, 'comida', 'comidas')})</span>
                  <span>{formatPrice(quote.subtotal)}</span>
                </div>
                {quote.percent > 0 && (
                  <div className="flex justify-between text-[#CCFF00]">
                    <span>Descuento {quote.percent}%</span>
                    <span>-{formatPrice(quote.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-white">
                  <span>Total comidas</span>
                  <span>{formatPrice(quote.total)}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4 border border-white/20 text-white flex justify-between font-medium text-lg">
          <span className="text-white/90">Total comidas (todos los invitados)</span>
          <span>{formatPrice(mealsTotal)}</span>
        </div>
      </div>

      <div className="flex items-center p-6 pt-0 mt-6">
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
          <button type="button" onClick={onBack} className={secondaryButtonClass}>
            Volver a los datos
          </button>
          <button type="button" onClick={onContinue} className={primaryButtonClass}>
            Continuar al resumen
          </button>
        </div>
      </div>
    </div>
  );
}

// Una franja: checkbox si tiene una sola opción; opciones tipo radio (con "Ninguna") si tiene varias.
function SlotPicker({
  slot,
  groupName,
  selected,
  onSelect,
}: {
  slot: MealSlot;
  groupName: string;
  selected: number | null;
  onSelect: (optionNumber: number | null) => void;
}) {
  const single = slot.options.length === 1;

  const rowClass = (active: boolean) =>
    `flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
      active ? 'border-[#8B3FFF] bg-[#8B3FFF]/20' : 'border-white/10 bg-black/20 hover:border-white/20'
    }`;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-white/90 mb-2">{slot.name}</legend>

      {slot.options.map((option) => {
        const active = selected === option.n;
        return (
          <label key={option.n} className={rowClass(active)}>
            <span className="flex items-center gap-3 min-w-0">
              <input
                type={single ? 'checkbox' : 'radio'}
                name={groupName}
                checked={active}
                onChange={() => onSelect(single && active ? null : option.n)}
                className="w-4 h-4 accent-[#8B3FFF] shrink-0"
              />
              <span className="text-sm text-white/90 break-words">{option.name}</span>
            </span>
            <span className="text-sm font-medium text-white shrink-0">{formatPrice(option.price)}</span>
          </label>
        );
      })}

      {!single && (
        <label className={rowClass(selected === null)}>
          <span className="flex items-center gap-3">
            <input
              type="radio"
              name={groupName}
              checked={selected === null}
              onChange={() => onSelect(null)}
              className="w-4 h-4 accent-[#8B3FFF] shrink-0"
            />
            <span className="text-sm text-white/70">Ninguna</span>
          </span>
        </label>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Paso 3: resumen del pedido (entradas + comidas)
// ---------------------------------------------------------------------------

interface MealsSummaryProps {
  config: MealsConfig;
  guests: GuestMeals[];
  entrance: { title: string; unitPrice: number; quantity: number };
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export function MealsSummary({ config, guests, entrance, submitting, error, onBack, onSubmit }: MealsSummaryProps) {
  const entranceTotal = entrance.unitPrice * entrance.quantity;
  const quotes = guests.map((guest) => quoteMeals(guest.meals, config));
  const mealsTotal = quotes.reduce((acc, q) => acc + q.total, 0);

  return (
    <div className="p-0">
      <div className="flex flex-col gap-6 mt-5">
        <div className={`${panelClass} p-4 space-y-2`}>
          <h3 className="text-lg font-medium text-white/90">Resumen de tu pedido</h3>
          <p className="text-sm text-white/70">Revisá el detalle antes de confirmar. Pagás todo junto, en una única transferencia.</p>
        </div>

        {/* Entradas */}
        <div className={`${panelClass} p-4 space-y-1 text-sm`}>
          <p className="font-medium text-white mb-2">Entradas</p>
          <div className="flex justify-between text-white/80">
            <span className="break-words">
              {entrance.title} × {plural(entrance.quantity, 'persona', 'personas')}
            </span>
            <span className="shrink-0">{formatPrice(entrance.unitPrice)} c/u</span>
          </div>
          <div className="flex justify-between font-medium text-white">
            <span>Total entradas</span>
            <span>{formatPrice(entranceTotal)}</span>
          </div>
        </div>

        {/* Comidas por invitado */}
        {guests.map((guest, guestIndex) => {
          const quote = quotes[guestIndex];
          return (
            <div key={guestIndex} className={`${panelClass} p-4 space-y-3 text-sm`}>
              <p className="font-medium text-white">{guestLabel(guest, guestIndex)}</p>

              {quote.items.length === 0 ? (
                <p className="text-white/60">Sin comidas.</p>
              ) : (
                <>
                  <ul className="space-y-1">
                    {quote.items.map((item) => (
                      <li key={item.slotCode} className="flex justify-between gap-3 text-white/80">
                        <span className="break-words">
                          <span className="text-white/60">{item.slotName}:</span> {item.optionName}
                        </span>
                        <span className="shrink-0">{formatPrice(item.price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-white/80">
                      <span>Subtotal</span>
                      <span>{formatPrice(quote.subtotal)}</span>
                    </div>
                    {quote.percent > 0 && (
                      <div className="flex justify-between text-[#CCFF00]">
                        <span>Descuento {quote.percent}%</span>
                        <span>-{formatPrice(quote.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-white">
                      <span>Total comidas</span>
                      <span>{formatPrice(quote.total)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Totales */}
        <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4 space-y-2 border border-white/20 text-white">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Entradas</span>
            <span className="text-white/90">{formatPrice(entranceTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Comidas</span>
            <span className="text-white/90">{formatPrice(mealsTotal)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t border-white/10">
            <span className="text-white/90">Total a pagar</span>
            <span className="text-[#CCFF00]">{formatPrice(entranceTotal + mealsTotal)}</span>
          </div>
          <p className="text-xs text-white/50">
            Los valores de las comidas son una vista previa: el total final se confirma al crear el pedido.
          </p>
        </div>

        <p className="text-sm text-white/70">
          Tu entrada con código QR va a incluir el detalle de las comidas que elegiste.
        </p>

        {error && (
          <div role="alert" className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-sm text-white whitespace-pre-line">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center p-6 pt-0 mt-6">
        <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
          <button type="button" onClick={onBack} disabled={submitting} className={secondaryButtonClass}>
            Volver a las comidas
          </button>
          <button type="button" onClick={onSubmit} disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
