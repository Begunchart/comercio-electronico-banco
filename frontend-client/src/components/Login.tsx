import { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LoginProps {
  onBack: () => void;
  onRegister: () => void;
  onLoginSuccess: (email: string, password: string) => void;
}

export function Login({ onBack, onRegister, onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(formData.email, formData.password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Iniciar Sesión</h2>
            <p className="text-muted-foreground">
              Accede a tu cuenta para gestionar tus tarjetas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-primary hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-muted-foreground text-center mt-6">
            ¿No tienes cuenta?{' '}
            <button onClick={onRegister} className="text-primary hover:underline font-medium">
              Crear una nueva cuenta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}