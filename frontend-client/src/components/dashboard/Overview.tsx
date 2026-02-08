import { useState, useEffect } from 'react';
import { Account, Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface OverviewProps {
    account: Account | null;
    token: string;
    coreApiUrl: string;
}

export function Overview({ account, token, coreApiUrl }: OverviewProps) {
    const [stats, setStats] = useState({ income: 0, expense: 0 });

    useEffect(() => {
        if (!token) return;

        fetch(`${coreApiUrl}/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    let income = 0;
                    let expense = 0;
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    data.forEach((tx: Transaction) => {
                        const txDate = new Date(tx.timestamp);
                        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                            if (tx.amount > 0) {
                                income += tx.amount;
                            } else {
                                expense += Math.abs(tx.amount);
                            }
                        }
                    });
                    setStats({ income, expense });
                }
            })
            .catch(console.error);
    }, [token, coreApiUrl]);

    if (!account) return <div className="p-4 text-muted-foreground">Cargando cuentas...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Main Balance Card */}
                <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Saldo Disponible</h3>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4">
                        <div className="text-4xl font-bold tracking-tighter">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cuenta Corriente: <span className="font-mono text-primary/80">{account.account_number}</span>
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Ingresos (Mes)</h3>
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-emerald-600">
                            +${stats.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Gastos (Mes)</h3>
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-rose-600">
                            -${stats.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
