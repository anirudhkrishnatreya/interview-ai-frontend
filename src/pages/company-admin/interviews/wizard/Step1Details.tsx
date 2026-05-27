import React from 'react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.15)',
  borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 8,
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
  appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
}

const fieldGroup = (children: React.ReactNode, cols = 1): React.ReactNode => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
    {children}
  </div>
)

export function Step1Details() {
  const { draft, updateStep1 } = useInterviewAdminStore()
  const s = draft.step1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Basic Interview Details
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure the core information for this interview template.</p>
      </div>

      <div>
        <label style={labelStyle}>Interview Title *</label>
        <input style={inputStyle} placeholder="e.g. Senior Frontend Engineer Interview"
          value={s.title} onChange={(e) => updateStep1({ title: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.6 }}
          placeholder="Brief description of the interview purpose and what you're looking for..."
          value={s.description} onChange={(e) => updateStep1({ description: e.target.value })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Role / Position *</label>
          <input style={inputStyle} placeholder="e.g. Senior Software Engineer"
            value={s.role} onChange={(e) => updateStep1({ role: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Department</label>
          <input style={inputStyle} placeholder="e.g. Engineering"
            value={s.department} onChange={(e) => updateStep1({ department: e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Employment Type</label>
          <select style={selectStyle} value={s.employmentType} onChange={(e) => updateStep1({ employmentType: e.target.value as any })}>
            <option value="full-time">Full-Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Experience Level</label>
          <select style={selectStyle} value={s.experienceLevel} onChange={(e) => updateStep1({ experienceLevel: e.target.value as any })}>
            <option value="fresher">Fresher (0–1 yr)</option>
            <option value="junior">Junior (1–3 yrs)</option>
            <option value="mid">Mid-Level (3–6 yrs)</option>
            <option value="senior">Senior (6+ yrs)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Interview Type</label>
          <select style={selectStyle} value={s.interviewType} onChange={(e) => updateStep1({ interviewType: e.target.value as any })}>
            <option value="ai_mixed">AI Mixed (Recommended)</option>
            <option value="technical">Technical</option>
            <option value="hr">HR</option>
            <option value="behavioral">Behavioral</option>
            <option value="system_design">System Design</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Duration (minutes)</label>
          <input style={inputStyle} type="number" min={10} max={180} step={5}
            value={s.durationMinutes} onChange={(e) => updateStep1({ durationMinutes: +e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Number of Questions</label>
          <input style={inputStyle} type="number" min={3} max={20}
            value={s.numQuestions} onChange={(e) => updateStep1({ numQuestions: +e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Language</label>
          <select style={selectStyle} value={s.language} onChange={(e) => updateStep1({ language: e.target.value })}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
          <div style={{
            background: 'rgba(99,179,255,0.05)', border: '1px solid rgba(99,179,255,0.1)',
            borderRadius: 10, padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', width: '100%', lineHeight: 1.7,
          }}>
            ✦ Estimated duration: <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{s.durationMinutes} min</span> ·
            {' '}{s.numQuestions} questions · {s.interviewType.replace('_', ' ')} format
          </div>
        </div>
      </div>
    </div>
  )
}
