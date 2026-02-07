import { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

interface MovementsProps {
    token: string;
    apiUrl: string;
}

export function Movements({ token, apiUrl }: MovementsProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch(`${apiUrl}/core/movements`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTransactions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token, apiUrl]);

    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(filter.toLowerCase()) ||
        t.amount.toString().includes(filter)
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-lg border">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <input
                    type="text"
                    placeholder="Buscar movimientos..."
                    className="bg-transparent border-none focus:outline-none text-sm w-full py-1"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Cargando movimientos...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                        <div className="bg-muted p-4 rounded-full mb-3">
                            <Search className="w-6 h-6 opacity-20" />
                        </div>
                        <p>No hay movimientos recientes.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${tx.amount < 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                                        }`}>
                                        {tx.amount < 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(tx.timestamp).toLocaleDateString()} &middot; {new Date(tx.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-mono font-medium ${tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                                    }`}>
                                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
