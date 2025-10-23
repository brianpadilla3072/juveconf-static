import { useState } from 'react';

interface RegistrationFormProps {
  selectedPackage: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
  };
  onBack: () => void;
}

export default function RegistrationForm({ selectedPackage, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    dni: '',
  });

  const [numGuests, setNumGuests] = useState(1);
  const [guestData, setGuestData] = useState<Array<{
    name: string;
    dni: string;
    birthdate: string;
    phone: string;
    email: string;
    city: string;
    church: string;
  }>>([
    { name: '', dni: '', birthdate: '', phone: '', email: '', city: '', church: '' }
  ]);

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
        newGuestData.push({ name: '', dni: '', birthdate: '', phone: '', email: '', city: '', church: '' });
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

  const handleSubmit = (paymentMethod: string) => {
    console.log('Formulario enviado:', {
      ...formData,
      package: selectedPackage,
      guests: guestData,
      numGuests,
      paymentMethod,
      totalPrice: paymentMethod === 'credit' ? totalPriceWithSurcharge : totalPrice
    });
  };

  return (
    <section
      id="registro"
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      {/* Fondos (iguales a CombosGrid) */}
      <img
        src="/bg-texture-dark.png"
        alt="Fondo texturizado"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      <img
        src="/inscripcion-desktop.jpg"
        alt="Background Desktop"
        className="hidden lg:block absolute inset-0 w-full h-full object-contain"
        style={{
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
        }}
      />

      <img
        src="/bg-texture-dark.png"
        alt="Background Mobile"
        className="lg:hidden absolute inset-0 w-full h-full object-contain"
        style={{
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
        }}
      />

      <div
        className="lg:hidden absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 15%, transparent 87%, rgb(0, 0, 0) 100%)'
        }}
      />

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

              <div className="text-2xl md:text-3xl font-bold text-center text-white">
                Registro de Entrada
              </div>

              <div className="h-1 w-20 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] rounded-full my-3 m-auto"></div>

              <div className="text-sm text-center text-white/80">
                Completa tus datos para asegurar tu lugar
              </div>
            </div>
          </div>

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
                    <h3 className="text-xl font-black text-white mb-2">
                      {selectedPackage.titulo}
                    </h3>
                    <p className="text-white/70 text-sm mb-3">
                      {selectedPackage.descripcion}
                    </p>
                    <div className="text-3xl font-black text-white mb-3">
                      ${selectedPackage.precio.toLocaleString('es-AR')} <span className="text-sm text-white/60 font-normal">por persona</span>
                    </div>

                    {/* Selector de cantidad */}
                    <div className="flex items-center gap-3 mt-4">
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
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Total:</span>
                        <span className="text-2xl font-black text-white">
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

                  {/* Formulario: Datos del Comprador */}
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
                  <div className="space-y-4 max-h-[550px] overflow-y-auto p-2 border border-white/10 rounded-lg">
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
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-white/80" htmlFor={`guest-phone-${index}`}>
                              Número de Teléfono
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
                        <h3 className="text-xl font-black text-white mb-2">
                          {selectedPackage.titulo}
                        </h3>
                        <p className="text-white/70 text-sm mb-3">
                          {selectedPackage.descripcion}
                        </p>
                        <div className="text-3xl font-black text-white mb-3">
                          ${selectedPackage.precio.toLocaleString('es-AR')} <span className="text-sm text-white/60 font-normal">por persona</span>
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
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">Total:</span>
                            <span className="text-2xl font-black text-white">
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
                onClick={() => handleSubmit('cash')}
                className="w-full flex items-center justify-center gap-3
                           bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF]
                           hover:from-[#7A35E6] hover:to-[#7A35E6]
                           text-white font-bold text-lg py-4 px-6 rounded-lg
                           shadow-lg border-2 border-[#8B3FFF]/20
                           hover:border-[#8B3FFF]/40 transition-all duration-300
                           transform hover:-translate-y-0.5 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6"></circle>
                  <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
                  <path d="M7 6h1v4"></path>
                  <path d="m16.71 13.88.7.71-2.82 2.82"></path>
                </svg>
                Efectivo y transferencia
              </button>
            </div>
          </div>

          {/* Footer - Logo JUVECONFE (Desktop only) */}
          <div className="hidden lg:flex justify-end items-center gap-4 mt-8 px-6">
            <div className="text-right">
              <p className="text-[#CCFF00] text-base lg:text-lg font-normal leading-tight">
                CONFERENCIA JUVENIL<br/>
                BAHIA BLANCA
              </p>
            </div>
            <div className="bg-[#CCFF00] px-6 py-2 rounded">
              <span className="text-[#8B3FFF] font-black text-2xl lg:text-3xl">
                JUVECONFE
              </span>
            </div>
          </div>

        </form>
      </div>
    </section>
  );
}
