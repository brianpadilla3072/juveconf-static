import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface TicketDownloadProps {
  paymentId: string;
}

interface Invitee {
  id: string;
  name: string;
  cuil: string;
  email?: string;
  phone?: string;
  paymentId: string;
  Order: {
    eventId: string;
  } | null;
}

export default function TicketDownload({ paymentId }: TicketDownloadProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3072';

  useEffect(() => {
    fetchInvitees();
  }, [paymentId]);

  const fetchInvitees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/invitees/public/by-payment/${paymentId}`);

      if (!response.ok) {
        throw new Error('No se pudieron obtener los datos de las entradas');
      }

      const data = await response.json();
      setInvitees(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTicketPDF = async (invitee: Invitee) => {
    if (!invitee.Order?.eventId) {
      alert('No se pudo obtener el ID del evento');
      return;
    }

    setDownloadingId(invitee.id);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Fondo y diseño
      pdf.setFillColor(139, 63, 255); // Color #8B3FFF
      pdf.rect(0, 0, 210, 40, 'F');

      // Logo/Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JUVECONF 2025', 105, 20, { align: 'center' });

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Conferencia Juvenil - Bahía Blanca', 105, 30, { align: 'center' });

      // Borde decorativo
      pdf.setDrawColor(139, 63, 255);
      pdf.setLineWidth(1);
      pdf.rect(15, 60, 180, 120);

      // Información del invitado
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);

      const startY = 75;
      const lineHeight = 12;

      pdf.text('ENTRADA PARA:', 25, startY);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(invitee.name.toUpperCase(), 25, startY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);

      pdf.text('DNI/CUIL:', 25, startY + 8 + lineHeight);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(invitee.cuil, 25, startY + 8 + lineHeight + 6);

      if (invitee.email) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('EMAIL:', 25, startY + 8 + lineHeight * 2 + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.text(invitee.email, 25, startY + 8 + lineHeight * 2 + 12);
      }

      // Generar QR Code con formato del scanner
      const qrContent = `inviteId: ${invitee.id}\npaymentId: ${invitee.paymentId}`;
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Agregar QR al PDF
      pdf.addImage(qrDataUrl, 'PNG', 135, 90, 50, 50);

      // Texto debajo del QR
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Escaneá este código', 160, 145, { align: 'center' });
      pdf.text('al ingresar al evento', 160, 150, { align: 'center' });

      // ID de Pago (footer)
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`ID de Pago: ${paymentId}`, 25, 170);
      pdf.text(`ID Invitado: ${invitee.id}`, 185, 170, { align: 'right' });

      // Información importante
      pdf.setDrawColor(204, 255, 0); // Color #CCFF00
      pdf.setLineWidth(0.5);
      pdf.line(15, 185, 195, 185);

      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACIÓN IMPORTANTE:', 25, 195);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(50, 50, 50);

      const instructions = [
        '• Presenta esta entrada (impresa o en tu celular) al ingresar al evento',
        '• La entrada es personal e intransferible',
        '• Llegá con anticipación para agilizar el ingreso',
        '• Consultas: equipo@juveconfe.com',
      ];

      let instructionY = 205;
      instructions.forEach((instruction) => {
        pdf.text(instruction, 25, instructionY);
        instructionY += 6;
      });

      // Footer con logo
      pdf.setFillColor(204, 255, 0); // #CCFF00
      pdf.rect(0, 270, 210, 27, 'F');

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JUVECONFE', 105, 280, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('A la medida de la estatura de la plenitud de Cristo', 105, 286, { align: 'center' });

      // Guardar PDF
      pdf.save(`JuveConf_2025_${invitee.name.replace(/\s+/g, '_')}.pdf`);

    } catch (err: any) {
      alert(`Error al generar el PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <img
          src="/bg-texture-dark.png"
          alt="Fondo texturizado"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-[#8B3FFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando entradas...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <img
          src="/bg-texture-dark.png"
          alt="Fondo texturizado"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />

        <div className="relative z-10 p-6 max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mx-auto mb-4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
            <h2 className="text-white text-xl font-bold mb-2">Error</h2>
            <p className="text-white/80">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="ticket-download"
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center py-12 px-4"
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
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#8B3FFF]/20 border-4 border-[#8B3FFF] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B3FFF]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="10" cy="13" r="2"></circle>
              <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"></path>
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Tus Entradas
          </h1>

          <p className="text-white/80 text-lg">
            Descarga tus entradas para JUVECONF 2025
          </p>

          <div className="h-1 w-20 bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] rounded-full my-4 mx-auto"></div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {invitees.map((invitee) => (
            <InviteeCard
              key={invitee.id}
              invitee={invitee}
              onDownload={() => generateTicketPDF(invitee)}
              isDownloading={downloadingId === invitee.id}
            />
          ))}
        </div>

        {/* Información */}
        <div className="max-w-2xl mx-auto bg-blue-500/20 border border-blue-500/40 rounded-lg p-4 mb-6">
          <p className="text-blue-100 text-sm flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-blue-400">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span>
              Descarga cada entrada individualmente con su código QR. Podés imprimirla o mostrarla desde tu celular el día del evento.
            </span>
          </p>
        </div>

        {/* ID de Pago */}
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm">
            ID de Pago: <span className="font-mono text-white">{paymentId}</span>
          </p>
        </div>

        {/* Botón volver */}
        <div className="max-w-md mx-auto">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </section>
  );
}

// Componente de Card individual
interface InviteeCardProps {
  invitee: Invitee;
  onDownload: () => void;
  isDownloading: boolean;
}

function InviteeCard({ invitee, onDownload, isDownloading }: InviteeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    generateQR();
  }, [invitee.id, invitee.paymentId]);

  const generateQR = async () => {
    try {
      const qrContent = `inviteId: ${invitee.id}\npaymentId: ${invitee.paymentId}`;
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR:', err);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col items-center gap-4 aspect-square justify-center">
      {/* QR Code */}
      <div className="bg-white p-3 rounded-lg">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR ${invitee.name}`} className="w-32 h-32" />
        ) : (
          <div className="w-32 h-32 bg-gray-200 animate-pulse rounded"></div>
        )}
      </div>

      {/* Nombre */}
      <div className="text-center">
        <p className="text-white font-bold text-lg">{invitee.name}</p>
        <p className="text-white/60 text-sm">DNI: {invitee.cuil}</p>
      </div>

      {/* Botón de descarga */}
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full bg-gradient-to-r from-[#8B3FFF] to-[#8B3FFF] hover:from-[#7A35E6] hover:to-[#7A35E6] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Descargando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            Descargar PDF
          </>
        )}
      </button>
    </div>
  );
}
