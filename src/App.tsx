import { useState } from 'react';
import { Home } from './components/Home';
import { CreateAccount } from './components/CreateAccount';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

type View = 'home' | 'create-account' | 'login' | 'dashboard';

export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
}

export interface CreditCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  type: 'visa' | 'mastercard';
  limit: number;
  balance: number;
  color: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  const handleCreateAccount = (user: User) => {
    setCurrentUser(user);
    // Generar tarjeta de crédito inicial
    const initialCard: CreditCard = {
      id: '1',
      cardNumber: generateCardNumber(),
      cardHolder: user.name.toUpperCase(),
      expiryDate: generateExpiryDate(),
      cvv: generateCVV(),
      type: Math.random() > 0.5 ? 'visa' : 'mastercard',
      limit: 5000,
      balance: 0,
      color: getRandomCardColor(),
    };
    setCreditCards([initialCard]);
    setCurrentView('dashboard');
  };

  const handleLogin = (email: string) => {
    // Simulación de login
    const user: User = {
      id: '1',
      name: 'Usuario Demo',
      email: email,
      accountNumber: '1234567890',
    };
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCreditCards([]);
    setCurrentView('home');
  };

  const handleAddCard = () => {
    const newCard: CreditCard = {
      id: String(creditCards.length + 1),
      cardNumber: generateCardNumber(),
      cardHolder: currentUser!.name.toUpperCase(),
      expiryDate: generateExpiryDate(),
      cvv: generateCVV(),
      type: Math.random() > 0.5 ? 'visa' : 'mastercard',
      limit: 5000 + (creditCards.length * 2000),
      balance: 0,
      color: getRandomCardColor(),
    };
    setCreditCards([...creditCards, newCard]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === 'home' && (
        <Home 
          onCreateAccount={() => setCurrentView('create-account')}
          onLogin={() => setCurrentView('login')}
        />
      )}
      {currentView === 'create-account' && (
        <CreateAccount 
          onBack={() => setCurrentView('home')}
          onAccountCreated={handleCreateAccount}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onBack={() => setCurrentView('home')}
          onLoginSuccess={handleLogin}
        />
      )}
      {currentView === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser}
          creditCards={creditCards}
          onLogout={handleLogout}
          onAddCard={handleAddCard}
        />
      )}
    </div>
  );
}

// Funciones auxiliares
function generateCardNumber(): string {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  const part3 = Math.floor(1000 + Math.random() * 9000);
  const part4 = Math.floor(1000 + Math.random() * 9000);
  return `${part1} ${part2} ${part3} ${part4}`;
}

function generateExpiryDate(): string {
  const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const year = String(new Date().getFullYear() + Math.floor(2 + Math.random() * 4)).slice(-2);
  return `${month}/${year}`;
}

function generateCVV(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

function getRandomCardColor(): string {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
