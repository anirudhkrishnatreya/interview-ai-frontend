import React, { useState, useEffect, useCallback } from 'react'
import { X, Loader2, Calendar, Link, Search, CheckCircle, Copy, UserCheck } from 'lucide-react'
import { candidateProfilesService, CandidateProfile } from '../../../services/candidateProfiles'
import { assignmentsService } from '../../../services/assignments'
import type { InterviewTemplate } from '../../../services/interviewTemplates'

interface Props {
  template: InterviewTemplate
  onClose: () => void
  onAssigned: () => void
}

export function AssignInterviewModal({ template, onClose, onAssigned }: Props) {
  const [step, setStep] = useState<'search' | 'confirm' | 'done'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<CandidateProfile | null>(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [attemptLimit, setAttemptLimit] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'

  // Auto-load all candidates on open, re-load on search
  const fetchCandidates = useCallback(async (q: string) => {
    setLoadingCandidates(true)
    try {
      const res = await candidateProfilesService.list({
        search: q || undefined,
        limit: 50,
      })
      setCandidates(res.data)
      setTotal(res.total)
    } catch {
      setError('Could not load candidates')
    } finally {
      setLoadingCandidates(false)
    }
  }, [])

  // Load immediately on mount
  useEffect(() => {
    fetchCandidates('')
  }, [fetchCandidates])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery, fetchCandidates])

  const handleAssign = async () => {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const assignment = await assignmentsService.create({
        templateId: template.id,
        candidateProfileId: selected.id,
        expiryDate: expiryDate || undefined,
        attemptLimit,
      })
      const link = `${window.location.origin}/candidate/pre-interview/${assignment.token}`
      setGeneratedLink(link)
      setStep('done')
    } catch (e: any) {
      const msg = e.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg || 'Failed to assign interview')
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', padding: 16,
  }
  const modal: React.CSSProperties = {
    width: '100%', maxWidth: 520,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
  }

  return (
    <div style={overlay}>
      <div style={modal}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Assign Interview
            </h3>
            <p style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600 }}>{template.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px 22px' }}>

          {/* ── STEP: Done ─────────────────────────────────────────── */}
          {step === 'done' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
              <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto' }} />
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>
                  Interview Assigned!
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{selected?.name}</strong> can now log in to their dashboard or use this direct link:
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input readOnly value={generatedLink}
                  style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 10, color: 'var(--text-secondary)', outline: 'none', fontFamily: 'monospace' }} />
                <button onClick={copyLink}
                  style={{ padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left' }}>
                💡 The candidate can also log in at <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{loginUrl}</strong> and, if prompted, will be returned to this interview link automatically.
              </div>

              <button onClick={onAssigned}
                style={{ padding: '12px', background: 'var(--success)', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                Done ✓
              </button>
            </div>

          /* ── STEP: Confirm ──────────────────────────────────────── */
          ) : step === 'confirm' && selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Selected candidate card */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{selected.email}{selected.position ? ` · ${selected.position}` : ''}</div>
                </div>
                <UserCheck size={16} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
              </div>

              {/* Expiry */}
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>EXPIRY DATE (OPTIONAL)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
                  <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
                </div>
              </div>

              {/* Attempt limit */}
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>ATTEMPT LIMIT</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setAttemptLimit(n)}
                      style={{ flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, background: attemptLimit === n ? 'var(--bg-elevated)' : 'var(--bg-surface)', border: attemptLimit === n ? '1px solid var(--border-strong)' : '1px solid var(--border)', color: attemptLimit === n ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                      {n}×
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--bg-elevated)', border: '1px solid var(--danger)', borderRadius: 8, padding: '8px 12px' }}>⚠ {error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setStep('search'); setSelected(null) }}
                  style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
                  ← Back
                </button>
                <button onClick={handleAssign} disabled={loading}
                  style={{ flex: 2, padding: '10px', background: 'var(--accent-blue)', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Assigning…</> : 'Assign Interview →'}
                </button>
              </div>
            </div>

          /* ── STEP: Search ──────────────────────────────────────── */
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Search box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
                <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search candidates by name or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)' }}
                />
                {loadingCandidates && <Loader2 size={13} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
              </div>

              {/* Candidate count */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {loadingCandidates ? 'Loading candidates…' : `${total} candidate${total !== 1 ? 's' : ''} in your company`}
              </div>

              {/* Candidate list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 2 }}>
                {!loadingCandidates && candidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {searchQuery ? `No candidates match "${searchQuery}"` : 'No candidates yet.'}
                      <br />
                      <span style={{ color: 'var(--accent-blue)' }}>Go to Candidates → Add Candidate first.</span>
                    </p>
                  </div>
                ) : candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelected(c); setStep('confirm') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.email}{c.position ? ` · ${c.position}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: c.status === 'invited' ? 'var(--warning)' : c.status === 'completed' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.status}</span>
                      {c.userId && <span style={{ fontSize: 8, color: 'var(--accent-blue)', letterSpacing: '0.06em' }}>✓ LOGIN</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
