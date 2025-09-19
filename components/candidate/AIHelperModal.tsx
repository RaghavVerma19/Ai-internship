import React, { useState } from 'react';
import type { Internship, CandidateProfile } from '../../types';
import * as geminiService from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import { X, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { useLocale } from '../../App';

interface AIHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship;
  profile: CandidateProfile;
}

type Tab = 'cover-letter' | 'interview-prep';

const AIHelperModal: React.FC<AIHelperModalProps> = ({ isOpen, onClose, internship, profile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('cover-letter');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetterPoints, setCoverLetterPoints] = useState<string[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<{ behavioral: string[]; technical: string[] } | null>(null);
  const { t } = useLocale();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'cover-letter') {
        const result = await geminiService.generateCoverLetterPoints(profile, internship);
        setCoverLetterPoints(result.points);
      } else {
        const result = await geminiService.generateInterviewQuestions(internship);
        setInterviewQuestions(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return <div className="h-64 flex items-center justify-center"><Spinner text="Generating..." /></div>;
    }
    if (error) {
      return <div className="text-red-500 p-4">{error}</div>;
    }

    if (activeTab === 'cover-letter') {
      if (coverLetterPoints.length === 0) {
        return (
          <div className="text-center p-8">
            <h3 className="font-semibold text-on-surface dark:text-dark-on-surface">{t('coverLetterTitle')}</h3>
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{t('coverLetterSubtitle')}</p>
            <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
              {t('generatePoints')}
            </button>
          </div>
        );
      }
      return (
        <div className="p-6">
            <h3 className="font-semibold text-on-surface dark:text-dark-on-surface mb-3">{t('keyTalkingPoints')}</h3>
            <ul className="space-y-3 list-disc list-inside text-on-surface-secondary dark:text-dark-on-surface-secondary">
                {coverLetterPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
        </div>
      );
    }

    if (activeTab === 'interview-prep') {
      if (!interviewQuestions) {
         return (
          <div className="text-center p-8">
            <h3 className="font-semibold text-on-surface dark:text-dark-on-surface">{t('interviewPrepTitle')}</h3>
            <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{t('interviewPrepSubtitle')}</p>
            <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
              {t('generateQuestions')}
            </button>
          </div>
        );
      }
      return (
         <div className="p-6">
            <div className="mb-4">
                <h4 className="font-semibold text-on-surface dark:text-dark-on-surface mb-2">{t('behavioralQuestions')}</h4>
                <ul className="space-y-2 list-disc list-inside text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">
                    {interviewQuestions.behavioral.map((q, i) => <li key={`b-${i}`}>{q}</li>)}
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-on-surface dark:text-dark-on-surface mb-2">{t('technicalQuestions')}</h4>
                <ul className="space-y-2 list-disc list-inside text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">
                    {interviewQuestions.technical.map((q, i) => <li key={`t-${i}`}>{q}</li>)}
                </ul>
            </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500"/>
            <h2 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">{t('aiPrepHubTitle')}: <span className="text-primary dark:text-dark-primary">{internship.title}</span></h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        
        <div className="border-b border-border dark:border-dark-border">
          <nav className="flex space-x-2 p-2">
            <button 
              onClick={() => setActiveTab('cover-letter')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'cover-letter' ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <FileText size={16} /> {t('coverLetterHelper')}
            </button>
            <button 
              onClick={() => setActiveTab('interview-prep')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'interview-prep' ? 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <HelpCircle size={16} /> {t('interviewPrep')}
            </button>
          </nav>
        </div>

        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default AIHelperModal;