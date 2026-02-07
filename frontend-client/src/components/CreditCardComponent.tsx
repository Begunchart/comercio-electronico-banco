import { CreditCard } from '../types';
import { Wifi, RotateCw } from 'lucide-react';
import { useState } from 'react';

interface CreditCardComponentProps {
  card: CreditCard;
}

export function CreditCardComponent({ card }: CreditCardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group hover:scale-[1.02] transition-transform duration-300" style={{ perspective: '1000px' }}>
      <div
        className={`relative transition-all duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ minHeight: '224px', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Card Front */}
        <div
          className="absolute inset-0 w-full h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden backface-hidden"
          style={{ background: card.color, zIndex: 2, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
        >
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
          </div>

          {/* Card Content */}
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* Chip SVG */}
                <svg className="w-10 h-8" viewBox="0 0 40 32" fill="none">
                  <rect x="2" y="2" width="36" height="28" rx="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
                  <rect x="8" y="8" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5" />
                  <rect x="24" y="8" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5" />
                  <rect x="8" y="18" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5" />
                  <rect x="24" y="18" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5" />
                </svg>
                <Wifi className="w-6 h-6 rotate-90" />
              </div>
              <div className="text-right">
                {card.type === 'visa' ? (
                  <span className="text-2xl font-bold italic">VISA</span>
                ) : (
                  <div className="flex gap-1">
                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                    <div className="w-8 h-8 rounded-full bg-orange-400 opacity-80 -ml-4"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xl tracking-wider mb-4 font-mono shadow-sm">{card.card_number}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-70 mb-1 uppercase tracking-wider">Titular</p>
                  <p className="tracking-wide font-medium">{card.cardHolder}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 mb-1 uppercase tracking-wider">Vence</p>
                  <p className="tracking-wide font-mono">{card.expiry}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div
          className="absolute inset-0 w-full h-56 rounded-2xl text-white shadow-2xl overflow-hidden backface-hidden rotate-y-180"
          style={{ background: card.color, zIndex: 1, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}
        >
          <div className="w-full h-12 bg-black/80 mt-6 relative"></div>
          <div className="px-6 mt-6">
            <div className="flex flex-col items-end">
              <p className="text-xs mb-1 mr-2 opacity-80">CVV</p>
              <div className="bg-white text-gray-900 px-4 py-2 rounded font-mono text-sm tracking-widest font-bold">
                {card.cvv}
              </div>
            </div>
            <p className="text-[10px] mt-8 opacity-60 text-justify leading-tight">
              Esta tarjeta es propiedad del Banco CreditBank. El uso de la misma implica la aceptación de los términos y condiciones del contrato. En caso de extravío, notificar inmediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Flip Button & Info */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md space-y-4">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          {isFlipped ? 'Ver Frente' : 'Ver Reverso (CVV)'}
        </button>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Estado</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Activa
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Tipo de Cuenta</span>
            <span className="text-gray-900 font-medium">Corriente</span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Tarjeta de Débito asociada a tu cuenta principal
          </p>
        </div>
      </div>
    </div>
  );
}