import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Home } from './components/Home';
import { CreateAccount } from './components/CreateAccount';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TellerView } from './components/staff/TellerView';
import { CustomerServiceView } from './components/staff/CustomerServiceView';
import { MintMoney } from './components/MintMoney';
import { SessionTimeout } from './components/SessionTimeout';
import { User } from './types';

import { API_URL } from './config';
const INACTIVITY_LIMIT = 2.5 * 60 * 1000; // 2 minutes 30 seconds

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(
    sessionStorage.getItem('token')
  );

  // Timeout State
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    sessionStorage.removeItem('token');
    setShowTimeoutModal(false);
    navigate('/');
  }, [navigate]);

  // Activity Tracker
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const resetTimer = () => {
      if (!showTimeoutModal) {
        setLastActivity(Date.now());
      }
    };

    // Check inactivity every second
    const interval = setInterval(() => {
      if (authToken && !showTimeoutModal) {
        const now = Date.now();
        if (now - lastActivity > INACTIVITY_LIMIT) {
          setShowTimeoutModal(true);
        }
      }
    }, 1000);

    // Add listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [authToken, showTimeoutModal, lastActivity]);

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
  }, [authToken, handleLogout]);

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

      // Always use sessionStorage for security (cleared on browser close)
      sessionStorage.setItem('token', token);

      setAuthToken(token);
      setLastActivity(Date.now()); // Reset activity on login

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
          phone: userData.phone,
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

  const extendSession = () => {
    setLastActivity(Date.now());
    setShowTimeoutModal(false);
  };

  return (
    <div className="font-sans text-foreground bg-background antialiased selection:bg-primary/20">
      <SessionTimeout
        isOpen={showTimeoutModal}
        onExtend={extendSession}
        onLogout={handleLogout}
      />

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
            onRegister={() => navigate('/register')}
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

