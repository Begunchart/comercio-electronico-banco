import { useState } from 'react';
import { API_URL } from '../../config';

export function TellerView() {
    const [userId, setUserId] = useState('');
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
                throw new Error("No token found. Login as teller first.");
            }

            const res = await fetch(`${API_URL}/core/admin/mint-money`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    amount: parseFloat(amount)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Failed to mint money');
            }

            setStatus('success');
            setMessage(`Successfully injected $${amount} to User ID ${userId}. New Balance: ${data.new_balance}`);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                            Teller Terminal 🏧
                        </h2>
                    </div>

                    <form onSubmit={handleMint} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">User ID (Matrix ID)</label>
                            <input
                                type="number"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white"
                                placeholder="123"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Amount to Inject ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white"
                                placeholder="1000000"
                                required
                            />
                        </div>

                        {status === 'error' && (
                            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                                {message}
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing Transaction...' : 'AUTHORIZE DEPOSIT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
