import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') as "light" | "dark" || "light";
        }
        return "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full shadow-md transition-colors duration-300 border
        ${theme === 'light' ? 'bg-background text-foreground border-border hover:bg-muted' : 'bg-background text-yellow-400 border-border hover:bg-muted'}
        ${className || ''}
      `}
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}
