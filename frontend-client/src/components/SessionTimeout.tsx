import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionTimeoutProps {
    isOpen: boolean;
    onExtend: () => void;
    onLogout: () => void;
}

export function SessionTimeout({ isOpen, onExtend, onLogout }: SessionTimeoutProps) {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(60);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, onLogout]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 border"
                style={{
                    backgroundColor: 'var(--modal-static-bg)',
                    color: 'var(--modal-static-text)',
                    borderColor: 'var(--modal-static-border)'
                }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">
                        Sesión por expirar
                    </h2>

                    <p className="mb-6 opacity-80">
                        Por seguridad, tu sesión se cerrará automáticamente en:
                    </p>

                    <div className="flex items-center gap-2 text-4xl font-mono font-bold text-primary mb-8">
                        <Clock className="w-8 h-8" />
                        <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onLogout}
                            className="flex-1 px-4 py-2 border hover:opacity-80 font-medium rounded-lg transition-all"
                            style={{
                                borderColor: 'var(--modal-static-border)',
                                color: 'var(--modal-static-text)'
                            }}
                        >
                            Cerrar Sesión
                        </button>
                        <button
                            onClick={onExtend}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-bold transition-opacity"
                        >
                            Extender Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
