import { useState } from 'react';
import { API_URL } from '../../config';

export function SuperAdminView() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'teller' | 'customer_service'>('teller');

    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No token");

            const res = await fetch(`${API_URL}/auth/admin/create-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to create staff');
            }

            setStatus('success');
            setMessage(`Staff member ${username} (${role}) created successfully.`);
            setUsername('');
            setPassword('');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            System Admin ⚡
                        </h2>
                    </div>

                    <form onSubmit={handleCreateStaff} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Staff Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white"
                            >
                                <option value="teller">Teller (Cashier)</option>
                                <option value="customer_service">Customer Service (Accounts)</option>
                            </select>
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
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95"
                        >
                            CREATE STAFF USER
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
