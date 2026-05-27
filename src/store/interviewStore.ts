import { create } from 'zustand'

export type InterviewPhase =
  | 'upload' | 'assigned' | 'generating' | 'interview' | 'evaluating' | 'followup' | 'complete'
export type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

export interface Evaluation {
  score: number
  feedback: string
  strength: string
  improvement: string
  verbal_response: string
  followup_question: string
}

export interface ProctoringViolation {
  type: 'no_face' | 'multiple_faces' | 'tab_switch' | 'window_blur' | 'audio_anomaly' | 'fullscreen_exit'
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
  details: string
}

/** A question pre-set by the company in the template */
export interface TemplateQuestion {
  id: string
  text: string
  type: string
  difficulty: string
  expectedAnswer?: string
  scoringCriteria?: string
}

interface InterviewState {
  phase: InterviewPhase
  candidateName: string
  role: string
  resumeText: string
  jdText: string
  questions: string[]
  currentIndex: number
  answers: string[]
  evaluations: Evaluation[]
  error: string | null
  agentStatus: AgentStatus
  interviewDate: string
  sessionId: string | null
  violations: ProctoringViolation[]
  riskScore: number
  /** Set when candidate starts via a token link (assigned interview flow) */
  assignmentToken: string | null
  assignmentId: string | null
  /** Questions pre-defined by company admin in the template */
  templateQuestions: TemplateQuestion[]
  /** Template metadata */
  templateTitle: string
  templateNumQuestions: number
  /** questionMode controls whether AI generates or uses template questions */
  questionMode: 'ai' | 'manual' | 'hybrid'

  setPhase: (phase: InterviewPhase) => void
  setAgentStatus: (status: AgentStatus) => void
  setUploadData: (data: { candidateName: string; role: string; resumeText: string; jdText: string }) => void
  setAssignmentContext: (ctx: {
    token: string
    assignmentId: string
    candidateName: string
    role: string
    templateQuestions: TemplateQuestion[]
    templateTitle: string
    templateNumQuestions: number
    questionMode: 'ai' | 'manual' | 'hybrid'
    resumeUploadRequired?: boolean
  }) => void
  setQuestions: (questions: string[]) => void
  saveAnswer: (answer: string) => void
  saveEvaluation: (ev: Evaluation) => void
  updateAnswer: (index: number, answer: string) => void
  updateEvaluation: (index: number, ev: Evaluation) => void
  nextQuestion: () => void
  addViolation: (v: ProctoringViolation) => void
  setError: (err: string | null) => void
  setSessionId: (id: string) => void
  reset: () => void
}

const initialState = {
  phase: 'upload' as InterviewPhase,
  candidateName: '',
  role: '',
  resumeText: '',
  jdText: '',
  questions: [],
  currentIndex: 0,
  answers: [],
  evaluations: [],
  error: null,
  agentStatus: 'idle' as AgentStatus,
  interviewDate: '',
  sessionId: null,
  violations: [],
  riskScore: 0,
  assignmentToken: null as string | null,
  assignmentId: null as string | null,
  templateQuestions: [] as TemplateQuestion[],
  templateTitle: '',
  templateNumQuestions: 0,
  questionMode: 'ai' as 'ai' | 'manual' | 'hybrid',
}

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setAgentStatus: (agentStatus) => set({ agentStatus, error: null }),
  setUploadData: (data) => set(data),
  setAssignmentContext: ({ token, assignmentId, candidateName, role, templateQuestions, templateTitle, templateNumQuestions, questionMode }) =>
    set({
      assignmentToken: token,
      assignmentId,
      candidateName,
      role,
      templateQuestions,
      templateTitle,
      templateNumQuestions,
      questionMode,
      phase: 'assigned',
    }),
  setQuestions: (questions) =>
    set({
      questions,
      interviewDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }),
  saveAnswer: (answer) => set((s) => ({ answers: [...s.answers, answer] })),
  saveEvaluation: (evaluation) => set((s) => ({ evaluations: [...s.evaluations, evaluation] })),
  updateAnswer: (index, answer) =>
    set((s) => {
      const answers = [...s.answers]
      answers[index] = answer
      return { answers }
    }),
  updateEvaluation: (index, evaluation) =>
    set((s) => {
      const evaluations = [...s.evaluations]
      evaluations[index] = evaluation
      return { evaluations }
    }),
  nextQuestion: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  addViolation: (v) =>
    set((s) => {
      const violations = [...s.violations, v]
      const riskScore = Math.min(100, violations.reduce((acc, viol) => {
        return acc + (viol.severity === 'high' ? 25 : viol.severity === 'medium' ? 10 : 5)
      }, 0))
      return { violations, riskScore }
    }),
  setError: (error) => set({ error, agentStatus: 'error' }),
  setSessionId: (sessionId) => set({ sessionId }),
  reset: () => set({ ...initialState }),
}))
