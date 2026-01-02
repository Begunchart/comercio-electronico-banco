import { useState, useEffect } from 'react';
import { User, Account, Notification } from '../types';
import { LayoutDashboard, CreditCard, ArrowRightLeft, History, LogOut, Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { Overview } from './dashboard/Overview';
import { Movements } from './dashboard/Movements';
import { Cards } from './dashboard/Cards';
import { Transfers } from './dashboard/Transfers';
import { ThemeToggle } from './ThemeToggle';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  token: string;
  apiUrl: string;
}

type Tab = 'overview' | 'movements' | 'cards' | 'transfers';

export function Dashboard({ user, onLogout, token, apiUrl }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchAccount = () => {
    fetch(`${apiUrl}/core/accounts/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.detail) setAccount(data);
      })
      .catch(console.error);
  };

  const fetchNotifications = () => {
    fetch(`${apiUrl}/core/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setHasUnreadNotifications(data.some(n => n.is_read === 0));
        }
      })
      .catch(console.error);
  }

  useEffect(() => {
    fetchAccount();
    fetchNotifications();
    // Poll every 10s
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token, apiUrl]);

  const markRead = () => {
    fetch(`${apiUrl}/core/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setHasUnreadNotifications(false);
      fetchNotifications();
    });
  };

  const navItems = [
    { id: 'overview', label: 'Posición Global', icon: LayoutDashboard },
    { id: 'movements', label: 'Movimientos', icon: History },
    { id: 'cards', label: 'Mis Tarjetas', icon: CreditCard },
    { id: 'transfers', label: 'Transferencias', icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-10 text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CreditBank</span>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t mt-auto space-y-4">
            {/* Simple User Info Mini-Card */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                {user.full_name ? user.full_name[0] : user.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name || user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.phone || 'No phone'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <h1 className="text-xl font-semibold hidden md:block">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <ThemeToggle />
            <button
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (hasUnreadNotifications) markRead();
              }}
            >
              <Bell className="w-5 h-5" />
              {hasUnreadNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-card animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl py-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notificaciones</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">No tienes notificaciones.</p>
                  ) : (
                    notifications.map((notif, i) => (
                      <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-default ${i !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''} ${notif.is_read === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{new Date(notif.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && <Overview account={account} token={token} apiUrl={apiUrl} />}
            {activeTab === 'movements' && <Movements token={token} apiUrl={apiUrl} />}
            {activeTab === 'cards' && <Cards token={token} apiUrl={apiUrl} userFullName={user.full_name || user.username} />}
            {activeTab === 'transfers' && (
              <Transfers
                token={token}
                apiUrl={apiUrl}
                myAccount={account}
                onTransferSuccess={fetchAccount}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}