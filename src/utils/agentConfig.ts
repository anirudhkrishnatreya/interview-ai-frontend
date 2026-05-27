// ─── Agent Identity ────────────────────────────────────────────────────────────
export const AGENT_CONFIG = {
  name: 'Nova',
  voiceTone: 'Professional, Warm, Encouraging',
  domainFocus: 'AI Interview Coach',
  language: 'Auto-detect',
}

// ─── Interview Config ──────────────────────────────────────────────────────────
export const INTERVIEW_CONFIG = {
  maxQuestions: 6,
  answerTimeoutSeconds: 120,
  silenceThresholdMs: 2200,
  maxViolationsBeforeTerminate: 5,
}

// ─── Speech Config ─────────────────────────────────────────────────────────────
export const SPEECH_CONFIG = {
  recognition: {
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    silenceTimeout: INTERVIEW_CONFIG.silenceThresholdMs,
  },
  synthesis: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    preferredVoices: ['Samantha', 'Google US English', 'Microsoft Aria', 'Karen'],
  },
}

// ─── Question Generation Prompt ────────────────────────────────────────────────
export const QUESTION_GEN_PROMPT = (
  resumeText: string,
  jdText: string,
  candidateName: string,
  role: string,
  mustAskQuestions = '',
  difficulty: Record<string, number> = {},
  numQuestions = INTERVIEW_CONFIG.maxQuestions
) => {
  const diffMap = ['Easy', 'Moderate', 'Standard', 'Hard', 'Expert']
  const tech = diffMap[(difficulty.technical || 3) - 1]
  const beh = diffMap[(difficulty.behavioral || 2) - 1]
  const sit = diffMap[(difficulty.situational || 2) - 1]

  const mustAskBlock = mustAskQuestions.trim()
    ? `\nCOMPULSORY QUESTIONS (include exactly as written):\n${mustAskQuestions
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n')}\n`
    : ''

  return `
You are an expert technical interviewer. Generate ${numQuestions} interview questions.

Candidate: ${candidateName}
Target Role: ${role}

RESUME:
---
${resumeText.slice(0, 3000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 2000)}
---
${mustAskBlock}
DIFFICULTY:
- Technical: ${tech}
- Behavioral: ${beh}
- Situational: ${sit}

Generate exactly ${numQuestions} questions. Mix: behavioral, technical, and situational.
Be conversational. Include ALL compulsory questions verbatim.

Respond ONLY with a valid JSON array of strings.
`.trim()
}

// ─── Evaluation Prompt ─────────────────────────────────────────────────────────
export const EVALUATION_PROMPT = (question: string, answer: string, role: string) => `
You are an expert interviewer evaluating a response for: ${role}

Question: "${question}"
Answer: "${answer}"

Respond ONLY with valid JSON:
{
  "score": <1-10>,
  "feedback": "<1-2 sentence assessment>",
  "strength": "<key strength or empty string>",
  "improvement": "<one actionable improvement or empty string>",
  "verbal_response": "<1-3 sentence spoken reaction — be honest>",
  "followup_question": "<follow-up if score<=5, else empty string>"
}
`.trim()

// ─── Intro Prompt ──────────────────────────────────────────────────────────────
export const INTRO_PROMPT = (candidateName: string, role: string, numQuestions: number) =>
  `Hello ${candidateName}! I'm Nova, your AI interview coach. I've reviewed your resume and the job description for the ${role} position. I'll be asking you ${numQuestions} questions today. Take your time with each answer — there's no rush. Let's begin with the first question.`
