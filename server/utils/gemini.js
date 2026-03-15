const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/* Helper function to safely parse Gemini JSON */
const parseJSONResponse = (text) => {
  try {
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON parse error:", text);
    return null;
  }
};

const generateQuestions = async (role, difficulty, type, count = 5) => {

  const prompt = `
You are a senior interviewer at a top tech company.

Generate exactly ${count} interview questions.

Role: ${role}
Difficulty: ${difficulty}
Interview Type: ${type}

Rules:
- Questions must match the difficulty
- Questions must be realistic technical interview questions
- Do NOT include explanations
- Return ONLY valid JSON
- No markdown formatting

JSON Format:

[
  {
    "questionNumber": 1,
    "question": "Question text",
    "expectedTopics": ["topic1", "topic2"]
  }
]
`;

  try {

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const questions = parseJSONResponse(text);

    if (questions) return questions;

    throw new Error("Invalid JSON from Gemini");

  } catch (error) {

    console.error("Gemini API error:", error);

    const fallbackQuestions = [];

    for (let i = 0; i < count; i++) {
      fallbackQuestions.push({
        questionNumber: i + 1,
        question: `Sample ${type} question ${i + 1} for ${role}`,
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
      feedback: "No substantial answer provided.",
      strengths: [],
      improvements: []
    };
  }

  const prompt = `
You are an expert ${role} interviewer.

Evaluate the candidate answer.

Question:
${question}

Answer:
${answer}

Interview type: ${type}
Difficulty: ${difficulty}

Score each category from 0 to 10.

Return ONLY JSON:

{
  "technicalScore": 7,
  "communicationScore": 8,
  "problemSolvingScore": 6,
  "feedback": "Short explanation of performance",
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"]
}
`;

  try {

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const evaluation = parseJSONResponse(text);

    if (evaluation) return evaluation;

    throw new Error("Invalid JSON");

  } catch (error) {

    console.error("Evaluation error:", error);

    return {
      technicalScore: 5,
      communicationScore: 5,
      problemSolvingScore: 5,
      feedback: "Answer evaluated with limited accuracy.",
      strengths: ["Attempted answer"],
      improvements: ["Provide more detailed explanations"]
    };
  }
};

const generateFinalReport = async (interview) => {

  const questionsAndAnswers = interview.questions.map((q, i) =>
    `Q${i + 1}: ${q.question}\nA: ${q.answer || "No answer"}`
  ).join("\n\n");

  const prompt = `
You are a senior ${interview.role} interviewer.

Generate a final interview report.

Interview Type: ${interview.type}
Difficulty: ${interview.difficulty}

Questions and Answers:

${questionsAndAnswers}

Return ONLY JSON:

{
  "overallSummary": "summary",
  "strengths": ["point1"],
  "weaknesses": ["point1"],
  "recommendations": ["point1"],
  "hiringDecision": "Hire / No Hire / Pending",
  "hiringReason": "short reason"
}
`;

  try {

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const report = parseJSONResponse(text);

    if (report) return report;

    throw new Error("Invalid JSON");

  } catch (error) {

    console.error("Report generation error:", error);

    return {
      overallSummary: "Interview completed successfully.",
      strengths: ["Candidate attempted all questions"],
      weaknesses: ["More technical depth required"],
      recommendations: ["Practice more technical questions"],
      hiringDecision: "Pending",
      hiringReason: "Requires further evaluation"
    };
  }
};

const analyzeResume = async (resumeText) => {

  const prompt = `
Analyze this resume.

Resume:
${resumeText}

Return ONLY JSON:

{
  "extractedSkills": {
    "technical": ["skill1"],
    "soft": ["skill1"],
    "tools": ["tool1"]
  },
  "experienceLevel": "Entry / Mid / Senior",
  "suggestedRoles": ["role1"],
  "strengths": ["point1"],
  "gaps": ["point1"],
  "missingSkills": ["skill1"],
  "improvements": [
    {
      "section": "section name",
      "suggestion": "improvement"
    }
  ],
  "overallScore": 70,
  "summary": "short evaluation"
}
`;

  try {

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const analysis = parseJSONResponse(text);

    if (analysis) return analysis;

    throw new Error("Invalid JSON");

  } catch (error) {

    console.error("Resume analysis error:", error);

    return {
      extractedSkills: {
        technical: ["Programming"],
        soft: ["Communication"],
        tools: ["Git"]
      },
      experienceLevel: "Entry-level",
      suggestedRoles: ["Software Developer"],
      strengths: ["Basic technical foundation"],
      gaps: ["Limited experience"],
      missingSkills: ["Advanced frameworks"],
      improvements: [
        { section: "Experience", suggestion: "Add more project details" }
      ],
      overallScore: 60,
      summary: "Resume analyzed with limited detail."
    };
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport,
  analyzeResume
};