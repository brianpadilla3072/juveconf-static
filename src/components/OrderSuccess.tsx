import { useState } from 'react';

interface OrderSuccessProps {
  orderId: string;
}

export default function OrderSuccess({ orderId }: OrderSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="order-success"
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center"
    >
      {/* Fondos */}
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

      <div
        className="lg:hidden absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 15%, transparent 87%, rgb(0, 0, 0) 100%)'
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="bg-black/10 rounded-2xl shadow-xl border border-white/30 p-6 md:p-8 backdrop-blur-xs">

          {/* Header con check animado */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#CCFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              ¡Orden Creada Exitosamente!
            </h1>
            <p className="text-white/70 text-lg">
              Tu orden ha sido registrada correctamente
            </p>
          </div>

          {/* Información de la Orden */}
          <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#CCFF00]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              ID de Orden
            </h2>
            <p className="font-mono text-sm md:text-base text-white bg-black/30 p-3 rounded break-all border border-white/10">
              {orderId}
            </p>
          </div>

          {/* Instrucciones de Transferencia Bancaria */}
          <div className="bg-[#8B3FFF]/20 backdrop-blur-sm p-5 rounded-lg border border-[#8B3FFF]/40 mb-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#CCFF00]">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Datos para Transferencia Bancaria
            </h3>

            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white/70 text-sm">CVU</p>
                  <button
                    onClick={() => copyToClipboard('0000003100030634838698')}
                    className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                  >
                    {copied ? '✓' : 'Copiar'}
                  </button>
                </div>
                <p className="font-mono text-lg text-white">0000003100030634838698</p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white/70 text-sm">Alias</p>
                  <button
                    onClick={() => copyToClipboard('Juveconfe25')}
                    className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                  >
                    {copied ? '✓' : 'Copiar'}
                  </button>
                </div>
                <p className="font-semibold text-lg text-white">Juveconfe25</p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Titular</p>
                <p className="text-lg text-white">Aldana Micaela Ruiz Diaz</p>
                <p className="text-sm text-white/60 mt-1">CUIL: 27-45795258-4</p>
              </div>
            </div>
          </div>

          {/* Próximos Pasos */}
          <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 mb-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#CCFF00]">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Próximos Pasos
            </h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex gap-2">
                <span className="text-[#CCFF00] font-bold">1.</span>
                <span>Realiza la transferencia bancaria al alias <strong>Juveconfe25</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#CCFF00] font-bold">2.</span>
                <span>Envía el comprobante de transferencia a <a href="https://wa.me/5492914127933" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:text-[#AADD00] font-bold underline">+54 9 291 412-7933</a></span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#CCFF00] font-bold">3.</span>
                <span>En el transcurso de 24 horas recibirás tu entrada por email</span>
              </li>
            </ul>
          </div>

          {/* Botón volver */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B3FFF] hover:bg-[#7B2FEF] text-white rounded-lg font-bold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
