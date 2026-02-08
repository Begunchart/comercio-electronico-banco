import { useState, useEffect } from 'react';
import { Beneficiary, Account } from '../../types';
import { Users, Send, Plus, Save, CreditCard, Phone, User } from 'lucide-react';

interface TransfersProps {
    token: string;
    coreApiUrl: string;
    myAccount: Account | null;
    onTransferSuccess: () => void;
}

export function Transfers({ token, coreApiUrl, myAccount, onTransferSuccess }: TransfersProps) {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [amount, setAmount] = useState('');
    const [destAccount, setDestAccount] = useState('');
    const [destCedula, setDestCedula] = useState('');
    const [destPhone, setDestPhone] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // New Beneficiary State
    const [showAddBen, setShowAddBen] = useState(false);
    const [newBenName, setNewBenName] = useState('');
    const [newBenAccount, setNewBenAccount] = useState('');
    const [newBenAlias, setNewBenAlias] = useState('');
    const [newBenCedula, setNewBenCedula] = useState('');
    const [newBenPhone, setNewBenPhone] = useState('');

    useEffect(() => {
        fetch(`${coreApiUrl}/beneficiaries`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setBeneficiaries(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, [token, coreApiUrl]);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            const res = await fetch(`${coreApiUrl}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    to_account_number: destAccount,
                    beneficiary_cedula: destCedula,
                    beneficiary_phone: destPhone,
                    amount: parseFloat(amount),
                    description: description || 'Transferencia'
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error en transferencia');

            setMessage({ type: 'success', text: 'Transferencia realizada con éxito' });
            setAmount('');
            setDescription('');
            setDestCedula('');
            setDestPhone('');
            // Keep account maybe? or clear it. Let's clear to force explicit entry or selection
            // setDestAccount(''); 
            onTransferSuccess(); // Refresh balance
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleSaveBeneficiary = async () => {
        try {
            const res = await fetch(`${coreApiUrl}/beneficiaries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newBenName,
                    account_number: newBenAccount,
                    alias: newBenAlias,
                    cedula: newBenCedula,
                    phone: newBenPhone
                })
            });
            if (res.ok) {
                const newBen = await res.json();
                setBeneficiaries([...beneficiaries, newBen]);
                setShowAddBen(false);
                setNewBenName('');
                setNewBenAccount('');
                setNewBenAlias('');
                setNewBenCedula('');
                setNewBenPhone('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Transfer Form */}
            <div className="space-y-6">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Send className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Nueva Transferencia</h3>
                    </div>

                    <form onSubmit={handleTransfer} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cuenta Destino</label>
                            <div className="relative mt-2">
                                <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="10 dígitos"
                                    value={destAccount}
                                    onChange={e => setDestAccount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cédula</label>
                                <div className="relative mt-2">
                                    <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="V-123456"
                                        value={destCedula}
                                        onChange={e => setDestCedula(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Teléfono</label>
                                <div className="relative mt-2">
                                    <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="0414..."
                                        value={destPhone}
                                        onChange={e => setDestPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Monto</label>
                            <div className="relative mt-2">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Concepto (Opcional)</label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                placeholder="Ej. Almuerzo"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                            Transferir
                        </button>
                    </form>
                </div>
            </div>

            {/* Beneficiaries */}
            <div className="space-y-6">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Beneficiarios</h3>
                        </div>
                        <button
                            onClick={() => setShowAddBen(!showAddBen)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {showAddBen && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Nombre"
                                value={newBenName}
                                onChange={e => setNewBenName(e.target.value)}
                            />
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Cuenta (10 dígitos)"
                                value={newBenAccount}
                                onChange={e => setNewBenAccount(e.target.value)}
                            />
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Cédula"
                                value={newBenCedula}
                                onChange={e => setNewBenCedula(e.target.value)}
                            />
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Teléfono"
                                value={newBenPhone}
                                onChange={e => setNewBenPhone(e.target.value)}
                            />
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Alias (Opcional)"
                                value={newBenAlias}
                                onChange={e => setNewBenAlias(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowAddBen(false)} className="text-sm px-3 py-1 hover:underline">Cancelar</button>
                                <button onClick={handleSaveBeneficiary} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                                    <Save className="w-3 h-3 mr-2" /> Guardar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 overflow-y-auto flex-1 max-h-[400px]">
                        {beneficiaries.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-4">No tienes beneficiarios guardados.</p>
                        ) : (
                            beneficiaries.map(ben => (
                                <div
                                    key={ben.id}
                                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors flex justify-between items-center group"
                                    onClick={() => {
                                        setDestAccount(ben.account_number);
                                        setDestCedula(ben.cedula || '');
                                        setDestPhone(ben.phone || '');
                                        setAmount('');
                                    }}
                                >
                                    <div>
                                        <p className="font-medium text-sm">{ben.alias || ben.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{ben.account_number}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Send className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
