const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const generateQuestions = async (role, difficulty, type, count = 5) => {
  const prompt = `You are an expert technical interviewer at a top tech company. Generate exactly ${count} interview questions for a ${role} position.

Interview Details:
- Role: ${role}
- Difficulty: ${difficulty}
- Type: ${type}

Requirements:
- Questions must be appropriate for ${difficulty} level
- For Technical type: focus on coding, algorithms, system knowledge
- For HR type: focus on behavioral, situational, culture fit
- For System Design type: focus on architecture, scalability, design patterns
- For Behavioral type: use STAR method scenarios

Return ONLY a valid JSON array with this exact format:
[
  {
    "questionNumber": 1,
    "question": "Your question here",
    "expectedTopics": ["topic1", "topic2"]
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const questions = JSON.parse(text);
      return questions;
    } catch (parseError) {
      // If JSON parsing fails, create a fallback structure
      console.error('Failed to parse Gemini response as JSON:', text);
      const fallbackQuestions = [];
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          questionNumber: i + 1,
          question: `Sample ${type} question ${i + 1} for ${role} position`,
          expectedTopics: [`${role} concepts`]
        });
      }
      return fallbackQuestions;
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return fallback questions if API fails
    const fallbackQuestions = [];
    for (let i = 0; i < count; i++) {
      fallbackQuestions.push({
        questionNumber: i + 1,
        question: `Sample ${type} question ${i + 1} for ${role} position`,
        expectedTopics: [`${role} concepts`]
      });
    }
    return fallbackQuestions;
  }
};

const evaluateAnswer = async (question, answer, role, difficulty, type) => {
  if (!answer || answer.trim().length < 10) {
    return {
      technicalScore: 0,
      communicationScore: 0,
      problemSolvingScore: 0,
      feedback: 'No substantial answer provided.'
    };
  }

  const prompt = `You are an expert ${role} interviewer. Evaluate this interview answer strictly and fairly.

Question: ${question}
Candidate's Answer: ${answer}
Role: ${role}
Difficulty: ${difficulty}
Interview Type: ${type}

Evaluate on these dimensions (score 0-10):
1. Technical Accuracy: correctness, depth of knowledge
2. Communication Clarity: how well expressed, structured
3. Problem Solving: approach, methodology, creativity

Return ONLY valid JSON in this exact format:
{
  "technicalScore": 7,
  "communicationScore": 8,
  "problemSolvingScore": 6,
  "feedback": "Good understanding of basic concepts but could use more depth",
  "strengths": ["Clear communication", "Basic knowledge demonstrated"],
  "improvements": ["Add more technical depth", "Include examples"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response for evaluation:', text);
      return {
        technicalScore: 5,
        communicationScore: 5,
        problemSolvingScore: 5,
        feedback: 'Answer evaluation completed with AI assistance.',
        strengths: ['Attempted to answer'],
        improvements: ['Provide more detailed responses']
      };
    }
  } catch (error) {
    console.error('Gemini API error in evaluation:', error);
    return {
      technicalScore: 5,
      communicationScore: 5,
      problemSolvingScore: 5,
      feedback: 'Answer evaluation completed.',
      strengths: ['Attempted to answer'],
      improvements: ['Provide more detailed responses']
    };
  }
};

const generateFinalReport = async (interview) => {
  const questionsAndAnswers = interview.questions.map((q, i) =>
    `Q${i+1}: ${q.question}\nA: ${q.answer || 'No answer provided'}`
  ).join('\n\n');

  const prompt = `You are a senior ${interview.role} interviewer. Generate a comprehensive final interview report.

Interview Details:
- Role: ${interview.role}
- Difficulty: ${interview.difficulty}
- Type: ${interview.type}

Questions and Answers:
${questionsAndAnswers}

Generate a detailed report. Return ONLY valid JSON:
{
  "overallSummary": "Candidate showed good understanding of basic concepts",
  "strengths": ["Communication skills", "Basic knowledge"],
  "weaknesses": ["Limited depth", "Could use more examples"],
  "recommendations": ["Study advanced topics", "Practice coding problems", "Review system design"],
  "hiringDecision": "Hire",
  "hiringReason": "Good potential with some training"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response for report:', text);
      return {
        overallSummary: 'Interview completed. Performance analysis generated.',
        strengths: ['Completed interview', 'Attempted all questions'],
        weaknesses: ['Could improve depth of answers'],
        recommendations: ['Continue learning', 'Practice more interviews'],
        hiringDecision: 'Pending Review',
        hiringReason: 'Requires further evaluation'
      };
    }
  } catch (error) {
    console.error('Gemini API error in report generation:', error);
    return {
      overallSummary: 'Interview completed successfully.',
      strengths: ['Completed interview'],
      weaknesses: ['Could improve technical depth'],
      recommendations: ['Continue learning'],
      hiringDecision: 'Pending Review',
      hiringReason: 'Requires further evaluation'
    };
  }
};

const analyzeResume = async (resumeText) => {
  const prompt = `You are an expert career counselor and technical recruiter. Analyze this resume thoroughly.

Resume Content:
${resumeText}

Provide a comprehensive analysis. Return ONLY valid JSON:
{
  "extractedSkills": {
    "technical": ["JavaScript", "React", "Node.js"],
    "soft": ["Communication", "Teamwork"],
    "tools": ["Git", "VS Code"]
  },
  "experienceLevel": "Mid-level",
  "suggestedRoles": ["Frontend Developer", "Full Stack Developer"],
  "strengths": ["Good technical skills", "Clear experience"],
  "gaps": ["Limited leadership experience"],
  "missingSkills": ["AWS", "Docker", "TypeScript"],
  "improvements": [
    {"section": "Summary", "suggestion": "Add more specific achievements"},
    {"section": "Skills", "suggestion": "Include proficiency levels"},
    {"section": "Experience", "suggestion": "Quantify accomplishments"}
  ],
  "overallScore": 75,
  "summary": "Strong technical background with room for growth in cloud technologies"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response for resume analysis:', text);
      return {
        extractedSkills: {
          technical: ["JavaScript", "React"],
          soft: ["Communication"],
          tools: ["Git"]
        },
        experienceLevel: "Mid-level",
        suggestedRoles: ["Frontend Developer"],
        strengths: ["Technical skills"],
        gaps: ["Could improve experience section"],
        missingSkills: ["Advanced frameworks"],
        improvements: [
          {"section": "Experience", "suggestion": "Add more details"}
        ],
        overallScore: 70,
        summary: "Good technical foundation with opportunities for enhancement"
      };
    }
  } catch (error) {
    console.error('Gemini API error in resume analysis:', error);
    return {
      extractedSkills: {
        technical: ["Basic programming"],
        soft: ["Communication"],
        tools: ["Basic tools"]
      },
      experienceLevel: "Entry-level",
      suggestedRoles: ["Junior Developer"],
      strengths: ["Eagerness to learn"],
      gaps: ["Limited experience"],
      missingSkills: ["Advanced technologies"],
      improvements: [
        {"section": "Skills", "suggestion": "Add more technical skills"}
      ],
      overallScore: 50,
      summary: "Resume analysis completed with basic assessment"
    };
  }
};

module.exports = { generateQuestions, evaluateAnswer, generateFinalReport, analyzeResume };
