import { CreditCard, UserPlus, LogIn, Shield, Wallet, TrendingUp } from 'lucide-react';
import logoImage from 'figma:asset/65e92236dcc293ad564d2129716c5287a52b553e.png';

interface HomeProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function Home({ onCreateAccount, onLogin }: HomeProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="CreditBank Logo" className="h-16 w-auto" />
            </div>
            <button
              onClick={onLogin}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-gray-900 mb-4">
            Tu Banco Digital de Confianza
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Obtén tu tarjeta de crédito al instante y comienza a disfrutar de todos los beneficios que BankPro tiene para ti. Sin complicaciones, 100% digital.
          </p>
          
          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onCreateAccount}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 active:shadow-md min-w-64"
            >
              <div className="flex items-center justify-center gap-3">
                <UserPlus className="w-6 h-6" />
                <span>Crear Cuenta Nueva</span>
              </div>
            </button>
            
            <button
              onClick={onLogin}
              className="group relative bg-white text-blue-600 px-8 py-4 rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 active:scale-95 active:bg-blue-100 min-w-64"
            >
              <div className="flex items-center justify-center gap-3">
                <LogIn className="w-6 h-6" />
                <span>Iniciar Sesión</span>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Seguridad Garantizada</h3>
            <p className="text-gray-600">
              Tus datos y transacciones están protegidos con la más alta tecnología de encriptación.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Múltiples Tarjetas</h3>
            <p className="text-gray-600">
              Genera todas las tarjetas de crédito que necesites para organizar tus gastos.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Límites Flexibles</h3>
            <p className="text-gray-600">
              Aumenta tu línea de crédito conforme uses tus tarjetas de manera responsable.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white">
          <h2 className="mb-4">¿Listo para comenzar?</h2>
          <p className="mb-8 text-blue-100 max-w-2xl mx-auto">
            Crea tu cuenta en menos de 5 minutos y obtén tu primera tarjeta de crédito virtual al instante.
          </p>
          <button
            onClick={onCreateAccount}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 active:scale-95"
          >
            Comenzar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}