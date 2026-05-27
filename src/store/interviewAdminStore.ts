import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InterviewRules, TemplateQuestion } from '../services/interviewTemplates'

const genId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)

export interface WizardStep1 {
  title: string
  description: string
  role: string
  department: string
  employmentType: 'full-time' | 'internship' | 'contract'
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior'
  interviewType: 'technical' | 'hr' | 'behavioral' | 'system_design' | 'ai_mixed'
  durationMinutes: number
  numQuestions: number
  language: string
}

export interface WizardDraft {
  step1: WizardStep1
  topics: string[]
  questions: TemplateQuestion[]
  questionMode: 'ai' | 'manual' | 'hybrid'
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  rules: InterviewRules
}

const defaultStep1: WizardStep1 = {
  title: '',
  description: '',
  role: '',
  department: '',
  employmentType: 'full-time',
  experienceLevel: 'mid',
  interviewType: 'ai_mixed',
  durationMinutes: 30,
  numQuestions: 6,
  language: 'English',
}

const defaultRules: InterviewRules = {
  cameraRequired: true,
  microphoneRequired: true,
  fullscreenRequired: true,
  tabSwitchAllowed: false,
  maxTabSwitchWarnings: 3,
  multipleFaceDetection: true,
  resumeUploadRequired: false,
  internetStabilityCheck: true,
  recordingEnabled: false,
}

const defaultDraft: WizardDraft = {
  step1: defaultStep1,
  topics: [],
  questions: [],
  questionMode: 'hybrid',
  difficulty: 'medium',
  rules: defaultRules,
}

interface InterviewAdminStore {
  // Wizard UI
  wizardOpen: boolean
  currentStep: number
  draft: WizardDraft
  isGeneratingTopics: boolean
  isGeneratingQuestions: boolean
  isSaving: boolean

  // Actions
  openWizard: () => void
  closeWizard: () => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  updateStep1: (data: Partial<WizardStep1>) => void
  setTopics: (topics: string[]) => void
  addTopic: (topic: string) => void
  removeTopic: (topic: string) => void
  setQuestions: (questions: TemplateQuestion[]) => void
  addQuestion: (question: Omit<TemplateQuestion, 'id'>) => void
  updateQuestion: (id: string, data: Partial<TemplateQuestion>) => void
  removeQuestion: (id: string) => void
  setQuestionMode: (mode: 'ai' | 'manual' | 'hybrid') => void
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'adaptive') => void
  updateRules: (rules: Partial<InterviewRules>) => void
  resetWizard: () => void

  setGeneratingTopics: (v: boolean) => void
  setGeneratingQuestions: (v: boolean) => void
  setSaving: (v: boolean) => void
}

export const useInterviewAdminStore = create<InterviewAdminStore>()(
  persist(
    (set, get) => ({
      wizardOpen: false,
      currentStep: 0,
      draft: defaultDraft,
      isGeneratingTopics: false,
      isGeneratingQuestions: false,
      isSaving: false,

      openWizard: () => set({ wizardOpen: true, currentStep: 0 }),
      closeWizard: () => set({ wizardOpen: false }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      updateStep1: (data) => set((s) => ({
        draft: { ...s.draft, step1: { ...s.draft.step1, ...data } },
      })),
      setTopics: (topics) => set((s) => ({ draft: { ...s.draft, topics } })),
      addTopic: (topic) => {
        const { draft } = get()
        if (!draft.topics.includes(topic)) {
          set({ draft: { ...draft, topics: [...draft.topics, topic] } })
        }
      },
      removeTopic: (topic) => set((s) => ({
        draft: { ...s.draft, topics: s.draft.topics.filter((t) => t !== topic) },
      })),
      setQuestions: (questions) => set((s) => ({ draft: { ...s.draft, questions } })),
      addQuestion: (question) => set((s) => ({
        draft: {
          ...s.draft,
          questions: [...s.draft.questions, { ...question, id: genId() }],
        },
      })),
      updateQuestion: (id, data) => set((s) => ({
        draft: {
          ...s.draft,
          questions: s.draft.questions.map((q) => q.id === id ? { ...q, ...data } : q),
        },
      })),
      removeQuestion: (id) => set((s) => ({
        draft: { ...s.draft, questions: s.draft.questions.filter((q) => q.id !== id) },
      })),
      setQuestionMode: (questionMode) => set((s) => ({ draft: { ...s.draft, questionMode } })),
      setDifficulty: (difficulty) => set((s) => ({ draft: { ...s.draft, difficulty } })),
      updateRules: (rules) => set((s) => ({
        draft: { ...s.draft, rules: { ...s.draft.rules, ...rules } },
      })),
      resetWizard: () => set({ draft: defaultDraft, currentStep: 0, wizardOpen: false }),

      setGeneratingTopics: (v) => set({ isGeneratingTopics: v }),
      setGeneratingQuestions: (v) => set({ isGeneratingQuestions: v }),
      setSaving: (v) => set({ isSaving: v }),
    }),
    {
      name: 'interview-wizard-draft',
      partialize: (s) => ({ draft: s.draft, currentStep: s.currentStep }),
    }
  )
)
