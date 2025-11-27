import { CreditCard } from '../App';
import { Wifi } from 'lucide-react';

interface CreditCardComponentProps {
  card: CreditCard;
}

export function CreditCardComponent({ card }: CreditCardComponentProps) {
  const usedPercentage = (card.balance / card.limit) * 100;

  return (
    <div className="group perspective">
      <div className="relative transition-transform duration-500 transform-style-3d">
        {/* Card Front */}
        <div
          className="relative w-full h-56 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
          style={{ background: card.color }}
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
                  <rect x="2" y="2" width="36" height="28" rx="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
                  <rect x="8" y="8" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5"/>
                  <rect x="24" y="8" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5"/>
                  <rect x="8" y="18" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5"/>
                  <rect x="24" y="18" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.5"/>
                </svg>
                <Wifi className="w-6 h-6 rotate-90" />
              </div>
              <div className="text-right">
                {card.type === 'visa' ? (
                  <span className="text-2xl">VISA</span>
                ) : (
                  <div className="flex gap-1">
                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                    <div className="w-8 h-8 rounded-full bg-orange-400 opacity-80 -ml-4"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xl tracking-wider mb-4">{card.cardNumber}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-70 mb-1">Titular</p>
                  <p className="tracking-wide">{card.cardHolder}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 mb-1">Vence</p>
                  <p className="tracking-wide">{card.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Info Below */}
        <div className="mt-4 bg-white p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Límite de crédito</span>
            <span className="text-gray-900">${card.limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Disponible</span>
            <span className="text-green-600">
              ${(card.limit - card.balance).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${usedPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-center mt-2">
            {usedPercentage.toFixed(0)}% utilizado
          </p>
        </div>
      </div>
    </div>
  );
}