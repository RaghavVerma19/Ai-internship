
import React from 'react';
import { useTheme, useLocale } from '../../App';
import { Sun, Moon, Languages, UploadCloud, Target, BrainCircuit } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-surface dark:bg-dark-surface/50 rounded-lg p-6 text-center border border-border dark:border-dark-border/50">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mb-4 text-primary dark:text-dark-primary">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-on-surface dark:text-dark-on-surface">{title}</h3>
        <p className="mt-2 text-on-surface-secondary dark:text-dark-on-surface-secondary">{description}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background dark:bg-dark-background overflow-x-hidden">
        {/* Header/Nav */}
        <header className="absolute top-0 left-0 right-0 z-20">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/" className="font-bold text-xl text-on-surface dark:text-dark-on-surface transition-opacity hover:opacity-80">InternAI</a>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm hover:bg-surface/80 dark:hover:bg-dark-surface/80 transition">
                        {theme === 'light' ? <Moon className="w-5 h-5 text-on-surface-secondary" /> : <Sun className="w-5 h-5 text-dark-on-surface-secondary" />}
                    </button>
                    {/* Language toggle can be added here if needed */}
                </div>
            </nav>
        </header>
        
        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-32 pb-16 text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-on-surface dark:text-dark-on-surface tracking-tight leading-tight">
                {t('appTitle')}
            </h1>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl max-w-3xl mx-auto text-on-surface-secondary dark:text-dark-on-surface-secondary">
                {t('appSubtitle')}
            </p>
            <div className="mt-8">
                <button
                    onClick={onGetStarted}
                    className="px-8 py-3 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-full font-semibold text-lg hover:bg-primary-hover dark:hover:bg-dark-primary-hover transform hover:scale-105 transition-all shadow-lg"
                >
                    {t('getStartedNow')}
                </button>
            </div>
        </main>

        {/* How It Works Section */}
        <section className="py-16 bg-surface dark:bg-dark-surface">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{t('howItWorksTitle')}</h2>
                    <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">{t('howItWorksSubtitle')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<UploadCloud size={28} />}
                        title={t('howItWorksStep1Title')}
                        description={t('howItWorksStep1Desc')}
                    />
                    <FeatureCard
                        icon={<Target size={28} />}
                        title={t('howItWorksStep2Title')}
                        description={t('howItWorksStep2Desc')}
                    />
                    <FeatureCard
                        icon={<BrainCircuit size={28} />}
                        title={t('howItWorksStep3Title')}
                        description={t('howItWorksStep3Desc')}
                    />
                </div>
            </div>
        </section>

         {/* Features Section */}
        <section className="py-16">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{t('featuresTitle')}</h2>
                </div>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<BrainCircuit size={28} />}
                        title={t('featureAITitle')}
                        description={t('featureAIDesc')}
                    />
                    <FeatureCard
                        icon={<Target size={28} />}
                        title={t('featureAnalysisTitle')}
                        description={t('featureAnalysisDesc')}
                    />
                     <FeatureCard
                        icon={<Languages size={28} />}
                        title={t('featureMultilingualTitle')}
                        description={t('featureMultilingualDesc')}
                    />
                </div>
            </div>
        </section>
    </div>
  );
};

export default LandingPage;