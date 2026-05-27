import React from 'react'
import { CheckCircle, Clock, Tag, Shield, HelpCircle } from 'lucide-react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 160 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', flex: 1, marginLeft: 12 }}>{value}</span>
    </div>
  )
}

export function Step6Review() {
  const { draft } = useInterviewAdminStore()
  const s = draft.step1
  const rules = draft.rules

  const activeRules = [
    rules.cameraRequired && 'Camera required',
    rules.microphoneRequired && 'Microphone required',
    rules.fullscreenRequired && 'Fullscreen mode',
    !rules.tabSwitchAllowed && `Tab-switch warnings (max ${rules.maxTabSwitchWarnings})`,
    rules.multipleFaceDetection && 'Multi-face detection',
    rules.internetStabilityCheck && 'Internet stability check',
    rules.recordingEnabled && 'Session recording',
    rules.resumeUploadRequired && 'Resume upload required',
  ].filter(Boolean) as string[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Review & Create</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Review all settings before creating the interview template.</p>
      </div>

      {/* Interview Details */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <CheckCircle size={14} style={{ color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.08em' }}>INTERVIEW DETAILS</span>
        </div>
        <ReviewRow label="Title" value={s.title || '—'} />
        <ReviewRow label="Role" value={s.role || '—'} />
        <ReviewRow label="Department" value={s.department || '—'} />
        <ReviewRow label="Interview Type" value={s.interviewType.replace('_', ' ').toUpperCase()} />
        <ReviewRow label="Employment Type" value={s.employmentType} />
        <ReviewRow label="Experience Level" value={s.experienceLevel} />
        <ReviewRow label="Language" value={s.language} />
        <ReviewRow label="Duration" value={`${s.durationMinutes} minutes`} />
      </div>

      {/* Topics + Questions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>TOPICS ({draft.topics.length})</span>
          </div>
          {draft.topics.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No topics selected</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {draft.topics.map((t) => (
                <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.15)', color: 'var(--accent-blue)', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <HelpCircle size={13} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em' }}>QUESTIONS ({draft.questions.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ReviewRow label="Total" value={`${draft.questions.length} / ${s.numQuestions} planned`} />
            <ReviewRow label="AI Generated" value={draft.questions.filter((q) => q.source === 'ai').length} />
            <ReviewRow label="Manual" value={draft.questions.filter((q) => q.source === 'manual').length} />
            <ReviewRow label="Mode" value={draft.questionMode} />
          </div>
        </div>
      </div>

      {/* Difficulty + Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={13} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em' }}>DIFFICULTY</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: draft.difficulty === 'easy' ? '#10b981' : draft.difficulty === 'medium' ? '#f59e0b' : draft.difficulty === 'hard' ? '#ef4444' : '#a78bfa', textTransform: 'uppercase' }}>
            {draft.difficulty}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Shield size={13} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em' }}>PROCTORING ({activeRules.length} rules)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activeRules.map((r) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} /> {r}
              </div>
            ))}
            {activeRules.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No proctoring rules set</div>}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#10b981' }}>
        ✓ Everything looks good! Click "Create Interview" to save this template and start assigning candidates.
      </div>
    </div>
  )
}
