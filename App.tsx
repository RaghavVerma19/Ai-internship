
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import LandingPage from './components/auth/AuthPage';
import CandidateView from './components/candidate/CandidateView';
import { en, hi } from './locales/translations';

// --- THEME CONTEXT ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});
export const useTheme = () => useContext(ThemeContext);


// --- LOCALE CONTEXT ---
type Locale = 'en' | 'hi';
const translations = { en, hi };

interface LocaleContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: keyof typeof en) => string;
}
export const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  toggleLocale: () => {},
  t: (key) => en[key],
});
export const useLocale = () => useContext(LocaleContext);


// --- APP COMPONENT ---
const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  const toggleLocale = () => setLocale(prevLocale => prevLocale === 'en' ? 'hi' : 'en');
  const t = (key: keyof typeof en) => translations[locale][key] || en[key];

  const themeContextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);
  const localeContextValue = useMemo(() => ({ locale, toggleLocale, t }), [locale]);

  const renderContent = () => {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <CandidateView onStartOver={() => setShowLanding(true)} />;
  };

  return (
      <ThemeContext.Provider value={themeContextValue}>
        <LocaleContext.Provider value={localeContextValue}>
          <div className="bg-background dark:bg-dark-background min-h-screen font-sans text-on-surface dark:text-dark-on-surface">
            {renderContent()}
          </div>
        </LocaleContext.Provider>
      </ThemeContext.Provider>
  );
};

export default App;
export const locales = {};
