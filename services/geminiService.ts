import { GoogleGenAI, Type } from "@google/genai";
import type { CandidateProfile, Internship, Preferences, RankedInternship, ProfileAnalysis, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface ParseResumeInput {
  text?: string;
  file?: {
    data: string; // base64 encoded string
    mimeType: string;
  };
}

export const parseResume = async (input: ParseResumeInput): Promise<CandidateProfile> => {
  try {
    let contents: any;
    
    if (input.file) {
      const promptText = "Parse the attached resume document and extract the candidate's skills, work experience (role, company, duration), and education (degree, institution, graduationDate). Focus on relevant professional information for an internship application.";
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: input.file.mimeType,
              data: input.file.data,
            },
          },
          { text: promptText },
        ],
      };
    } else if (input.text) {
        const promptText = "Parse the following resume text and extract the candidate's skills, work experience (role, company, duration), and education (degree, institution, graduationDate). Focus on relevant professional information. Here is the resume text: \n\n";
        contents = `${promptText}${input.text}`;
    } else {
        throw new Error("No resume content provided to parse.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Optimization for speed
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
                required: ["role", "company", "duration"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  graduationDate: { type: Type.STRING },
                },
                required: ["degree", "institution", "graduationDate"],
              },
            },
          },
          required: ["skills", "experience", "education"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text);
    // Add empty fields for data collected in later steps
    return { ...parsedJson, interests: [], aspirations: '', preferredLocation: '' };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume with AI. Please check the format and try again.");
  }
};

export const getRankingsAndAnalysis = async (
  profile: CandidateProfile,
  preferences: Preferences,
  internships: Internship[]
): Promise<{ rankedInternships: RankedInternship[], profileAnalysis: ProfileAnalysis }> => {
    try {
        const prompt = `
            You are an expert AI career coach for the Indian market, optimized for speed.
            A candidate has provided their profile. Perform two tasks in a single response:
            1. Rank the provided list of internships from AICTE/PM Schemes.
            2. Provide a comprehensive profile analysis based on the candidate and the TOP 5 ranked internships.

            CANDIDATE PROFILE:
            - Skills: ${profile.skills.join(', ')}
            - Experience: ${profile.experience.map(e => `${e.role} at ${e.company}`).join('; ')}
            - Education: ${profile.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}
            - Interests: ${profile.interests.join(', ')}
            - Aspirations: "${profile.aspirations}"
            - Preferred Location: "${profile.preferredLocation}"

            CANDIDATE PREFERENCES (scale 1-10):
            - Location relevance: ${preferences.location}
            - Paid internship: ${preferences.paid}
            - Company Size: ${preferences.companySize}
            - Industry Match: ${preferences.industry}

            INTERNSHIP LIST:
            ${JSON.stringify(internships, null, 2)}

            First, rank all internships. For each, provide a 'relevanceScore' (1-100) and a brief 'justification'. Sort the list by score.
            
            Second, based on the top 5 internships from your ranking, provide the profile analysis containing:
            - 'suggestions': 3-4 actionable tips.
            - 'skillGapChartData': Analysis of 5-6 key skills, rating 'userLevel' vs 'idealLevel' (0-100).
            - 'topSkillsChartData': Bar chart data for the 5 most in-demand skills from the top internships.
            - 'industryBreakdownChartData': Pie chart data for the industry distribution of the top internships.
            
            Return a single JSON object with two top-level keys: "rankedInternships" and "profileAnalysis".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 }, // Critical for speed optimization
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rankedInternships: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    company: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    stipend: { type: Type.NUMBER, description: "The stipend in INR. Use 0 if unpaid." },
                                    duration: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    companySize: { type: Type.STRING },
                                    industry: { type: Type.STRING },
                                    applyLink: { type: Type.STRING },
                                    relevanceScore: { type: Type.NUMBER },
                                    justification: { type: Type.STRING },
                                },
                                required: ["id", "title", "company", "location", "stipend", "duration", "description", "skills", "companySize", "industry", "applyLink", "relevanceScore", "justification"],
                            },
                        },
                        profileAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                suggestions: {
                                    type: Type.ARRAY,
                                    items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["title", "explanation"] },
                                },
                                skillGapChartData: {
                                    type: Type.ARRAY,
                                    items: { type: Type.OBJECT, properties: { skill: { type: Type.STRING }, userLevel: { type: Type.NUMBER }, idealLevel: { type: Type.NUMBER }, fullMark: { type: Type.NUMBER, description: "Should always be 100" } }, required: ["skill", "userLevel", "idealLevel", "fullMark"] },
                                },
                                topSkillsChartData: {
                                    type: Type.ARRAY,
                                    items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] },
                                },
                                industryBreakdownChartData: {
                                    type: Type.ARRAY,
                                    items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] },
                                },
                            },
                            required: ["suggestions", "skillGapChartData", "topSkillsChartData", "industryBreakdownChartData"],
                        },
                    },
                    required: ["rankedInternships", "profileAnalysis"],
                },
            },
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error getting rankings and analysis:", error);
        throw new Error("Failed to get AI analysis. Please try again later.");
    }
};

export const generateCoverLetterPoints = async (profile: CandidateProfile, internship: Internship): Promise<{ points: string[] }> => {
    try {
        const prompt = `
            You are an AI career assistant. Generate 3-4 concise bullet points for a cover letter.
            These points should connect the candidate's skills and experience directly to the requirements of the internship.
            Focus on creating impactful statements that highlight the candidate's value proposition.

            CANDIDATE PROFILE:
            - Skills: ${profile.skills.join(', ')}
            - Experience: ${profile.experience.map(e => `${e.role} at ${e.company}`).join('; ')}

            INTERNSHIP DETAILS:
            - Title: ${internship.title}
            - Company: ${internship.company}
            - Description: ${internship.description}
            - Required Skills: ${internship.skills.join(', ')}

            Return a JSON object with a single key 'points', which is an array of strings.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 }, // Optimization for speed
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        points: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["points"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating cover letter points:", error);
        throw new Error("Failed to generate cover letter points.");
    }
};

export const generateInterviewQuestions = async (internship: Internship): Promise<{ behavioral: string[], technical: string[] }> => {
    try {
        const prompt = `
            You are an AI interview coach. Based on the internship details below, generate a list of potential interview questions.
            Provide 3 behavioral questions and 3 technical questions relevant to the role.

            INTERNSHIP DETAILS:
            - Title: ${internship.title}
            - Company: ${internship.company}
            - Description: ${internship.description}
            - Required Skills: ${internship.skills.join(', ')}

            Return a JSON object with two keys: 'behavioral' (an array of strings) and 'technical' (an array of strings).
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 }, // Optimization for speed
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        behavioral: { type: Type.ARRAY, items: { type: Type.STRING } },
                        technical: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["behavioral", "technical"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error("Failed to generate interview questions.");
    }
};

export const generateQuiz = async (profile: CandidateProfile): Promise<QuizQuestion[]> => {
    try {
        const prompt = `
            You are an AI quiz master for interview preparation.
            Based on the candidate's skills, generate 5 multiple-choice quiz questions to test their knowledge for an internship interview.
            For each question, provide: a question, 4 options, the index of the correct answer, and a brief explanation for the correct answer.

            CANDIDATE SKILLS: ${profile.skills.join(', ')}

            Return a JSON array of question objects.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswerIndex: { type: Type.NUMBER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswerIndex", "explanation"]
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw new Error("Failed to generate quiz questions.");
    }
};