import React from 'react'
import { Camera, Mic, Monitor, Globe, User, AlertTriangle, Video, Shield, Wifi } from 'lucide-react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'
import type { InterviewRules } from '../../../../services/interviewTemplates'

interface RuleToggleProps {
  icon: React.ReactNode
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  color?: string
}

function RuleToggle({ icon, label, description, value, onChange, color = 'var(--accent-blue)' }: RuleToggleProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 12,
      background: value ? 'rgba(99,179,255,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${value ? 'rgba(99,179,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
      cursor: 'pointer', transition: 'all 0.2s',
    }} onClick={() => onChange(!value)}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: value ? `${color}18` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: value ? color : 'var(--text-muted)' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? color : 'rgba(255,255,255,0.08)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16,
          borderRadius: '50%', background: value ? '#fff' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.2s',
        }} />
      </div>
    </div>
  )
}

export function Step5Rules() {
  const { draft, updateRules } = useInterviewAdminStore()
  const rules = draft.rules

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Interview Rules & Proctoring
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure proctoring and session rules for candidates.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <RuleToggle icon={<Camera size={18} />} label="Camera Required" description="Candidate must enable their webcam during the interview."
          value={rules.cameraRequired} onChange={(v) => updateRules({ cameraRequired: v })} />
        <RuleToggle icon={<Mic size={18} />} label="Microphone Required" description="Candidate must enable their microphone for voice responses."
          value={rules.microphoneRequired} onChange={(v) => updateRules({ microphoneRequired: v })} />
        <RuleToggle icon={<Monitor size={18} />} label="Fullscreen Required" description="Interview must be conducted in fullscreen mode. Exit triggers a warning."
          value={rules.fullscreenRequired} onChange={(v) => updateRules({ fullscreenRequired: v })} />
        <RuleToggle icon={<Globe size={18} />} label="Restrict Tab Switching" description="Candidate will receive warnings if they switch browser tabs."
          value={!rules.tabSwitchAllowed} onChange={(v) => updateRules({ tabSwitchAllowed: !v })} color="#f59e0b" />
        <RuleToggle icon={<User size={18} />} label="Multiple Face Detection" description="Alert if more than one face is detected in camera frame."
          value={rules.multipleFaceDetection} onChange={(v) => updateRules({ multipleFaceDetection: v })} color="#a78bfa" />
        <RuleToggle icon={<Wifi size={18} />} label="Internet Stability Check" description="Pre-interview internet speed test to ensure stable connection."
          value={rules.internetStabilityCheck} onChange={(v) => updateRules({ internetStabilityCheck: v })} />
        <RuleToggle icon={<Video size={18} />} label="Session Recording" description="Record the interview session for later review."
          value={rules.recordingEnabled} onChange={(v) => updateRules({ recordingEnabled: v })} color="#ef4444" />
        <RuleToggle icon={<Shield size={18} />} label="Require Resume Upload" description="Candidate must upload resume before starting the interview."
          value={rules.resumeUploadRequired} onChange={(v) => updateRules({ resumeUploadRequired: v })} />
      </div>

      {/* Max tab warnings slider */}
      {!rules.tabSwitchAllowed && (
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Max Tab-Switch Warnings Before Termination</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{rules.maxTabSwitchWarnings}</div>
          </div>
          <input type="range" min={1} max={10} step={1} value={rules.maxTabSwitchWarnings}
            onChange={(e) => updateRules({ maxTabSwitchWarnings: +e.target.value })}
            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer', height: 4 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
            <span>1 (strict)</span><span>10 (lenient)</span>
          </div>
        </div>
      )}
    </div>
  )
}
