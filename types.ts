export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: number | 'Unpaid';
  duration: string;
  description: string;
  skills: string[];
  companySize: 'Startup' | 'Mid-size' | 'Large' | 'Govt';
  industry: string;
  applyLink: string;
}

export interface CandidateProfile {
  skills: string[];
  experience: { role: string; company: string; duration: string }[];
  education: { degree: string; institution: string; graduationDate: string }[];
  interests: string[];
  aspirations: string;
  preferredLocation: string;
}

export interface Preferences {
  location: number;
  paid: number;
  companySize: number;
  industry: number;
}

export interface RankedInternship extends Internship {
  relevanceScore: number;
  justification: string;
}

export interface ImprovementSuggestionText {
    title: string;
    explanation: string;
}

// Chart Data Types for Suggestions
export type SkillPoint = { skill: string; userLevel: number; idealLevel: number; fullMark: number };
export type SuggestionChartData = SkillPoint[];

// New Chart Data Types
export type BarChartData = { name: string; value: number };
export type PieChartData = { name: string; value: number };

export interface ProfileAnalysis {
    suggestions: ImprovementSuggestionText[];
    skillGapChartData: SuggestionChartData;
    topSkillsChartData: BarChartData[];
    industryBreakdownChartData: PieChartData[];
}

// New Quiz Type
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

// Chart Data Types
export type LineChartData = { name: string; value: number };
export type AreaChartData = { name: string; value: number };