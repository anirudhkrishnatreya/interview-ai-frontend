import { useCallback, useRef } from 'react'
import { useInterviewStore } from '../store/interviewStore'
import { generateQuestions, evaluateAnswer } from '../utils/apiClient'
import { INTRO_PROMPT } from '../utils/agentConfig'
import { assignmentsService } from '../services/assignments'

interface UseInterviewOptions {
  speak: (text: string, opts?: { onEnd?: () => void }) => void
  stopSpeaking: () => void
  startListening: () => void
  stopListening: () => void
}

export function useInterview({ speak, stopSpeaking, startListening, stopListening }: UseInterviewOptions) {
  const store = useInterviewStore()
  const processingRef = useRef(false)
  const storeRef = useRef(store)
  storeRef.current = store

  const speakAndThen = useCallback(
    (text: string, onEnd: () => void) => {
      store.setAgentStatus('speaking')
      speak(text, { onEnd })
    },
    [speak, store]
  )

  const askQuestion = useCallback(
    (questions: string[], index: number) => {
      const question = questions[index]
      speakAndThen(question, () => {
        store.setAgentStatus('listening')
        startListening()
      })
    },
    [speakAndThen, startListening, store]
  )

  const advanceAfterResponse = useCallback(
    (verbalResponse: string, nextIndex: number, questions: string[]) => {
      if (nextIndex >= questions.length) {
        speakAndThen(
          `${verbalResponse} That was the final question. Your report is now ready — well done!`,
          async () => {
            store.setPhase('complete')
            store.setAgentStatus('idle')
            processingRef.current = false

            // Save score back to the assignment if this was an assigned interview
            const { assignmentId, evaluations, questions, answers, violations, riskScore } = storeRef.current
            if (assignmentId) {
              const avgScore = evaluations.length
                ? evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length
                : 0
              try {
                await assignmentsService.complete(assignmentId, `session_${Date.now()}`, avgScore, {
                  questions,
                  answers,
                  evaluations,
                  violationCount: violations.length,
                  riskScore,
                })
              } catch (err) {
                console.warn('Could not save assignment completion:', err)
              }
            }
          }
        )
      } else {
        store.setPhase('interview')
        speakAndThen(`${verbalResponse} Let's move on to question ${nextIndex + 1}.`, () => {
          processingRef.current = false
          askQuestion(questions, nextIndex)
        })
      }
    },
    [speakAndThen, askQuestion, store]
  )

  const handleAnswer = useCallback(
    async (transcript: string) => {
      if (!transcript.trim() || processingRef.current) return

      // Follow-up path
      if ((processingRef as any)._isFollowup) {
        ;(processingRef as any)._isFollowup = false
        processingRef.current = true
        stopListening()
        stopSpeaking()
        
        const { questions, currentIndex, role, answers, evaluations } = storeRef.current
        const targetIndex = currentIndex - 1
        const originalQuestion = questions[targetIndex]
        const followupQuestion = evaluations[targetIndex]?.followup_question || ''
        const originalAnswer = answers[targetIndex] || ''
        const followupAnswer = transcript

        store.setPhase('evaluating')
        store.setAgentStatus('thinking')

        const combinedQuestion = `${originalQuestion}\nFollow-up question asked: ${followupQuestion}`
        const combinedAnswer = `${originalAnswer}\nFollow-up answer given: ${followupAnswer}`

        let evaluation = {
          score: 5,
          feedback: 'Could not evaluate followup.',
          strength: '',
          improvement: '',
          verbal_response: 'Thank you for your answer.',
          followup_question: '',
        }

        try {
          evaluation = await evaluateAnswer(combinedQuestion, combinedAnswer, role)
        } catch (err) {
          console.warn('Follow-up evaluation error:', err)
        }

        store.updateAnswer(targetIndex, combinedAnswer)
        store.updateEvaluation(targetIndex, evaluation)

        const verbalResponse =
          evaluation.verbal_response?.trim() ||
          (evaluation.score >= 7 ? 'Good answer.' : 'Thank you for your response.')

        advanceAfterResponse(verbalResponse, currentIndex, questions)
        return
      }

      processingRef.current = true
      stopListening()
      stopSpeaking()

      const { questions, currentIndex, role } = storeRef.current
      const question = questions[currentIndex]

      store.saveAnswer(transcript)
      store.setPhase('evaluating')
      store.setAgentStatus('thinking')

      let evaluation = {
        score: 5,
        feedback: 'Could not evaluate.',
        strength: '',
        improvement: '',
        verbal_response: 'Thank you for your answer.',
        followup_question: '',
      }

      try {
        evaluation = await evaluateAnswer(question, transcript, role)
      } catch (err) {
        console.warn('Evaluation error:', err)
      }

      store.saveEvaluation(evaluation)
      const nextIndex = currentIndex + 1
      store.nextQuestion()

      const verbalResponse =
        evaluation.verbal_response?.trim() ||
        (evaluation.score >= 7 ? 'Good answer.' : 'Thank you for your response.')

      if (evaluation.followup_question?.trim()) {
        store.setPhase('followup')
        speakAndThen(`${verbalResponse} ${evaluation.followup_question}`, () => {
          store.setAgentStatus('listening')
          processingRef.current = false
          ;(processingRef as any)._isFollowup = true
          startListening()
        })
      } else {
        advanceAfterResponse(verbalResponse, nextIndex, questions)
      }
    },
    [stopListening, stopSpeaking, speakAndThen, startListening, advanceAfterResponse, store]
  )

  const startInterview = useCallback(
    async (data: {
      candidateName: string
      role: string
      resumeText: string
      jdText: string
      mustAskQuestions?: string
      difficulty?: Record<string, number>
    }) => {
      store.setUploadData(data)
      store.setPhase('generating')
      store.setAgentStatus('thinking')

      const { templateQuestions, questionMode, templateNumQuestions } = storeRef.current

      let questions: string[]

      // ── Mode: manual — use EXACTLY the company's template questions ──
      if (questionMode === 'manual' && templateQuestions.length > 0) {
        questions = templateQuestions.map((q) => q.text)
        store.setQuestions(questions)
      }
      // ── Mode: hybrid — prepend mandatory template questions, AI fills the rest ──
      else if (questionMode === 'hybrid' && templateQuestions.length > 0) {
        const mandatoryTexts = templateQuestions.map((q) => q.text)
        const mandatoryBlock = mandatoryTexts.join('\n')
        const combined = [mandatoryBlock, data.mustAskQuestions].filter(Boolean).join('\n')
        const totalNeeded = templateNumQuestions || mandatoryTexts.length + 2
        try {
          questions = await generateQuestions(
            data.resumeText,
            data.jdText,
            data.candidateName,
            data.role,
            combined,
            data.difficulty || {},
            totalNeeded
          )
        } catch (err: any) {
          store.setError(`Failed to generate questions: ${err.message}`)
          return
        }
        // Ensure mandatory questions always appear first
        const aiExtras = questions.filter((q) => !mandatoryTexts.includes(q))
        questions = [...mandatoryTexts, ...aiExtras]
        store.setQuestions(questions)
      }
      // ── Mode: ai (default) — generate all questions via AI ──
      else {
        const numQ = templateNumQuestions || undefined
        try {
          questions = await generateQuestions(
            data.resumeText,
            data.jdText,
            data.candidateName,
            data.role,
            data.mustAskQuestions || '',
            data.difficulty || {},
            numQ
          )
          store.setQuestions(questions)
        } catch (err: any) {
          store.setError(`Failed to generate questions: ${err.message}`)
          return
        }
      }

      store.setPhase('interview')
      const intro = INTRO_PROMPT(data.candidateName, data.role, questions.length)
      speakAndThen(intro, () => askQuestion(questions, 0))
    },
    [speakAndThen, askQuestion, store]
  )

  const reset = useCallback(() => {
    stopSpeaking()
    stopListening()
    processingRef.current = false
    store.reset()
  }, [stopSpeaking, stopListening, store])

  return { handleAnswer, startInterview, reset }
}
