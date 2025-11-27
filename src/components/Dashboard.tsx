import { LogOut, Plus, CreditCard as CreditCardIcon } from 'lucide-react';
import { User, CreditCard } from '../App';
import { CreditCardComponent } from './CreditCardComponent';
import { TransactionsList } from './TransactionsList';
import logoImage from 'figma:asset/65e92236dcc293ad564d2129716c5287a52b553e.png';

interface DashboardProps {
  user: User;
  creditCards: CreditCard[];
  onLogout: () => void;
  onAddCard: () => void;
}

export function Dashboard({ user, creditCards, onLogout, onAddCard }: DashboardProps) {
  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const availableCredit = totalLimit - totalBalance;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="CreditBank Logo" className="h-16 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">
            Bienvenido, {user.name.split(' ')[0]}
          </h1>
          <p className="text-gray-600">
            Número de cuenta: {user.accountNumber}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 mb-1">Crédito Total</p>
            <p className="text-gray-900">${totalLimit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 mb-1">Crédito Disponible</p>
            <p className="text-green-600">${availableCredit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 mb-1">Saldo Actual</p>
            <p className="text-gray-900">${totalBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Credit Cards Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">Mis Tarjetas de Crédito</h2>
            <button
              onClick={onAddCard}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 active:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Tarjeta</span>
            </button>
          </div>

          {creditCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No tienes tarjetas de crédito aún
              </p>
              <button
                onClick={onAddCard}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 active:scale-95"
              >
                Obtener tu primera tarjeta
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creditCards.map((card) => (
                <CreditCardComponent key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <TransactionsList />
      </div>
    </div>
  );
}