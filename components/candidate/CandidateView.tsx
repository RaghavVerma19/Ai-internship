import React, { useState } from 'react';
import Header from '../layout/Header';
import OnboardingWizard from './OnboardingWizard';
import Dashboard from './Dashboard';
import Suggestions from './Suggestions';
import QuizView from './QuizView'; // New component for Quiz
import type { CandidateProfile, RankedInternship, ProfileAnalysis } from '../../types';
import { LayoutDashboard, Lightbulb, BotMessageSquare, RotateCcw, Puzzle } from 'lucide-react';

type View = 'onboarding' | 'dashboard' | 'suggestions' | 'quiz';

interface CandidateViewProps {
    onStartOver: () => void;
}

const CandidateView: React.FC<CandidateViewProps> = ({ onStartOver }) => {
    const [view, setView] = useState<View>('onboarding');
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [rankedInternships, setRankedInternships] = useState<RankedInternship[]>([]);
    const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
    
    const handleOnboardingComplete = (
        completedProfile: CandidateProfile,
        internships: RankedInternship[],
        analysis: ProfileAnalysis
    ) => {
        setProfile(completedProfile);
        setRankedInternships(internships);
        setProfileAnalysis(analysis);
        setView('dashboard');
    };

    const renderCurrentView = () => {
        switch(view) {
            case 'onboarding':
                return <OnboardingWizard onComplete={handleOnboardingComplete} />;
            case 'dashboard':
                return <Dashboard internships={rankedInternships} profile={profile} />;
            case 'suggestions':
                return profileAnalysis ? <Suggestions analysis={profileAnalysis} /> : null;
            case 'quiz':
                 return profile ? <QuizView profile={profile} /> : null;
            default:
                return <OnboardingWizard onComplete={handleOnboardingComplete} />;
        }
    };
    
    const getHeaderTitle = () => {
        switch(view) {
            case 'onboarding': return "Build Your Profile";
            case 'dashboard': return "Internship Dashboard";
            case 'suggestions': return "AI Analysis & Suggestions";
            case 'quiz': return "Interview Prep Quiz";
            default: return "Candidate Portal";
        }
    }

    const NavButton = ({ currentView, targetView, onClick, disabled, icon: Icon, label }: { currentView?: View, targetView?: View, onClick: () => void, disabled?: boolean, icon: React.ElementType, label: string }) => (
        <li>
            <button 
                onClick={onClick} 
                disabled={disabled} 
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${currentView === targetView ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary hover:bg-black/5 dark:hover:bg-white/5'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <Icon className="w-5 h-5" />
                {label}
            </button>
        </li>
    );

    return (
        <div className="flex h-screen bg-background dark:bg-dark-background">
            <nav className="w-64 border-r border-border dark:border-dark-border bg-surface dark:bg-dark-surface p-4 flex flex-col flex-shrink-0">
                <button
                    onClick={onStartOver}
                    className="font-medium text-xl mb-8 text-primary dark:text-dark-primary flex items-center gap-2 px-2 transition-opacity hover:opacity-80 text-left"
                    aria-label="Go to homepage"
                >
                   <BotMessageSquare className="w-6 h-6"/>
                   <span>InternAI</span>
                </button>
                <ul className="space-y-1">
                    <NavButton currentView={view} targetView="dashboard" onClick={() => setView('dashboard')} disabled={!profile} icon={LayoutDashboard} label="Dashboard" />
                    <NavButton currentView={view} targetView="suggestions" onClick={() => setView('suggestions')} disabled={!profile} icon={Lightbulb} label="Suggestions" />
                    <NavButton currentView={view} targetView="quiz" onClick={() => setView('quiz')} disabled={!profile} icon={Puzzle} label="Quiz" />
                    <li className="pt-4 mt-auto">
                        <NavButton onClick={onStartOver} icon={RotateCcw} label="Start Over" />
                    </li>
                </ul>
            </nav>
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title={getHeaderTitle()} />
                <div className="flex-1 overflow-y-auto p-8">
                    {renderCurrentView()}
                </div>
            </main>
        </div>
    );
};

export default CandidateView;