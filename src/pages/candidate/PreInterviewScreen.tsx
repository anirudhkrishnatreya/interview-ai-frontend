import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Mic, Wifi, Shield, Monitor, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { assignmentsService, InterviewAssignment } from '../../services/assignments'
import { useInterviewStore } from '../../store/interviewStore'

type CheckStatus = 'idle' | 'checking' | 'pass' | 'fail'

interface Check {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: CheckStatus
}

export function PreInterviewScreen() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const setAssignmentContext = useInterviewStore((s) => s.setAssignmentContext)
  const [assignment, setAssignment] = useState<InterviewAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checks, setChecks] = useState<Check[]>([
    { id: 'camera', label: 'Camera Access', description: 'We need access to your webcam for proctoring.', icon: <Camera size={18} />, status: 'idle' },
    { id: 'mic', label: 'Microphone Access', description: 'Voice responses require microphone permission.', icon: <Mic size={18} />, status: 'idle' },
    { id: 'internet', label: 'Internet Speed', description: 'Checking your connection stability.', icon: <Wifi size={18} />, status: 'idle' },
    { id: 'browser', label: 'Browser Compatibility', description: 'Verifying Speech API support.', icon: <Monitor size={18} />, status: 'idle' },
  ])
  const [allPassed, setAllPassed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        const data = await assignmentsService.getByToken(token)
        setAssignment(data)
      } catch (e: any) {
        setError(e.response?.data?.message || 'Invalid or expired interview link.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const updateCheck = (id: string, status: CheckStatus) => {
    setChecks((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
  }

  const runChecks = async () => {
    // Camera check
    updateCheck('camera', 'checking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((t) => t.stop())
      updateCheck('camera', 'pass')
    } catch {
      updateCheck('camera', 'fail')
    }

    // Mic check
    updateCheck('mic', 'checking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      updateCheck('mic', 'pass')
    } catch {
      updateCheck('mic', 'fail')
    }

    // Internet speed (rough check via fetch timing)
    updateCheck('internet', 'checking')
    try {
      const start = Date.now()
      await fetch('https://www.google.com/generate_204', { mode: 'no-cors', cache: 'no-store' })
      const rtt = Date.now() - start
      updateCheck('internet', rtt < 2000 ? 'pass' : 'fail')
    } catch {
      updateCheck('internet', 'fail')
    }

    // Browser Speech API check
    updateCheck('browser', 'checking')
    const hasSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const hasSynth = 'speechSynthesis' in window
    updateCheck('browser', hasSpeech && hasSynth ? 'pass' : 'fail')
  }

  useEffect(() => {
    const allDone = checks.every((c) => c.status === 'pass' || c.status === 'fail')
    const allOk = checks.every((c) => c.status === 'pass')
    if (allDone) setAllPassed(allOk)
  }, [checks])

  const handleStart = async () => {
    if (!token || !assignment) return
    setStarting(true)
    try {
      await assignmentsService.startByToken(token)

      // Pass the full template context so the interview engine
      // can use the company's pre-defined questions
      const template = assignment.template
      setAssignmentContext({
        token,
        assignmentId: assignment.id,
        candidateName: assignment.candidateProfile?.name || 'Candidate',
        role: template?.role || template?.title || 'Interview',
        templateQuestions: (template?.questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          difficulty: q.difficulty,
          expectedAnswer: q.expectedAnswer,
          scoringCriteria: q.scoringCriteria,
        })),
        templateTitle: template?.title || 'Interview',
        templateNumQuestions: template?.numQuestions || 0,
        questionMode: (template?.questionMode as any) || 'ai',
      })
      navigate('/candidate/interview', { state: { fromAssignment: true, token, assignmentId: assignment.id } })
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to start interview.')
      setStarting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{error}</p>
      </div>
    </div>
  )

  const rules = assignment?.template?.rules
  const allChecksRun = checks.every((c) => c.status !== 'idle')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '-20%', left: '30%', background: 'radial-gradient(circle, rgba(99,179,255,0.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 600, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Interview info */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>INTERVIEW INVITATION</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {assignment?.template?.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {assignment?.template?.durationMinutes} min</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>❓ {assignment?.template?.numQuestions} questions</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📊 {assignment?.template?.difficulty} difficulty</span>
          </div>
        </div>

        {/* Pre-checks */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>System Check</h2>
            {!allChecksRun && (
              <button onClick={runChecks}
                style={{ padding: '6px 14px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 11, fontWeight: 600 }}>
                Run Checks
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checks.map((check) => (
              <div key={check.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ color: check.status === 'pass' ? '#10b981' : check.status === 'fail' ? '#ef4444' : 'var(--text-muted)', flexShrink: 0 }}>
                  {check.status === 'checking' ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : check.status === 'pass' ? <CheckCircle size={18} />
                    : check.status === 'fail' ? <XCircle size={18} />
                    : check.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{check.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{check.description}</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: check.status === 'pass' ? '#10b981' : check.status === 'fail' ? '#ef4444' : check.status === 'checking' ? '#f59e0b' : 'var(--text-muted)' }}>
                  {check.status === 'idle' ? '—' : check.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        {rules && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Shield size={14} style={{ color: '#ef4444' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Proctoring Rules</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                rules.cameraRequired && 'Camera must stay on',
                rules.microphoneRequired && 'Microphone must stay on',
                rules.fullscreenRequired && 'Stay in fullscreen mode',
                !rules.tabSwitchAllowed && `Max ${rules.maxTabSwitchWarnings} tab-switch warnings`,
                rules.multipleFaceDetection && 'One face visible only',
                rules.recordingEnabled && 'Session is being recorded',
              ].filter(Boolean).map((rule, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={10} style={{ color: '#f59e0b', flexShrink: 0 }} /> {rule}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
            style={{ marginTop: 2, accentColor: 'var(--accent-blue)', cursor: 'pointer' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            I understand the interview rules and agree that my session may be monitored or recorded. I confirm this is my own attempt and I will not use any external assistance.
          </span>
        </label>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!termsAccepted || !allPassed || starting}
          style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: termsAccepted && allPassed ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' : 'var(--bg-elevated)',
            border: termsAccepted && allPassed ? 'none' : '1px solid var(--border)',
            color: termsAccepted && allPassed ? '#ffffff' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em',
            cursor: termsAccepted && allPassed && !starting ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: termsAccepted && allPassed ? '0 4px 14px rgba(79, 70, 229, 0.25)' : 'none',
          }}>
          {starting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> STARTING…</> : 'BEGIN INTERVIEW →'}
        </button>

        {!allChecksRun && (
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>Please run system checks first to enable the Start button.</p>
        )}
      </div>
    </div>
  )
}
