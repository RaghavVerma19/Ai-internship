
import React from 'react';
import { useTheme, useLocale } from '../../App';
import { Sun, Moon, Languages } from 'lucide-react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const { theme, toggleTheme } = useTheme();
    const { toggleLocale } = useLocale();

    return (
        <header className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border h-16 flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
            <h1 className="text-xl font-medium text-on-surface dark:text-dark-on-surface">{title}</h1>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-primary dark:hover:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 rounded-full transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button
                    onClick={toggleLocale}
                    className="flex items-center justify-center w-10 h-10 text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-primary dark:hover:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 rounded-full transition-colors"
                    aria-label="Toggle language"
                >
                    <Languages className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;