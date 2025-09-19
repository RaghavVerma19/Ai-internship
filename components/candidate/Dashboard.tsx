import React, { useState } from 'react';
import type { RankedInternship, CandidateProfile } from '../../types';
import Card from '../ui/Card';
import { MapPin, Briefcase, Clock, ExternalLink, Sparkles } from 'lucide-react';
import AIHelperModal from './AIHelperModal';
import { useLocale } from '../../App';

interface DashboardProps {
  internships: RankedInternship[];
  profile: CandidateProfile | null;
}

const formatStipend = (stipend: number | 'Unpaid') => {
    if (stipend === 'Unpaid') {
        return 'Unpaid';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(stipend);
}

const InternshipCard: React.FC<{ internship: RankedInternship, onPrepClick: () => void }> = ({ internship, onPrepClick }) => {
    const { t } = useLocale();
    return (
        <Card className="mb-4 transition-all hover:shadow-md hover:border-primary/50 dark:hover:border-dark-primary/50">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                    <h3 className="text-xl font-medium text-on-surface dark:text-dark-on-surface">{internship.title}</h3>
                    <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary font-medium">{internship.company}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {internship.location}</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={14} /> {internship.industry}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {internship.duration}</span>
                    </div>
                     <div className="mt-3">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">{formatStipend(internship.stipend)} {t('perMonth')}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 flex sm:flex-col items-start sm:items-center justify-between sm:justify-start gap-4">
                     <div className="flex flex-col items-center justify-center bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary w-24 h-24 rounded-full">
                        <p className="text-3xl font-bold">{internship.relevanceScore}</p>
                        <p className="text-xs font-medium uppercase tracking-wider">{t('score')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border dark:border-dark-border flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {internship.skills.slice(0, 5).map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-on-surface-secondary dark:text-dark-on-surface-secondary text-xs font-medium rounded-full">{skill}</span>
                    ))}
                </div>
                 <div className="flex gap-2 mt-2 sm:mt-0">
                     <button 
                        onClick={onPrepClick}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary dark:bg-secondary text-white dark:text-dark-background rounded-md bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 font-medium transition-colors text-sm"
                    >
                        <Sparkles size={14}/> {t('aiPrep')}
                    </button>
                    <a 
                        href={internship.applyLink}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors text-sm"
                    >
                        {t('applyNow')} <ExternalLink size={14}/>
                    </a>
                </div>
            </div>
        </Card>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ internships, profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<RankedInternship | null>(null);

  const handlePrepClick = (internship: RankedInternship) => {
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  if (internships.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-on-surface dark:text-dark-on-surface">No internships found.</h2>
        <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">Please complete the onboarding process to see your matches.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {internships.map(internship => (
          <InternshipCard 
            key={internship.id} 
            internship={internship}
            onPrepClick={() => handlePrepClick(internship)}
          />
        ))}
      </div>
      {isModalOpen && selectedInternship && profile && (
        <AIHelperModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          internship={selectedInternship}
          profile={profile}
        />
      )}
    </>
  );
};

export default Dashboard;