import { useEffect, useState } from 'react';
import OrderSuccess from './OrderSuccess';

export default function OrderSuccessWrapper() {
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('orderId') || '');
  }, []);

  if (!orderId) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </section>
    );
  }

  return <OrderSuccess orderId={orderId} />;
}
