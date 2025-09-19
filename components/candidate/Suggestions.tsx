import React from 'react';
import type { ProfileAnalysis, BarChartData, PieChartData } from '../../types';
import Card from '../ui/Card';
import { Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../../App';

interface SuggestionsProps {
    analysis: ProfileAnalysis;
}

const SkillGapChart: React.FC<{ data: ProfileAnalysis['skillGapChartData'] }> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartColors = {
        grid: isDark ? '#3c4043' : '#e0e0e0',
        angleText: isDark ? '#969ba1' : '#5f6368',
        userLine: isDark ? '#8ab4f8' : '#1a73e8',
        idealLine: isDark ? '#f6ad55' : '#ed8936',
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke={chartColors.grid} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: chartColors.angleText, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    borderColor: isDark ? '#3c4043' : '#e0e0e0',
                    color: isDark ? '#e8eaed' : '#202124'
                }} />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Radar name="Your Level" dataKey="userLevel" stroke={chartColors.userLine} fill={chartColors.userLine} fillOpacity={0.6} />
                <Radar name="Ideal Level" dataKey="idealLevel" stroke={chartColors.idealLine} fill={chartColors.idealLine} fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

const TopSkillsChart: React.FC<{ data: BarChartData[] }> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: isDark ? '#969ba1' : '#5f6368', fontSize: 12 }} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}} contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    borderColor: isDark ? '#3c4043' : '#e0e0e0',
                }}/>
                <Bar dataKey="value" fill={isDark ? '#8ab4f8' : '#1a73e8'} barSize={20} radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const IndustryPieChart: React.FC<{ data: PieChartData[] }> = ({ data }) => {
    const COLORS = ['#1a73e8', '#fbbc04', '#34a853', '#ea4335', '#4285f4'];
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{
                    backgroundColor: useTheme().theme === 'dark' ? '#1e1e1e' : '#ffffff',
                    borderColor: useTheme().theme === 'dark' ? '#3c4043' : '#e0e0e0',
                }}/>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};


const Suggestions: React.FC<SuggestionsProps> = ({ analysis }) => {
    const { suggestions, skillGapChartData, topSkillsChartData, industryBreakdownChartData } = analysis;

    if (!suggestions || suggestions.length === 0) {
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-on-surface dark:text-dark-on-surface">No suggestions available.</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">Complete onboarding to get personalized advice.</p>
          </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Your AI-Powered Career Analysis</h1>
                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2">Here are insights to help you improve your profile and understand your opportunities.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column for suggestions */}
                <div className="lg:col-span-2 space-y-4">
                     <h2 className="text-xl font-semibold text-on-surface dark:text-dark-on-surface mb-2">Actionable Suggestions</h2>
                    {suggestions.map((suggestion, index) => (
                        <Card key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                               <Lightbulb className="w-5 h-5 text-primary dark:text-dark-primary" />
                            </div>
                            <div>
                                <h3 className="text-md font-medium text-on-surface dark:text-dark-on-surface">{suggestion.title}</h3>
                                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1 text-sm">{suggestion.explanation}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Right column for charts */}
                <div className="lg:col-span-3 space-y-6">
                   {skillGapChartData && skillGapChartData.length > 0 && (
                       <Card>
                           <h3 className="text-lg font-medium text-on-surface dark:text-dark-on-surface mb-2">Your Skill Analysis</h3>
                           <SkillGapChart data={skillGapChartData} />
                       </Card>
                   )}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topSkillsChartData && topSkillsChartData.length > 0 && (
                            <Card>
                                <h3 className="text-lg font-medium text-on-surface dark:text-dark-on-surface mb-2">In-Demand Skills</h3>
                                <TopSkillsChart data={topSkillsChartData} />
                            </Card>
                        )}
                        {industryBreakdownChartData && industryBreakdownChartData.length > 0 && (
                            <Card>
                                <h3 className="text-lg font-medium text-on-surface dark:text-dark-on-surface mb-2">Industry Breakdown</h3>
                                <IndustryPieChart data={industryBreakdownChartData} />
                            </Card>
                        )}
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Suggestions;