import React, { useState, useEffect } from 'react';
import type { CandidateProfile, QuizQuestion } from '../../types';
import * as geminiService from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import { useLocale } from '../../App';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizViewProps {
  profile: CandidateProfile;
}

const QuizView: React.FC<QuizViewProps> = ({ profile }) => {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const { t } = useLocale();

  const fetchQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    try {
      const quizQuestions = await geminiService.generateQuiz(profile);
      setQuestions(quizQuestions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [profile]);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(index);
    if (questions && index === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner text="Generating your personalized quiz..." size="lg" /></div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  if (!questions || questions.length === 0) {
    return <div className="text-center">No quiz questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (quizFinished) {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <Card>
                <h2 className="text-3xl font-bold text-primary dark:text-dark-primary">{t('quizComplete')}</h2>
                <p className="mt-4 text-xl">{t('yourScore')}: <span className="font-bold">{score} / {questions.length}</span></p>
                <button onClick={fetchQuiz} className="mt-6 px-6 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
                    {t('restartQuiz')}
                </button>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">{t('quizTitle')}</h1>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">{t('quizSubtitle')}</p>
        </div>
      <Card>
        <div className="p-4">
            <p className="text-sm font-semibold text-on-surface-secondary dark:text-dark-on-surface-secondary">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <h2 className="text-xl font-medium mt-2 text-on-surface dark:text-dark-on-surface">{currentQuestion.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctAnswerIndex;
                const isSelected = index === selectedAnswer;
                let buttonClass = 'p-4 rounded-lg text-left transition-all border-2 w-full ';
                if (isAnswered) {
                    if (isCorrect) {
                        buttonClass += 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300';
                    } else if (isSelected) {
                        buttonClass += 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300';
                    } else {
                        buttonClass += 'border-border dark:border-dark-border bg-surface dark:bg-dark-surface';
                    }
                } else {
                    buttonClass += 'border-border dark:border-dark-border bg-surface dark:bg-dark-surface hover:bg-primary/10 dark:hover:bg-dark-primary/10 hover:border-primary dark:hover:border-dark-primary';
                }

                return (
                    <button key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered} className={buttonClass}>
                        {option}
                    </button>
                );
            })}
        </div>
        {isAnswered && (
            <div className="p-4 mt-4 border-t border-border dark:border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.correctAnswerIndex ? (
                        <>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">{t('correct')}</h3>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-6 h-6 text-red-500" />
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{t('incorrect')}</h3>
                        </>
                    )}
                </div>
                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary text-sm">{currentQuestion.explanation}</p>
                <button onClick={handleNextQuestion} className="mt-4 px-6 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-background rounded-md hover:bg-primary-hover dark:hover:bg-dark-primary-hover font-medium transition-colors">
                    {t('nextQuestion')}
                </button>
            </div>
        )}
      </Card>
    </div>
  );
};

export default QuizView;