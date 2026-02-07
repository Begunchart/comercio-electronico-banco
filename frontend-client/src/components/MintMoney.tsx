import { useState } from 'react';

export function MintMoney({ onBack }: { onBack: () => void }) {
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found. Login first.");
            }

            const res = await fetch('http://localhost:8080/core/admin/mint-money', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    account_number: accountNumber,
                    amount: parseFloat(amount)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Failed to mint money');
            }

            setStatus('success');
            setMessage(`Successfully injected $${amount} to Account ${accountNumber}. New Balance: ${data.new_balance}`);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-lg border p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">
                        Secret Mint 🤫
                    </h2>
                    <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        Minimizar
                    </button>
                </div>

                <form onSubmit={handleMint} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Account Number</label>
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Enter Checkings Account"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Amount ($)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="1000"
                            required
                        />
                    </div>

                    {status === 'error' && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                            {message}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 text-sm rounded-lg">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Mint Money'}
                    </button>
                </form>
            </div>
        </div>
    );
}
