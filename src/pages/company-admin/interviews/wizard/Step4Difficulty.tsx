import React from 'react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'

const difficulties = [
  {
    value: 'easy',
    label: 'Easy',
    desc: 'Foundational questions. Good for fresher to junior candidates.',
    color: '#10b981',
    icon: '🟢',
  },
  {
    value: 'medium',
    label: 'Medium',
    desc: 'Standard industry-level difficulty. Suitable for most roles.',
    color: '#f59e0b',
    icon: '🟡',
  },
  {
    value: 'hard',
    label: 'Hard',
    desc: 'Advanced, nuanced questions. For senior and specialist roles.',
    color: '#ef4444',
    icon: '🔴',
  },
  {
    value: 'adaptive',
    label: 'Adaptive AI',
    desc: 'AI dynamically adjusts difficulty based on the candidate\'s performance in real-time.',
    color: '#a78bfa',
    icon: '⚡',
  },
]

export function Step4Difficulty() {
  const { draft, setDifficulty } = useInterviewAdminStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Difficulty Settings
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choose the difficulty level for AI-generated questions and evaluation calibration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {difficulties.map((d) => {
          const isActive = draft.difficulty === d.value
          return (
            <button key={d.value} onClick={() => setDifficulty(d.value as any)}
              style={{
                padding: '20px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                background: isActive ? `${d.color}12` : 'rgba(255,255,255,0.02)',
                border: isActive ? `1.5px solid ${d.color}50` : '1.5px solid rgba(255,255,255,0.07)',
                transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
              }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%',
                  background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                </div>
              )}
              <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: isActive ? d.color : 'var(--text-primary)', marginBottom: 6 }}>
                {d.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{d.desc}</div>
            </button>
          )
        })}
      </div>

      {draft.difficulty === 'adaptive' && (
        <div style={{
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>⚡ How Adaptive Mode Works</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            The AI interviewer monitors answer quality in real-time. If a candidate answers well, follow-up questions
            become progressively harder. If they struggle, the AI provides easier entry points to unblock them.
            This gives a more accurate picture of the candidate's true ability range.
          </p>
        </div>
      )}
    </div>
  )
}
