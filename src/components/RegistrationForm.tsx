import FireBackground from './FireBackground';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { GuestExtra, GuestExtraErrors, MealPick, MealsConfig } from '../lib/meals';

// Todo lo de comidas se carga bajo demanda, solo cuando el evento las tiene habilitadas (chunks separados).
type MealsLib = typeof import('../lib/meals');
const loadMealsLib = () => import('../lib/meals');
const loadGuestExtraFields = () => import('./GuestExtraFields');
const loadMealsStep = () => import('./MealsStep');
const GuestExtraFields = lazy(loadGuestExtraFields);
const MealsStep = lazy(loadMealsStep);
const MealsSummary = lazy(() => loadMealsStep().then((m) => ({ default: m.MealsSummary })));

type Step = 'form' | 'meals' | 'summary';
const STEPS: Step[] = ['form', 'meals', 'summary'];
const STEP_LABELS = ['Datos', 'Comidas', 'Resumen'];

interface GuestData {
  name: string;
  dni: string;
  birthdate: string;
  phone: string;
  email: string;
  city: string;
  church: string;
  merchandiseSizes?: Record<string, string>;
  // Solo se usan cuando el evento tiene comidas habilitadas
  extra: GuestExtra;
  meals: MealPick[];
}

const emptyGuestExtra = (): GuestExtra => ({
  group: '',
  lodgingNeeded: false,
  lodgingNights: [],
  dietary: '',
  emergencyName: '',
  emergencyPhone: '',
  guardianName: '',
  guardianDni: '',
  guardianPhone: '',
});

const emptyGuest = (): GuestData => ({
  name: '',
  dni: '',
  birthdate: '',
  phone: '',
  email: '',
  city: '',
  church: '',
  merchandiseSizes: {},
  extra: emptyGuestExtra(),
  meals: [],
});

interface RegistrationFormProps {
  selectedPackage: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    gratuito?: boolean;
    personsIncluded: number;
    maxPersons?: number;
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
  };
  /** Configuración de comidas del evento; null si están deshabilitadas (el formulario funciona como siempre). */
  meals?: MealsConfig | null;
  onBack: () => void;
}

export default function RegistrationForm({ selectedPackage, meals = null, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    dni: '',
  });

  const [numGuests, setNumGuests] = useState(1);
  const [guestData, setGuestData] = useState<GuestData[]>([emptyGuest()]);

  // Flujo con comidas: datos -> comidas -> resumen
  const [step, setStep] = useState<Step>('form');
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [mealsLib, setMealsLib] = useState<MealsLib | null>(null);

  // Con comidas: precarga los módulos para que los pasos abran al instante
  useEffect(() => {
    if (!meals) return;
    void loadMealsLib().then(setMealsLib);
    void loadGuestExtraFields();
    void loadMealsStep();
  }, [meals]);

  // Errores inline de los datos adicionales. Se recalculan en cada render: desaparecen a medida que se corrigen.
  const guestErrors: GuestExtraErrors[] =
    mealsLib && attempted ? guestData.map((g) => mealsLib.validateGuestExtras(g)) : [];

  // Combo gratuito: no se piden datos de comprador, se usan los del primer invitado
  const buyerIsFirstGuest = selectedPackage.gratuito;
  const buyer = buyerIsFirstGuest
    ? { email: guestData[0]?.email ?? '', phone: guestData[0]?.phone ?? '', dni: guestData[0]?.dni ?? '' }
    : formData;

  // Cálculos de precio dinámicos
  const pricePerPerson = selectedPackage.precio;
  const totalPrice = pricePerPerson * numGuests;
  const totalPriceWithSurcharge = Math.round(totalPrice * 1.26);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumGuestsChange = (newNum: number) => {
    if (newNum < 1) return;
    setNumGuests(newNum);

    // Ajustar array de invitados
    const newGuestData = [...guestData];
    if (newNum > guestData.length) {
      // Agregar invitados vacíos
      for (let i = guestData.length; i < newNum; i++) {
        newGuestData.push(emptyGuest());
      }
    } else {
      // Reducir invitados
      newGuestData.splice(newNum);
    }
    setGuestData(newGuestData);
  };

  const handleGuestChange = (index: number, field: 'name' | 'dni' | 'birthdate' | 'phone' | 'email' | 'city' | 'church', value: string) => {
    const newGuestData = [...guestData];
    newGuestData[index][field] = value;
    setGuestData(newGuestData);
  };

  const handleMerchandiseSizeChange = (guestIndex: number, merchType: string, size: string) => {
    const newGuestData = [...guestData];
    if (!newGuestData[guestIndex].merchandiseSizes) {
      newGuestData[guestIndex].merchandiseSizes = {};
    }
    newGuestData[guestIndex].merchandiseSizes![merchType] = size;
    setGuestData(newGuestData);
  };

  const handleGuestExtraChange = (index: number, patch: Partial<GuestExtra>) => {
    setGuestData((prev) => prev.map((g, i) => (i === index ? { ...g, extra: { ...g.extra, ...patch } } : g)));
  };

  const handleGuestMealsChange = (index: number, picks: MealPick[]) => {
    setGuestData((prev) => prev.map((g, i) => (i === index ? { ...g, meals: picks } : g)));
  };

  const goToStep = (next: Step) => {
    setStep(next);
    setSubmitError(null);
    setTimeout(() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // Mensaje de error inline (solo se muestra si hay errores, que solo existen con comidas habilitadas)
  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" data-field-error className="text-xs text-red-400">
        {message}
      </p>
    ) : null;

  // Validación de comprador, invitados y talles. Muestra un alert y devuelve false si falta algo.
  const validateBase = (): boolean => {
    // Validar formulario
    // Con combo gratuito el comprador es el invitado 1, que se valida abajo
    if (!buyerIsFirstGuest && (!formData.email || !formData.phone || !formData.dni)) {
      alert('Por favor completa todos los campos del comprador');
      return false;
    }

    // Validar invitados
    for (let i = 0; i < guestData.length; i++) {
      const guest = guestData[i];
      if (!guest.name || !guest.dni || !guest.birthdate || !guest.phone || !guest.email || !guest.city || !guest.church) {
        alert(`Por favor completa todos los campos del invitado ${i + 1}`);
        return false;
      }

      // Validar talles de merchandising si el paquete lo requiere
      if (selectedPackage.metadata?.merchandise?.enabled) {
        const requiredMerch = selectedPackage.metadata.merchandise.allMerchandise || [];
        for (const merch of requiredMerch) {
          if (!guest.merchandiseSizes?.[merch.type]) {
            alert(`Por favor selecciona la talla de ${merch.label} para el invitado ${i + 1}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  // Paso "datos" -> "comidas" (solo con comidas habilitadas)
  const handleContinue = async () => {
    setAttempted(true);
    if (!validateBase()) return;

    const lib = mealsLib ?? (await loadMealsLib());
    if (guestData.some((g) => Object.keys(lib.validateGuestExtras(g)).length > 0)) {
      // Ir al primer error una vez renderizados los mensajes
      setTimeout(() => document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }

    goToStep('meals');
  };

  const handleSubmit = async (paymentMethod: string) => {
    if (!validateBase()) return;

    // Mostrar loading
    const submitButton = meals ? null : (document.activeElement as HTMLButtonElement);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Procesando...';
    }
    if (meals) {
      setSubmitting(true);
      setSubmitError(null);
    }

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3072';
      const eventId = import.meta.env.PUBLIC_EVENT_ID;

      const lib = meals ? await loadMealsLib() : null;

      // Formatear attendees para el backend
      const attendees = guestData.map(guest => ({
        name: guest.name,
        cuil: guest.dni,
        metadata: JSON.stringify({
          email: guest.email,
          phone: guest.phone,
          birthdate: guest.birthdate,
          city: guest.city,
          church: guest.church,
          merchandiseSizes: guest.merchandiseSizes || {},
          // Con comidas: datos adicionales de inscripción (el servidor los valida)
          ...(lib ? lib.buildExtraMetadata(guest) : {})
        }),
        ...(meals ? { meals: guest.meals } : {})
      }));

      // Determinar tipo de pago
      const paymentType = paymentMethod === 'credit' ? 'MERCADOPAGO' : 'TRANSFER';
      const finalTotal = paymentMethod === 'credit' ? totalPriceWithSurcharge : totalPrice;

      // Crear payload según el formato esperado por el backend (CreatePreferenceDto)
      const orderPayload = {
        id: selectedPackage.id,                    // ID del combo
        email: buyer.email,
        phone: buyer.phone,
        cuil: buyer.dni,
        title: selectedPackage.titulo,             // Título del combo
        unit_price: pricePerPerson,                // Precio unitario
        quantity: numGuests,                       // Cantidad de personas
        minPersons: selectedPackage.personsIncluded || 1,
        maxPersons: selectedPackage.maxPersons,
        attendees: attendees,
        eventId: eventId
      };

      // Determinar endpoint según método de pago
      let endpoint = '';
      if (paymentType === 'MERCADOPAGO') {
        endpoint = `${apiUrl}/mercadopago/preference`;
      } else {
        endpoint = `${apiUrl}/transfers/create-transfer-order`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // El servidor puede devolver `message` como string o como lista de errores
        const message = Array.isArray(errorData.message) ? errorData.message.join('\n') : errorData.message;
        throw new Error(message || 'Error al crear la orden');
      }

      const result = await response.json();

      // Si es MercadoPago, redirigir al checkout
      if (paymentType === 'MERCADOPAGO' && result.initPoint) {
        window.location.href = result.initPoint;
        return;
      }

      // Si es transferencia/efectivo, redirigir a página de confirmación
      const orderId = result.orderID;
      window.location.href = `/confirmacion?orderId=${orderId}${meals ? '&meals=1' : ''}`;

    } catch (error: any) {
      console.error('Error al crear orden:', error);
      if (meals) {
        // Con comidas el error se muestra en el resumen, sin alert
        setSubmitError(error.message || 'Error al crear la orden');
        setSubmitting(false);
        return;
      }
      alert(`Error al procesar tu orden: ${error.message}. Por favor intenta nuevamente.`);

      // Restaurar botón
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Efectivo y transferencia';
      }
    }
  };

  return (
    <section
      id="registro"
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      <FireBackground />

      {/* Contenido */}
      <div className="relative z-10 p-6 md:p-10 lg:p-12 xl:p-16">
        <form className="bg-black/10 rounded-2xl shadow-xl border border-white/30 p-6 md:p-8 h-full max-w-7xl mx-auto bg-piedra/5 backdrop-blur-xs">

          {/* Header */}
          <div className="text-white">
            <div className="flex flex-col space-y-1.5 p-6 pb-2 mb-2">
              {/* Botón Volver */}
              <button
                onClick={onBack}
                type="button"
                className="flex items-center gap-2 text-white/80 hover:text-white mb-4 self-start transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="text-sm font-medium">Cambiar plan</span>
              </button>

              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white break-words">
                Registro de Entrada
              </div>

              <div className="h-1 w-20 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] rounded-full my-3 m-auto"></div>

              <div className="text-sm text-center text-white/80">
                Completa tus datos para asegurar tu lugar
              </div>

              {meals && (
                <ol aria-label="Pasos de la inscripción" className="flex flex-wrap items-center justify-center gap-2 mt-2 text-xs">
                  {STEP_LABELS.map((label, i) => {
                    const current = STEPS.indexOf(step);
                    return (
                      <li
                        key={label}
                        aria-current={i === current ? 'step' : undefined}
                        className={`px-3 py-1 rounded-full border ${
                          i === current
                            ? 'bg-[#8B3FFF] border-[#8B3FFF] text-white'
                            : i < current
                              ? 'border-[#CCFF00]/60 text-[#CCFF00]'
                              : 'border-white/20 text-white/50'
                        }`}
                      >
                        {i + 1}. {label}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          {/* Pasos "comidas" y "resumen" (solo con comidas habilitadas; se cargan bajo demanda) */}
          {meals && step !== 'form' && (
            <Suspense fallback={<p className="text-center text-white/70 py-10">Cargando...</p>}>
              {step === 'meals' ? (
                <MealsStep
                  config={meals}
                  guests={guestData}
                  onChange={handleGuestMealsChange}
                  onBack={() => goToStep('form')}
                  onContinue={() => goToStep('summary')}
                />
              ) : (
                <MealsSummary
                  config={meals}
                  guests={guestData}
                  entrance={{ title: selectedPackage.titulo, unitPrice: pricePerPerson, quantity: numGuests }}
                  submitting={submitting}
                  error={submitError}
                  onBack={() => goToStep('meals')}
                  onSubmit={() => handleSubmit('cash')}
                />
              )}
            </Suspense>
          )}

          {step === 'form' && (
          <>
          {/* Contenido principal */}
          <div className="p-0">
            <div className="flex flex-col gap-6 mt-5">

              {/* MOBILE: Plan Seleccionado */}
              <div className="block md:hidden space-y-4">
                <div className="bg-black/35 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                      <path d="M8 2v4M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                    </svg>
                    <span>Plan Seleccionado</span>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-black text-white mb-2 break-words">
                      {selectedPackage.titulo}
                    </h3>
                    <p className="text-white/70 text-sm mb-3 break-words hyphens-auto">
                      {selectedPackage.descripcion}
                    </p>
                    <div className="mb-3">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-2xl sm:text-3xl font-black text-white break-words">
                          ${selectedPackage.precio.toLocaleString('es-AR')}
                        </span>
                        <span className="text-sm text-white/60 font-normal">por persona</span>
                      </div>
                    </div>

                    {/* Selector de cantidad */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4">
                      <span className="text-white/80 text-sm font-medium">Cantidad de personas:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleNumGuestsChange(numGuests - 1)}
                          className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={numGuests}
                          onChange={(e) => handleNumGuestsChange(parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-16 h-8 bg-black/30 text-white text-center rounded-lg border border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleNumGuestsChange(numGuests + 1)}
                          className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-white/80 text-sm">Total:</span>
                        <span className="text-xl sm:text-2xl font-black text-white break-words">
                          ${totalPrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 columnas */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* COLUMNA IZQUIERDA */}
                <div className="space-y-6">

                  {/* Datos a Considerar (Mobile) */}
                  {/* <div className="block md:hidden space-y-4 p-4 bg-black/30 rounded-lg border border-white/10">
                    <h4 className="text-white/90 font-medium">Datos a Considerar</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-[#8B3FFF]">•</span>
                        <span>
                          Pago con tarjeta de crédito o débito (26% de recargo):
                          <span className="font-medium text-[#8B3FFF] ml-1">
                            ${totalPriceWithSurcharge.toLocaleString('es-AR')}
                          </span> total
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#8B3FFF]">•</span>
                        <span>
                          Precio sin recargo:
                          <span className="text-white/90 ml-1">${totalPrice.toLocaleString('es-AR')}</span>
                          , Para evitar recargos, puedes optar por pago por transferencia bancaria
                        </span>
                      </li>
                    </ul>
                  </div> */}

                  {/* Formulario: Datos del Comprador (no se pide en combos gratuitos: se usa el invitado 1) */}
                  {!buyerIsFirstGuest && (
                  <div className="space-y-6 border border-white/20 p-6 rounded-lg">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-white/90">Datos del comprador</h3>
                      <p className="text-sm text-white/60">Información personal para la facturación</p>
                    </div>

                    <div className="space-y-4">
                      {/* Email */}
                      <div className="grid gap-3">
                        <label htmlFor="email" className="text-white/80 text-sm font-medium">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="flex h-10 w-full bg-black/20 text-white/90 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors outline-none"
                          placeholder="ejemplo@dominio.com"
                          required
                        />
                      </div>

                      {/* Teléfono */}
                      <div className="grid gap-3">
                        <label htmlFor="phone" className="text-white/80 text-sm font-medium">
                          Número de Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="flex h-10 w-full bg-black/20 text-white/90 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors outline-none"
                          placeholder="291 5035 6245"
                          required
                        />
                      </div>

                      {/* DNI */}
                      <div className="grid gap-3">
                        <label htmlFor="dni" className="text-white/80 text-sm font-medium">
                          Número de DNI
                        </label>
                        <input
                          type="text"
                          id="dni"
                          name="dni"
                          value={formData.dni}
                          onChange={handleChange}
                          className="flex h-10 w-full bg-black/20 text-white/90 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors outline-none"
                          placeholder="Ej: 12345678"
                          required
                        />
                        <p className="text-xs text-white/50">
                          Ingresa tu DNI sin puntos ni espacios
                        </p>
                      </div>

                      {/* Advertencia */}
                      <div className="bg-[#9810fa5b] border border-[#9810fa] rounded-lg p-3">
                        <p className="text-sm text-white  font-medium">
                          ⚠️ Importante: Los datos del comprador son únicamente para facturación y no constituyen una entrada al evento.
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Invitados */}
                  <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span className="text-white">Invitados ({numGuests})</span>
                    </div>
                  </div>

                  {/* Lista de invitados */}
                  <div className={meals ? 'space-y-4 p-2 border border-white/10 rounded-lg' : 'space-y-4 max-h-[550px] overflow-y-auto p-2 border border-white/10 rounded-lg'}>
                    {guestData.map((guest, index) => (
                      <div key={index} className="space-y-4 bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>Invitado {index + 1}</span>
                        </div>

                        <div className="grid gap-4 m-1">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-name-${index}`}>
                              Nombre Completo
                            </label>
                            <input
                              type="text"
                              id={`guest-name-${index}`}
                              value={guest.name}
                              onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="Ingresa el nombre"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-dni-${index}`}>
                              DNI
                            </label>
                            <input
                              type="text"
                              id={`guest-dni-${index}`}
                              value={guest.dni}
                              onChange={(e) => handleGuestChange(index, 'dni', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="Ej: 12345678"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-birthdate-${index}`}>
                              Fecha de Nacimiento
                            </label>
                            <input
                              type="date"
                              id={`guest-birthdate-${index}`}
                              value={guest.birthdate}
                              onChange={(e) => handleGuestChange(index, 'birthdate', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              required
                            />
                            {fieldError(guestErrors[index]?.birthdate)}
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-phone-${index}`}>
                              {meals ? 'Número de Teléfono (WhatsApp)' : 'Número de Teléfono'}
                            </label>
                            <input
                              type="tel"
                              id={`guest-phone-${index}`}
                              value={guest.phone}
                              onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="291 5035 6245"
                              required
                            />
                            {fieldError(guestErrors[index]?.phone)}
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-email-${index}`}>
                              Correo Electrónico
                            </label>
                            <input
                              type="email"
                              id={`guest-email-${index}`}
                              value={guest.email}
                              onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="ejemplo@dominio.com"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-city-${index}`}>
                              Localidad
                            </label>
                            <input
                              type="text"
                              id={`guest-city-${index}`}
                              value={guest.city}
                              onChange={(e) => handleGuestChange(index, 'city', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="Ingresa la localidad"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-church-${index}`}>
                              Iglesia
                            </label>
                            <input
                              type="text"
                              id={`guest-church-${index}`}
                              value={guest.church}
                              onChange={(e) => handleGuestChange(index, 'church', e.target.value)}
                              className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors"
                              placeholder="Ingresa la iglesia"
                              required
                            />
                          </div>

                          {/* Selectores de talla de merch */}
                          {selectedPackage.metadata?.merchandise?.enabled &&
                           selectedPackage.metadata.merchandise.allMerchandise?.map((merch) => (
                            <div key={merch.type} className="grid gap-2">
                              <label className="text-sm font-medium text-white/80" htmlFor={`guest-merch-${merch.type}-${index}`}>
                                {merch.label}
                              </label>
                              <select
                                id={`guest-merch-${merch.type}-${index}`}
                                value={guest.merchandiseSizes?.[merch.type] || ''}
                                onChange={(e) => handleMerchandiseSizeChange(index, merch.type, e.target.value)}
                                className="bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors [&>option]:bg-stone-900/95 [&>option]:text-white"
                                required
                              >
                                <option value="" className="bg-stone-900/95 text-white/70">Selecciona una talla</option>
                                {merch.sizes.map((size) => (
                                  <option key={size} value={size} className="bg-stone-900/95 text-white">
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}

                          {/* Datos adicionales (solo con comidas habilitadas) */}
                          {meals && (
                            <Suspense fallback={null}>
                              <GuestExtraFields
                                index={index}
                                birthdate={guest.birthdate}
                                extra={guest.extra}
                                errors={guestErrors[index] ?? {}}
                                onChange={(patch) => handleGuestExtraChange(index, patch)}
                              />
                            </Suspense>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMNA DERECHA (Desktop only) */}
                <div className="space-y-6 hidden md:block">

                  {/* Plan Seleccionado (Desktop) */}
                  <div className="space-y-4">
                    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                          <path d="M8 2v4M16 2v4"></path>
                          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                          <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                        </svg>
                        <span>Plan Seleccionado</span>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-black text-white mb-2 break-words">
                          {selectedPackage.titulo}
                        </h3>
                        <p className="text-white/70 text-sm mb-3 break-words hyphens-auto">
                          {selectedPackage.descripcion}
                        </p>
                        <div className="mb-3">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-3xl font-black text-white break-words">
                              ${selectedPackage.precio.toLocaleString('es-AR')}
                            </span>
                            <span className="text-sm text-white/60 font-normal">por persona</span>
                          </div>
                        </div>

                        {/* Selector de cantidad */}
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-white/80 text-sm font-medium">Cantidad:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleNumGuestsChange(numGuests - 1)}
                              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={numGuests}
                              onChange={(e) => handleNumGuestsChange(parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-16 h-8 bg-black/30 text-white text-center rounded-lg border border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30"
                            />
                            <button
                              type="button"
                              onClick={() => handleNumGuestsChange(numGuests + 1)}
                              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="text-white/80 text-sm">Total:</span>
                            <span className="text-2xl font-black text-white break-words">
                              ${totalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Pago */}
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-white bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
                        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                        <line x1="2" x2="22" y1="10" y2="10"></line>
                      </svg>
                      <span>Resumen</span>
                    </div>

                    <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4 space-y-2 border border-white/20 text-white">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/90">{selectedPackage.titulo}</span>
                        <span className="text-white/90">{numGuests} persona(s)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">Precio por persona</span>
                        <span className="text-white/90">${pricePerPerson.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg">
                        <span className="text-white/90">Total</span>
                        <span className="text-white">${totalPrice.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Datos a Considerar (Desktop) */}
                  {/* <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/10">
                    <h4 className="text-white/90 font-medium">Datos a Considerar</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-[#8B3FFF]">•</span>
                        <span>
                          Pago con tarjeta de crédito o débito (26% de recargo):
                          <span className="font-medium text-[#8B3FFF] ml-1">
                            ${totalPriceWithSurcharge.toLocaleString('es-AR')}
                          </span> total
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#8B3FFF]">•</span>
                        <span>
                          Precio sin recargo:
                          <span className="text-white/90 ml-1">${totalPrice.toLocaleString('es-AR')}</span>
                          , Para evitar recargos, puedes optar por pago por transferencia bancaria
                        </span>
                      </li>
                    </ul>
                  </div> */}
                </div>

              </div>
            </div>
          </div>

          {/* Footer - Botones de Pago */}
          <div className="flex items-center p-6 pt-0 mt-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">

              {/* Botón Crédito */}
              {/* <button
                type="button"
                onClick={() => handleSubmit('credit')}
                className="w-full flex items-center justify-center gap-3
                           bg-gradient-to-r from-blue-500 to-blue-600
                           hover:from-blue-600 hover:to-blue-700
                           text-white font-bold text-lg py-4 px-6 rounded-lg
                           shadow-lg border-2 border-blue-500/20
                           hover:border-blue-400/40 transition-all duration-300
                           transform hover:-translate-y-0.5 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                Crédito
              </button> */}

              {/* Botón Efectivo/Transferencia */}
              <button
                type="button"
                onClick={() => (meals ? handleContinue() : handleSubmit('cash'))}
                className="w-full flex items-center justify-center gap-3
                           bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF]
                           hover:from-[#7A35E6] hover:to-[#7A35E6]
                           text-white font-bold text-lg py-4 px-6 rounded-lg
                           shadow-lg border-2 border-[#8B3FFF]/20
                           hover:border-[#8B3FFF]/40 transition-all duration-300
                           transform hover:-translate-y-0.5 active:scale-95"
              >
                {!meals && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="8" r="6"></circle>
                    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
                    <path d="M7 6h1v4"></path>
                    <path d="m16.71 13.88.7.71-2.82 2.82"></path>
                  </svg>
                )}
                {meals ? 'Continuar: elegir comidas' : 'Efectivo y transferencia'}
              </button>
            </div>
          </div>
          </>
          )}

          {/* Footer - marca de la portada */}
          <div className="flex justify-end items-center mt-8 px-6">
            <img src="/hero/juveconfe.webp" alt="JUVECONFE" loading="lazy" className="w-[150px] lg:w-[190px] h-auto" />
          </div>

        </form>
      </div>
    </section>
  );
}
