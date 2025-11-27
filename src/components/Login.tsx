import { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onLoginSuccess: (email: string) => void;
}

export function Login({ onBack, onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(formData.email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">
              Accede a tu cuenta para gestionar tus tarjetas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 active:shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-gray-500 text-center mt-6">
            ¿No tienes cuenta?{' '}
            <button onClick={onBack} className="text-blue-600 hover:underline">
              Crear una nueva
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}