import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, CreditCard } from 'lucide-react';
import { User as UserType } from '../App';

interface CreateAccountProps {
  onBack: () => void;
  onAccountCreated: (userData: any) => void;
}

export function CreateAccount({ onBack, onAccountCreated }: CreateAccountProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    cedula: '', // New Field
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAccountCreated(formData);
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
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Crear Cuenta Nueva</h2>
            <p className="text-muted-foreground">
              Completa el formulario para obtener tu tarjeta de crédito
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Cedula Field */}
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium mb-2">
                Cédula de Identidad
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="V-12345678"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="+58 414 000 0000"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
                  placeholder="Calle Principal 123"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
            >
              Crear Cuenta y Obtener Tarjeta
            </button>
          </form>

          <p className="text-muted-foreground text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onBack} className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function generateAccountNumber(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}