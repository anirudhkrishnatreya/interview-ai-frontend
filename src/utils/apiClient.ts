import api from '../services/api'
import type { Evaluation } from '../store/interviewStore'

export async function generateQuestions(
  resumeText: string,
  jdText: string,
  candidateName: string,
  role: string,
  mustAskQuestions = '',
  difficulty: Record<string, number> = {},
  numQuestions?: number
): Promise<string[]> {
  const res = await api.post('/ai/generate-questions', {
    resumeText,
    jdText,
    candidateName,
    role,
    mustAskQuestions,
    difficulty,
    numQuestions,
  })

  if (!Array.isArray(res.data) || res.data.length === 0) {
    throw new Error('Failed to generate questions — unexpected response from API.')
  }

  return res.data as string[]
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  role: string
): Promise<Evaluation> {
  const res = await api.post('/ai/evaluate-answer', { question, answer, role })
  const result = res.data || {}

  return {
    score: Math.min(10, Math.max(1, Number(result.score) || 5)),
    feedback: result.feedback || '',
    strength: result.strength || '',
    improvement: result.improvement || '',
    verbal_response: result.verbal_response || '',
    followup_question: result.followup_question || '',
  }
}
