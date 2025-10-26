export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-black">
      {/* Fondo texturizado */}
      <img
        src="/bg-texture-dark.png"
        alt="Fondo texturizado"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Degradado superior para transición suave */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%)'
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 py-12 sm:py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Columna 1: Branding */}
            <div className="space-y-6">
              {/* Logo/Título JUVECONFE */}
              <div className="flex items-center space-x-3">
                <div className="bg-[#CCFF00] px-4 py-2 rounded">
                  <span className="text-[#8B3FFF] font-black text-xl sm:text-2xl">
                    JUVECONFE
                  </span>
                </div>
              </div>

              {/* Texto adicional */}
              <p className="text-white/70 text-sm leading-relaxed break-words hyphens-auto">
                CONFERENCIA JUVENIL<br/>
                <span className="text-[#CCFF00]">BAHÍA BLANCA</span>
              </p>
            </div>

            {/* Columna 2: Versículo + Redes */}
            <div className="space-y-6">
              {/* Versículo */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6">
                <p className="text-white/90 text-sm sm:text-base leading-relaxed break-words">
                  "A LA MEDIDA DE LA ESTATURA<br/>
                  DE LA PLENITUD DE CRISTO"<br/>
                  <span className="text-[#CCFF00] font-semibold text-xs sm:text-sm mt-2 block">
                    EFESIOS 4:13
                  </span>
                </p>
              </div>

              {/* Redes sociales */}
              <div className="flex space-x-4 pt-2">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/juveconfe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#CCFF00] transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <span className="sr-only">Instagram</span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-[#8B3FFF]/30 hover:border-[#8B3FFF]/50 transition-all duration-300 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </div>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/juveconfe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#CCFF00] transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <span className="sr-only">Facebook</span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-[#8B3FFF]/30 hover:border-[#8B3FFF]/50 transition-all duration-300 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Columna 3: Contacto */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#CCFF00] mb-6 pb-2 border-b border-[#8B3FFF]/50">
                CONTÁCTANOS
              </h3>
              <ul className="space-y-4 sm:space-y-5">
                {/* Email */}
                <li className="flex items-start group">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-[#8B3FFF] group-hover:text-[#CCFF00] transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <a
                    href="mailto:contacto@juveconfe.com"
                    className="ml-3 text-white/80 hover:text-[#CCFF00] transition-colors duration-300 break-words text-sm sm:text-base"
                  >
                    contacto@juveconfe.com
                  </a>
                </li>

                {/* WhatsApp */}
                <li className="flex items-start group">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-[#8B3FFF] group-hover:text-[#CCFF00] transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-white/80 text-sm sm:text-base">
                    <a
                      href="https://wa.me/5492914326563"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CCFF00] hover:text-[#8B3FFF] transition-colors duration-300 break-words"
                    >
                      +54 9 291 432 6563
                    </a>
                  </span>
                </li>

                {/* Ubicación */}
                <li className="flex items-start group">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-[#8B3FFF] group-hover:text-[#CCFF00] transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </div>
                  <span className="ml-3 text-white/80 break-words text-sm sm:text-base">
                    Bahía Blanca, Buenos Aires, Argentina
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 text-xs sm:text-sm break-words">
              © {new Date().getFullYear()} JUVECONFE - Conferencia Juvenil Bahía Blanca. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
