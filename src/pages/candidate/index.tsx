import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Mic, MicOff, AlertTriangle, CheckCircle, Clock, FileText, Play } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useInterviewStore } from '../../store/interviewStore'
import { CandidateDashboard } from './CandidateDashboard'
import { PreInterviewScreen } from './PreInterviewScreen'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useInterview } from '../../hooks/useInterview'
import { useProctoring } from '../../hooks/useProctoring'
import { AgentOrb } from '../../components/interview/AgentOrb'
import { ProctoringOverlay, ViolationWarning } from '../../components/proctoring/ProctoringOverlay'
import { ProgressBar, Card, Badge, ScoreRing } from '../../components/ui'
import { extractText } from '../../utils/pdfParser'
import { downloadReport } from '../../utils/reportGenerator'
import type { ProctoringViolation } from '../../store/interviewStore'

// ─── Upload / Setup Screen ────────────────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (data: any) => void }) {
  const { user } = useAuthStore()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [role, setRole] = useState('')
  const [mustAsk, setMustAsk] = useState('')
  const [difficulty, setDifficulty] = useState({ technical: 3, behavioral: 2, situational: 2 })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resumeRef = useRef<HTMLInputElement>(null)
  const jdRef = useRef<HTMLInputElement>(null)

  const canStart = resumeFile && jdFile && role.trim() && !loading

  const handleStart = async () => {
    if (!canStart) return
    setLoading(true); setError(null)
    try {
      setStatus('Reading resume…')
      const resumeText = await extractText(resumeFile!)
      setStatus('Reading job description…')
      const jdText = await extractText(jdFile!)
      setStatus('Generating questions…')
      await onStart({ candidateName: user?.name || 'Candidate', role: role.trim(), resumeText, jdText, mustAskQuestions: mustAsk, difficulty })
    } catch (err: any) {
      setError(err.message); setLoading(false); setStatus('')
    }
  }

  const DropZone = ({ label, file, onFile, inputRef }: any) => (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${file ? 'var(--accent-cyan)' : 'rgba(99,179,255,0.2)'}`,
        borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
        background: file ? 'rgba(56,245,200,0.04)' : 'rgba(15,24,41,0.5)', transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} style={{ display: 'none' }} />
      <div style={{ fontSize: 24, marginBottom: 8 }}>{file ? '✓' : label === 'Resume' ? '📄' : '📋'}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: file ? 'var(--accent-cyan)' : 'var(--text-secondary)', marginBottom: 4 }}>
        {file ? file.name : `Upload ${label}`}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PDF or TXT · click to browse</div>
    </div>
  )

  const diffLabels = ['Easy', 'Moderate', 'Standard', 'Hard', 'Expert']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        {/* Ambiance */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-15%', left: '30%', background: 'radial-gradient(circle, rgba(99,179,255,0.05) 0%, transparent 70%)' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(99,179,255,0.2), rgba(99,179,255,0.05))', border: '1.5px solid rgba(99,179,255,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 30px rgba(99,179,255,0.15)' }}>
            <Play size={22} style={{ color: 'var(--accent-blue)', marginLeft: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            Upload your resume and the job description. Nova will conduct a personalized voice interview.
          </p>
        </div>

        <div style={{ background: 'rgba(10,16,32,0.9)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>TARGET ROLE *</label>
            <input className="input-dark" placeholder="e.g. Senior Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>RESUME *</label>
              <DropZone label="Resume" file={resumeFile} onFile={setResumeFile} inputRef={resumeRef} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>JOB DESCRIPTION *</label>
              <DropZone label="JD" file={jdFile} onFile={setJdFile} inputRef={jdRef} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>MUST-ASK QUESTIONS <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
            <textarea
              className="input-dark" placeholder="One question per line…" rows={3}
              value={mustAsk} onChange={(e) => setMustAsk(e.target.value)}
              style={{ resize: 'vertical', minHeight: 72, lineHeight: 1.6 }}
            />
          </div>

          <div style={{ background: 'rgba(99,179,255,0.03)', border: '1px solid rgba(99,179,255,0.08)', borderRadius: 12, padding: '18px 20px 8px', marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 14 }}>DIFFICULTY</label>
            {(['technical', 'behavioral', 'situational'] as const).map((area) => (
              <div key={area} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{area}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)' }}>{diffLabels[difficulty[area] - 1]}</span>
                </div>
                <input type="range" min={1} max={5} step={1} value={difficulty[area]}
                  onChange={(e) => setDifficulty((d) => ({ ...d, [area]: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer', height: 4 }} />
              </div>
            ))}
          </div>

          {error && <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: 'var(--danger)', marginBottom: 14 }}>⚠ {error}</div>}
          {loading && status && <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent-cyan)', marginBottom: 14, letterSpacing: '0.06em' }}>◉ {status}</div>}

          <button
            onClick={handleStart} disabled={!canStart}
            style={{
              width: '100%', padding: 16, borderRadius: 14,
              border: canStart ? '1px solid rgba(99,179,255,0.4)' : '1px solid rgba(99,179,255,0.1)',
              background: canStart ? 'linear-gradient(135deg, rgba(99,179,255,0.2), rgba(56,245,200,0.1))' : 'rgba(99,179,255,0.04)',
              color: canStart ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
              cursor: canStart ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
            }}
          >
            {loading ? 'PREPARING INTERVIEW…' : 'BEGIN INTERVIEW →'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.8 }}>
          Files are processed locally. Camera monitoring will be enabled during the interview.
        </p>
      </div>
    </div>
  )
}

// ─── Interview Context ────────────────────────────────────────────────────────
interface InterviewContextType {
  speak: (text: string, opts?: { onEnd?: () => void }) => void
  stopSpeaking: () => void
  startListening: () => void
  stopListening: () => void
  isListening: boolean
  isSupported: boolean
  interimText: string
  handleAnswer: (transcript: string) => Promise<void>
  startInterview: (data: {
    candidateName: string
    role: string
    resumeText: string
    jdText: string
    mustAskQuestions?: string
    difficulty?: Record<string, number>
  }) => Promise<void>
  reset: () => void
}

const InterviewContext = createContext<InterviewContextType | null>(null)

export function useInterviewContext() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterviewContext must be used within an InterviewProvider')
  return ctx
}

// ─── Interview Screen ─────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  idle: 'Ready', speaking: 'Nova is speaking…', listening: 'Listening to your answer…',
  thinking: 'Evaluating…', error: 'Something went wrong', generating: 'Generating questions…', evaluating: 'Evaluating your answer…',
}

function InterviewScreen({ assignmentFlow = false }: { assignmentFlow?: boolean }) {
  const store = useInterviewStore()
  const [textInput, setTextInput] = useState('')
  const [latestViolation, setLatestViolation] = useState<ProctoringViolation | null>(null)
  const navigate = useNavigate()
  const hasAutoStarted = useRef(false)

  const {
    isListening,
    interimText,
    handleAnswer,
    reset,
    startInterview,
  } = useInterviewContext()

  const { videoRef, canvasRef, cameraActive, violations, riskScore, startCamera, stopCamera, requestFullscreen } = useProctoring({
    enabled: true,
    onViolation: (v) => setLatestViolation(v),
    onTerminate: () => {
      alert('Interview terminated due to repeated violations.')
      reset()
    },
  })

  useEffect(() => {
    startCamera()
    requestFullscreen()
    window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices())
    return () => stopCamera()
  }, [])

  // Auto-start interview when coming from the assignment/token flow
  useEffect(() => {
    if (!assignmentFlow || hasAutoStarted.current) return
    if (store.phase !== 'assigned') return
    hasAutoStarted.current = true
    startInterview({
      candidateName: store.candidateName || 'Candidate',
      role: store.role || 'Interview',
      // For manual/hybrid modes the template questions come from the store directly.
      // For AI mode with no resume/JD, the AI generates based on the role name.
      resumeText: store.resumeText || '',
      jdText: store.jdText || '',
    })
  }, [assignmentFlow, store.phase, store.candidateName, store.role, startInterview])

  // Navigate to report when complete
  useEffect(() => {
    if (store.phase === 'complete') navigate('/candidate/report')
  }, [store.phase, navigate])

  const { agentStatus, phase, questions, currentIndex, error } = store
  const currentQuestion = questions[currentIndex] || ''
  const numQuestions = questions.length

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) { handleAnswer(textInput.trim()); setTextInput('') }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-deep)', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Violation warning */}
      {latestViolation && (
        <ViolationWarning violation={latestViolation} onDismiss={() => setLatestViolation(null)} />
      )}

      {/* Left: Proctoring panel */}
      <div style={{
        width: 220, background: 'rgba(10,16,32,0.95)', borderRight: '1px solid rgba(99,179,255,0.08)',
        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, overflowY: 'auto',
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>PROCTORING</div>
        <ProctoringOverlay
          violations={violations}
          riskScore={riskScore}
          cameraActive={cameraActive}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
      </div>

      {/* Center: Interview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        {/* Ambient */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(99,179,255,0.05) 0%, transparent 70%)' }} />
        </div>

        {/* Header */}
        <header style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 0', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Nova</h1>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AI INTERVIEW COACH</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'statusBlink 2s ease-in-out infinite' }} />
              LIVE
            </div>
            <button onClick={reset} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.05)', color: 'var(--danger)', fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer' }}>
              END
            </button>
          </div>
        </header>

        <main style={{ flex: 1, width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', padding: '16px 28px 20px', overflow: 'hidden', position: 'relative', zIndex: 1, gap: 16 }}>
          {numQuestions > 0 && <ProgressBar current={Math.min(currentIndex, numQuestions)} total={numQuestions} />}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <AgentOrb status={agentStatus} />
            <div style={{ fontSize: 11, letterSpacing: '0.08em', color: agentStatus === 'listening' ? 'var(--accent-cyan)' : 'var(--text-muted)', transition: 'color 0.4s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {agentStatus === 'listening' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'statusBlink 0.8s ease-in-out infinite' }} />}
              {STATUS_LABELS[phase] || STATUS_LABELS[agentStatus] || 'Ready'}
            </div>
          </div>

          {isListening && interimText && (
            <div style={{ background: 'rgba(56,245,200,0.04)', border: '1px solid rgba(56,245,200,0.1)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {interimText}
            </div>
          )}

          {error && <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 11, color: 'var(--danger)' }}>⚠ {error}</div>}

          {currentQuestion && phase === 'interview' && (
            <div style={{ background: isListening ? 'linear-gradient(135deg, rgba(99,179,255,0.08), rgba(56,245,200,0.04))' : 'rgba(15,24,41,0.6)', border: `1px solid ${isListening ? 'rgba(99,179,255,0.25)' : 'rgba(99,179,255,0.08)'}`, borderRadius: 12, padding: '20px 24px', transition: 'all 0.4s' }}>
              <div style={{ fontSize: 9, color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Question {currentIndex + 1}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>{currentQuestion}</p>
            </div>
          )}

          {(phase === 'generating' || phase === 'evaluating') && !currentQuestion && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              Please wait…
            </div>
          )}

          {isListening && (
            <div style={{ marginTop: 'auto' }}>
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Or type your answer…" value={textInput} onChange={(e) => setTextInput(e.target.value)}
                  style={{ flex: 1, background: 'rgba(15,24,41,0.8)', border: '1px solid rgba(99,179,255,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }} />
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,179,255,0.2)', background: 'rgba(99,179,255,0.1)', color: 'var(--accent-blue)', fontSize: 11, cursor: 'pointer' }}>
                  Send
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Report Screen ────────────────────────────────────────────────────────────
function ReportScreen() {
  const { candidateName, role, reset } = useInterviewStore()
  const navigate = useNavigate()

  const handleReturn = () => {
    reset()
    navigate('/candidate')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        width: '100%', maxWidth: 520, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 24, padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 24, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)'
      }}>
        {/* Animated Check Circle icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.08)',
          border: '1.5px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#10b981', marginBottom: 8
        }}>
          <CheckCircle size={36} />
        </div>

        {/* Title & Description */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Interview Completed!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
            Thank you, {candidateName}
          </p>
          <div style={{ height: 1, background: 'var(--border)', width: '60px', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 420 }}>
            Your interview session for the <strong style={{ color: 'var(--text-primary)' }}>{role}</strong> position has been successfully recorded and submitted to the recruitment team.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 12 }}>
            The hiring managers will carefully evaluate your response transcripts and follow up with you directly regarding the next steps in the hiring process.
          </p>
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturn}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: 'var(--accent-blue)', border: 'none',
            color: '#ffffff', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2d', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
            marginTop: 8
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}

// ─── Candidate Layout (wraps routes) ─────────────────────────────────────────
export default function CandidateLayout() {
  const { speak, stopSpeaking } = useSpeechSynthesis()
  const handleAnswerRef = useRef<((t: string) => void) | null>(null)
  const { startListening, stopListening, isListening, isSupported, interimText } = useSpeechRecognition({
    onFinalTranscript: (t) => handleAnswerRef.current?.(t),
  })
  const { handleAnswer, startInterview, reset } = useInterview({ speak, stopSpeaking, startListening, stopListening })
  const phase = useInterviewStore((s) => s.phase)
  const navigate = useNavigate()

  useEffect(() => {
    handleAnswerRef.current = handleAnswer
  }, [handleAnswer])

  const contextValue = React.useMemo(() => ({
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isListening,
    isSupported,
    interimText,
    handleAnswer,
    startInterview,
    reset,
  }), [
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isListening,
    isSupported,
    interimText,
    handleAnswer,
    startInterview,
    reset,
  ])

  return (
    <InterviewContext.Provider value={contextValue}>
      <Routes>
        <Route index element={<CandidateDashboard />} />
        <Route path="setup" element={<SetupScreen onStart={async (data) => { await startInterview(data); navigate('/candidate/interview') }} />} />
        <Route path="pre-interview/:token" element={<PreInterviewScreen />} />
        <Route path="interview" element={phase === 'upload' ? <Navigate to="/candidate" replace /> : <InterviewScreen assignmentFlow={phase === 'assigned'} />} />
        <Route path="report" element={phase !== 'complete' ? <Navigate to="/candidate" replace /> : <ReportScreen />} />
        <Route path="*" element={<Navigate to="/candidate" replace />} />
      </Routes>
    </InterviewContext.Provider>
  )
}
