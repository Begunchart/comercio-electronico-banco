import { useState } from 'react';
import { Search, CreditCard, DollarSign } from 'lucide-react';
import { API_URL } from '../../config';

export function CustomerServiceView() {
    const [cedula, setCedula] = useState('');
    const [foundUser, setFoundUser] = useState<any>(null);
    const [amount, setAmount] = useState('');

    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setFoundUser(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authorized");

            const res = await fetch(`${API_URL}/auth/users/search?cedula=${cedula}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 404) throw new Error("Usuario no encontrado");
                throw new Error("Error buscando usuario");
            }

            const data = await res.json();
            setFoundUser(data);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInject = async () => {
        if (!foundUser || !amount) return;
        setLoading(true);
        setStatus('idle');

        try {
            const token = localStorage.getItem('token');
            // Assuming we reuse the mint-money endpoint but restricted to staff? 
            // Previous requirements said Teller uses Money Printer, Customer Service creates accounts.
            // But updated requirements say: "Customer Service to print money... by cedula".
            // So we call the same endpoint.

            const res = await fetch(`${API_URL}/core/admin/mint-money`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: foundUser.id,
                    amount: parseFloat(amount)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed');

            setStatus('success');
            setMessage(`$${amount} injected successfully to ${foundUser.username}`);
            setAmount('');

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background text-foreground p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                            Atención al Cliente 🎧
                        </h2>
                    </div>

                    {/* Step 1: Search */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <label className="block text-sm font-medium mb-2">Buscar por Cédula</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="V-12345678"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                            >
                                {loading ? '...' : 'Buscar'}
                            </button>
                        </div>
                    </form>

                    {/* Step 2: Result & Action */}
                    {status === 'error' && (
                        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm mb-4">
                            {message}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm mb-4">
                            {message}
                        </div>
                    )}

                    {foundUser && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg">{foundUser.username}</h3>
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full capitalize">
                                        {foundUser.role}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">ID: {foundUser.id}</p>
                                <p className="text-sm text-muted-foreground">Cédula: {foundUser.cedula}</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium">Inyectar Saldo</label>
                                <div className="relative">
                                    <DollarSign className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button
                                    onClick={handleInject}
                                    disabled={loading || !amount}
                                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    PROCESAR DEPÓSITO
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
