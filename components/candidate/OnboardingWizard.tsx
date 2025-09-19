import React, { useState } from 'react';
import type { CandidateProfile, Preferences, RankedInternship, ProfileAnalysis } from '../../types';
import { MOCK_INTERNSHIPS } from '../../constants';
import * as geminiService from '../../services/geminiService';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { useLocale } from '../../App';
import { UploadCloud, FileText } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (profile: CandidateProfile, internships: RankedInternship[], analysis: ProfileAnalysis) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [aspirations, setAspirations] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    location: 5, paid: 8, companySize: 5, industry: 5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('text');
  const [file, setFile] = useState<File | null>(null);
  const { t } = useLocale();

  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.split(',')[1];
            resolve({ data, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
    }
  };

  const handleResumeParse = async () => {
    setIsLoading(true);
    setLoadingMessage('Parsing your resume with AI...');
    setError(null);
    try {
        let parsedProfile: CandidateProfile;
        if (uploadMethod === 'file' && file) {
            const { data, mimeType } = await fileToBase64(file);
            parsedProfile = await geminiService.parseResume({ file: { data, mimeType } });
        } else if (uploadMethod === 'text' && resumeText.trim()) {
            parsedProfile = await geminiService.parseResume({ text: resumeText });
        } else {
            setError('Please paste your resume text or upload a file to proceed.');
            setIsLoading(false);
            return;
        }
        setProfile(parsedProfile);
        setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    const fullProfile: CandidateProfile = {
      ...profile,
      interests,
      aspirations,
      preferredLocation,
      skills: profile.skills || [],
      experience: profile.experience || [],
      education: profile.education || [],
    };
    try {
        setLoadingMessage('Analyzing profile and ranking internships...');
        const { rankedInternships, profileAnalysis } = await geminiService.getRankingsAndAnalysis(fullProfile, preferences, MOCK_INTERNSHIPS);
        onComplete(fullProfile, rankedInternships, profileAnalysis);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during final processing.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Spinner text={loadingMessage} size="lg" />
            </div>
        );
    }

    const StepHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
      <div className="mb-6">
          <h2 className="text-2xl font-semibold text-on-surface dark:text-dark-on-surface">{title}</h2>
          <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{subtitle}</p>
      </div>
    );

    switch (step) {
      case 1:
        return (
          <div>
            <div className="border-b border-border dark:border-dark-border mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setUploadMethod('text')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${uploadMethod === 'text' ? 'border-primary dark:border-dark-primary text-primary dark:text-dark-primary' : 'border-transparent text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        {t('pasteResume')}
                    </button>
                    <button onClick={() => setUploadMethod('file')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${uploadMethod === 'file' ? 'border-primary dark:border-dark-primary text-primary dark:text-dark-primary' : 'border-transparent text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        {t('uploadFile')}
                    </button>
                </nav>
            </div>
            
            {uploadMethod === 'text' ? (
                <div>
                    <StepHeader title={t('pasteResume')} subtitle={t('pasteInstructions')} />
                    <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your full resume here..."
                        className="w-full h-64 p-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-shadow text-on-surface dark:text-dark-on-surface placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            ) : (
                <div>
                    <StepHeader title={t('uploadFile')} subtitle={t('uploadInstructions')} />
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border dark:border-dark-border px-6 py-10">
                        <div className="text-center">
                            {file ? (
                                <>
                                    <FileText className="mx-auto h-12 w-12 text-on-surface-secondary dark:text-dark-on-surface-secondary" />
                                    <p className="mt-2 text-on-surface dark:text-dark-on-surface">{file.name}</p>
                                    <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary">{(file.size / 1024).toFixed(2)} KB</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto h-12 w-12 text-on-surface-secondary dark:text-dark-on-surface-secondary" />
                                    <div className="mt-4 flex text-sm leading-6 text-on-surface-secondary dark:text-dark-on-surface-secondary">
                                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary dark:text-dark-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover dark:hover:text-dark-primary-hover">
                                          <span>{t('selectFile')}</span>
                                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/png,image/jpeg" />
                                      </label>
                                    </div>
                                    <p className="text-xs leading-5 text-on-surface-secondary dark:text-dark-on-surface-secondary">PDF, PNG, JPG up to 10MB</p>
                                </>
                            )}
                            {file && (
                               <label htmlFor="file-upload-change" className="mt-4 text-sm cursor-pointer rounded-md font-semibold text-primary dark:text-dark-primary hover:text-primary-hover dark:hover:text-dark-primary-hover">
                                    <span>{t('changeFile')}</span>
                                    <input id="file-upload-change" name="file-upload-change" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/png,image/jpeg" />
                               </label>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <button onClick={handleResumeParse} className="mt-6 px-6 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
              Parse Resume &rarr;
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <StepHeader title={t('interestsAndLocationTitle')} subtitle={t('interestsAndLocationSubtitle')} />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">{t('preferredLocationLabel')}</label>
                 <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder={t('preferredLocationPlaceholder')}
                  className="w-full p-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-shadow text-on-surface dark:text-dark-on-surface placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">{t('interestsLabel')}</label>
                <input
                  type="text"
                  value={interests.join(', ')}
                  onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()))}
                  placeholder={t('interestsPlaceholder')}
                  className="w-full p-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-shadow text-on-surface dark:text-dark-on-surface placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-secondary dark:text-dark-on-surface-secondary mb-1">{t('aspirationsLabel')}</label>
                <input
                  type="text"
                  value={aspirations}
                  onChange={(e) => setAspirations(e.target.value)}
                  placeholder={t('aspirationsPlaceholder')}
                  className="w-full p-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-shadow text-on-surface dark:text-dark-on-surface placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
            <button onClick={() => setStep(3)} className="mt-6 px-6 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
              Next Step &rarr;
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <StepHeader title="Set Your Preferences" subtitle="Rate the importance of each factor on a scale of 1 to 10." />
            <div className="space-y-6">
                {Object.keys(preferences).map((key) => (
                    <div key={key}>
                        <label className="block capitalize text-on-surface dark:text-dark-on-surface mb-2 font-medium">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={preferences[key as keyof Preferences]}
                                onChange={(e) => setPreferences({ ...preferences, [key]: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-dark-primary"
                            />
                            <span className="font-semibold text-primary dark:text-dark-primary w-10 text-center bg-primary/10 dark:bg-dark-primary/20 rounded-md py-1">{preferences[key as keyof Preferences]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleFinishOnboarding} className="mt-8 px-6 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
              Find My Internships
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-8">
            <div className="flex justify-between mb-1">
                <span className={`font-medium ${step >= 1 ? 'text-primary dark:text-dark-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary'}`}>Step 1: Resume</span>
                <span className={`font-medium ${step >= 2 ? 'text-primary dark:text-dark-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary'}`}>Step 2: Goals</span>
                <span className={`font-medium ${step >= 3 ? 'text-primary dark:text-dark-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary'}`}>Step 3: Preferences</span>
            </div>
            <div className="w-full bg-border dark:bg-dark-border rounded-full h-1.5">
                <div className="bg-primary dark:bg-dark-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            </div>
        </div>
        <Card>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">{error}</div>}
            {renderStep()}
        </Card>
    </div>
  );
};

export default OnboardingWizard;