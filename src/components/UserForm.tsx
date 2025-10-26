import { useState } from 'react';

interface UserFormProps {
  selectedCombo: {
    id: string;
    title: string;
    price: number;
  };
  onBack: () => void;
}

export default function UserForm({ selectedCombo, onBack }: UserFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del formulario:', { ...formData, combo: selectedCombo });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="form" className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-gray-600 mb-6 break-words">
              Hemos recibido tu solicitud para el {selectedCombo.title}. Te contactaremos pronto.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
                onBack();
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Ver más combos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="py-16 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-purple-600 hover:text-purple-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a los combos
        </button>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
            Combo seleccionado: {selectedCombo.title}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-purple-600 break-words">${selectedCombo.price}</span>
            <span className="text-purple-600 font-semibold">USD</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 break-words">
          Completa tus datos
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
              placeholder="Calle Principal 123, Ciudad"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg"
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </section>
  );
}
