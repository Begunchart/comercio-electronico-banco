import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Home } from './components/Home';
import { CreateAccount } from './components/CreateAccount';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TellerView } from './components/staff/TellerView';
import { CustomerServiceView } from './components/staff/CustomerServiceView';
import { MintMoney } from './components/MintMoney';
import { ThemeToggle } from './components/ThemeToggle';
import { User } from './types';

const API_URL = 'http://localhost:8080';

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));

  // Effect to validate token/load user on mount
  useEffect(() => {
    if (authToken) {
      // Fetch user profile
      fetch(`${API_URL}/auth/users/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then(data => {
          setCurrentUser({
            username: data.username,
            full_name: data.full_name,
            role: data.role,
            cedula: data.cedula,
            phone: data.phone
          });
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [authToken]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        body: form
      });

      if (!res.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await res.json();
      const token = data.access_token;

      localStorage.setItem('token', token);
      setAuthToken(token);

      // Fetch User Details immediately
      const userRes = await fetch(`${API_URL}/auth/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userDetails = await userRes.json();
      const user: User = {
        username: userDetails.username,
        full_name: userDetails.full_name,
        role: userDetails.role,
        cedula: userDetails.cedula,
        phone: userDetails.phone
      };

      setCurrentUser(user);

      // Ensure Core Account Exists
      await fetch(`${API_URL}/core/accounts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Redirect
      if (user.role === 'teller') navigate('/staff/teller');
      else if (user.role === 'customer_service') navigate('/staff/service');
      else navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const handleCreateAccount = async (userData: any) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.email,
          full_name: userData.name,
          password: userData.password,
          cedula: userData.cedula,
          phone: userData.phone, // NEW: Sending phone
          role: 'client'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.detail}`);
        return;
      }

      // Auto Login
      await handleLogin(userData.email, userData.password);

    } catch (error) {
      console.error(error);
      alert("Error en registro");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="font-sans text-foreground bg-background antialiased selection:bg-primary/20">
      <ThemeToggle className="fixed top-4 left-4 z-50" />
      <Routes>
        <Route path="/" element={
          <Home
            onCreateAccount={() => navigate('/register')}
            onLogin={() => navigate('/login')}
            onAdminAccess={() => alert("Acceso restringido")}
          />
        } />

        <Route path="/register" element={
          <CreateAccount
            onBack={() => navigate('/')}
            onAccountCreated={handleCreateAccount}
          />
        } />

        <Route path="/login" element={
          <Login
            onBack={() => navigate('/')}
            onLoginSuccess={(email, password) => handleLogin(email, password)}
          />
        } />

        <Route path="/dashboard" element={
          currentUser && authToken ? (
            <Dashboard
              user={currentUser}
              onLogout={handleLogout}
              token={authToken}
              apiUrl={API_URL}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />

        {/* Staff Routes */}
        <Route path="/staff/teller" element={<TellerView />} />
        <Route path="/staff/service" element={<CustomerServiceView />} />

        {/* Hidden Route */}
        <Route path="/secret-mint" element={<MintMoney onBack={() => navigate('/dashboard')} />} />

      </Routes>
    </div>
  );
}
