import React from 'react'
import { AlertTriangle, Camera, Eye, Monitor, Volume2 } from 'lucide-react'
import type { ProctoringViolation } from '../../store/interviewStore'

interface ProctoringOverlayProps {
  violations: ProctoringViolation[]
  riskScore: number
  cameraActive: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  latestViolation?: ProctoringViolation | null
}

const violationIcons: Record<string, React.ReactNode> = {
  no_face: <Camera size={12} />,
  multiple_faces: <Eye size={12} />,
  tab_switch: <Monitor size={12} />,
  window_blur: <Monitor size={12} />,
  audio_anomaly: <Volume2 size={12} />,
  fullscreen_exit: <Monitor size={12} />,
}

export function ProctoringOverlay({
  violations,
  riskScore,
  cameraActive,
  videoRef,
  canvasRef,
  latestViolation,
}: ProctoringOverlayProps) {
  const riskColor = riskScore < 25 ? '#10b981' : riskScore < 60 ? '#f59e0b' : '#ef4444'
  const recentViolations = violations.slice(-3).reverse()

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Camera feed */}
      <div className="relative" style={{
        background: '#0a1020',
        border: `1.5px solid ${cameraActive ? 'rgba(56,245,200,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        aspectRatio: '4/3',
      }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
        {!cameraActive && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,16,32,0.9)', gap: 8,
          }}>
            <Camera size={24} style={{ color: 'rgba(239,68,68,0.6)' }} />
            <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.6)', fontFamily: 'var(--font-body)' }}>
              Camera Required
            </span>
          </div>
        )}
        {/* Live indicator */}
        {cameraActive && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '3px 8px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#10b981',
              animation: 'statusBlink 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Risk score */}
      <div style={{
        background: 'rgba(10,16,32,0.8)',
        border: `1px solid rgba(${riskScore > 60 ? '239,68,68' : '99,179,255'},0.15)`,
        borderRadius: 8, padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
            INTEGRITY SCORE
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: riskColor, fontFamily: 'var(--font-display)' }}>
            {Math.max(0, 100 - riskScore)}/100
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.max(0, 100 - riskScore)}%`,
            background: riskColor,
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {violations.length} violation(s) detected
        </div>
      </div>

      {/* Recent violations */}
      {recentViolations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {recentViolations.map((v, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: v.severity === 'high' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${v.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: 6, padding: '6px 10px',
            }}>
              <AlertTriangle size={10} style={{ color: v.severity === 'high' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                {v.details}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Warning banner shown on violation
export function ViolationWarning({ violation, onDismiss }: { violation: ProctoringViolation; onDismiss: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, minWidth: 320, maxWidth: 480,
      background: violation.severity === 'high' ? 'rgba(30,10,10,0.95)' : 'rgba(30,25,10,0.95)',
      border: `1.5px solid ${violation.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 0 30px ${violation.severity === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
      animation: 'slideInRight 0.3s ease',
    }}>
      <AlertTriangle size={20} style={{ color: violation.severity === 'high' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: violation.severity === 'high' ? '#ef4444' : '#f59e0b', fontFamily: 'var(--font-display)' }}>
          {violation.severity === 'high' ? 'WARNING: Violation Detected' : 'Notice: Suspicious Activity'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-body)' }}>
          {violation.details}
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4,
      }}>×</button>
    </div>
  )
}
