import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Calendar, ChevronRight, Play, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { assignmentsService, InterviewAssignment } from '../../services/assignments'
import { useAuthStore } from '../../store/authStore'
import { Badge } from '../../components/ui'

const statusVariant: Record<string, 'green' | 'yellow' | 'gray' | 'red' | 'blue'> = {
  pending: 'yellow',
  started: 'blue',
  completed: 'green',
  expired: 'gray',
}

const difficultyColor: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  adaptive: '#8b5cf6',
}

export function CandidateDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<InterviewAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await assignmentsService.getMyAssignments()
        setAssignments(data)
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load your interviews')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDaysLeft = (expiry?: string) => {
    if (!expiry) return null
    const diff = new Date(expiry).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const pending = assignments.filter((a) => a.status === 'pending' || a.status === 'started')
  const completed = assignments.filter((a) => a.status === 'completed')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', backdropFilter: 'blur(20px)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="EasyHiring Logo" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>EasyHiring</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', border: '1px solid var(--border)' }}>
              {user?.name?.charAt(0) || 'C'}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11 }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Welcome */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {loading ? 'Loading your interviews…' : assignments.length === 0
              ? 'No interviews assigned yet. You will be notified when a company assigns you one.'
              : `You have ${pending.length} pending interview${pending.length !== 1 ? 's' : ''} to complete.`
            }
          </p>
        </div>

        {/* Pending / Active Interviews */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            📋 Assigned Interviews
          </h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--text-muted)', gap: 12 }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-blue)' }} />
              <span style={{ fontSize: 13 }}>Loading your interviews…</span>
            </div>
          ) : error ? (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '24px', textAlign: 'center', color: '#ef4444', fontSize: 13 }}>
              ⚠ {error}
            </div>
          ) : assignments.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px dashed var(--border-strong)',
              borderRadius: 20, padding: '48px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No interviews assigned yet</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                When a company assigns you an interview, it will appear here.<br />
                You may also have received a direct link via email — open that link to start directly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map((assignment) => {
                const daysLeft = getDaysLeft(assignment.expiryDate)
                const isExpired = daysLeft !== null && daysLeft <= 0
                const canStart = !isExpired && assignment.status !== 'completed' && assignment.attemptsUsed < assignment.attemptLimit

                return (
                  <div key={assignment.id} style={{
                    background: 'var(--bg-card)', border: `1px solid ${assignment.status === 'completed' ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                    borderRadius: 16, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20,
                    transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {assignment.template?.title}
                        </h3>
                        <Badge variant={statusVariant[assignment.status] || 'gray'}>{assignment.status}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {assignment.template?.role && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            🏢 {assignment.template.role}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                          <Clock size={12} /> {assignment.template?.durationMinutes} min
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          ❓ {assignment.template?.numQuestions} questions
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: difficultyColor[assignment.template?.difficulty || 'medium'] }}>
                          {assignment.template?.difficulty}
                        </span>
                        {assignment.attemptsUsed > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Attempt {assignment.attemptsUsed}/{assignment.attemptLimit}
                          </span>
                        )}
                        {daysLeft !== null && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: isExpired ? '#ef4444' : daysLeft <= 2 ? '#f59e0b' : 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            {isExpired ? '🔴 Expired' : daysLeft === 0 ? '🟡 Expires today' : `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </span>
                        )}
                      </div>
                    </div>

                    {assignment.status === 'completed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, color: '#10b981', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                        <CheckCircle size={15} /> Completed
                        {assignment.score != null && <span style={{ marginLeft: 4, opacity: 0.7 }}>· {assignment.score.toFixed(1)}/10</span>}
                      </div>
                    ) : canStart ? (
                      <button
                        onClick={() => navigate(`/candidate/pre-interview/${assignment.token}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '12px 24px', borderRadius: 12,
                          background: 'var(--accent-blue)',
                          border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                          color: '#ffffff', letterSpacing: '0.05em',
                          transition: 'all 0.2s', flexShrink: 0, whiteSpace: 'nowrap',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}>
                        <Play size={14} /> {assignment.status === 'started' ? 'Continue Interview' : 'Start Interview'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, color: '#ef4444', fontSize: 12, flexShrink: 0 }}>
                        <AlertCircle size={14} /> {isExpired ? 'Expired' : 'No attempts left'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Practice Mode divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🎯 Practice Mode</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
            Want to practice with your resume before your actual interview? Run a free-form AI interview session.
          </p>
          <button
            onClick={() => navigate('/candidate/setup')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 12, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            }}>
            <Play size={13} /> Start Practice Interview <ChevronRight size={13} />
          </button>
        </div>
      </main>
    </div>
  )
}
