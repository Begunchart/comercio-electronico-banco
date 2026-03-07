import { useState, useEffect } from 'react';
import { Card } from '../../types';
import { CreditCardComponent } from '../CreditCardComponent';
import { Plus } from 'lucide-react';

interface CardsProps {
    token: string;
    coreApiUrl: string;
    userFullName: string;
}

export function Cards({ token, coreApiUrl, userFullName }: CardsProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = () => {
        setLoading(true);
        fetch(`${coreApiUrl}/cards/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // Map API response to Card type with colors
                const mapped: Card[] = Array.isArray(data) ? data.map(c => ({
                    ...c,
                    cardHolder: userFullName,
                    color: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Default blueish
                    limit: c.credit_limit || 0, // Map credit limit
                    balance: 0, // Visual placeholder
                    type: 'mastercard'
                })) : [];
                // Add random colors for variety
                const colored = mapped.map((c, i) => ({
                    ...c,
                    color: i % 2 === 0
                        ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' // Slate
                        : 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)'  // Blue
                }));
                setCards(colored);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCards();
    }, [token, coreApiUrl]);

    const handleAddCard = async () => {
        try {
            const res = await fetch(`${coreApiUrl}/cards`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCards();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div>
                    <h3 className="font-semibold text-lg">Mis Tarjetas</h3>
                    <p className="text-sm text-muted-foreground">Gestiona tus tarjetas de débito</p>
                </div>
                <button
                    onClick={handleAddCard}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Tarjeta
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">Cargando tarjetas...</div>
                ) : cards.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        No tienes tarjetas activas.
                    </div>
                ) : (
                    cards.map(card => (
                        <div key={card.card_number} className="w-full">
                            <CreditCardComponent card={card} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
