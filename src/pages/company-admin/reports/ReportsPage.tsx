import React, { useCallback, useEffect, useState } from 'react'
import { FileText, Search, RefreshCw, AlertTriangle, Eye, Shield, CheckCircle, Clock, BarChart3, HelpCircle, User } from 'lucide-react'
import { interviewsService, InterviewSession } from '../../../services/interviews'
import { Badge, Card, Modal, ScoreRing, StatCard, Pagination } from '../../../components/ui'
import { useAuthStore } from '../../../store/authStore'

const recommendationColors = {
  HIRE: '#10b981',
  CONSIDER: '#f59e0b',
  FAIL: '#ef4444',
  PENDING: 'var(--text-muted)',
}

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  HIRE: 'green',
  CONSIDER: 'yellow',
  FAIL: 'red',
  PENDING: 'gray',
}

export function ReportsPage() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState<InterviewSession[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [recFilter, setRecFilter] = useState('')
  const [viewingReport, setViewingReport] = useState<InterviewSession | null>(null)
  const [detailedReport, setDetailedReport] = useState<InterviewSession | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, recFilter])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await interviewsService.list({ page: 1, limit: 100 })
      setReports(res.data)
      setTotal(res.total)
    } catch (e) {
      console.error('Failed to load reports:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Fetch full report details when modal opens
  const handleViewReport = async (session: InterviewSession) => {
    setViewingReport(session)
    setDetailedReport(null)
    try {
      const details = await interviewsService.get(session.id)
      setDetailedReport(details)
    } catch (err) {
      console.error('Failed to load detailed report:', err)
      setDetailedReport(session) // Fallback to basic session info
    }
  }

  const filtered = reports.filter((r) => {
    const matchesSearch = !search ||
      r.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !recFilter || r.recommendation === recFilter
    return matchesSearch && matchesFilter
  })

  const itemsPerPage = 10
  const totalItems = filtered.length
  const paginatedReports = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Compute quick analytics
  const totalCompleted = reports.length
  const hiredCount = reports.filter((r) => r.recommendation === 'HIRE').length
  const avgScore = totalCompleted
    ? reports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / totalCompleted
    : 0
  const highRiskCount = reports.filter((r) => r.riskScore >= 60).length

  return (
    <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Candidate Reports
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Review technical evaluations, AI structured summaries, and complete conversation transcripts.
        </p>
      </div>

      {/* Analytics widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Completed" value={totalCompleted} sub="All completed reports" color="var(--accent-blue)" icon={<FileText size={20} />} />
        <StatCard label="Hires Recommended" value={hiredCount} sub={`${totalCompleted ? Math.round((hiredCount / totalCompleted) * 100) : 0}% HIRE recommendation rate`} color="#10b981" icon={<CheckCircle size={20} />} />
        <StatCard label="Average Overall Score" value={avgScore.toFixed(1)} sub="Out of 10 average" color="var(--accent-cyan)" icon={<BarChart3 size={20} />} />
        <StatCard label="High Risk Proctoring" value={highRiskCount} sub={`${highRiskCount} flags to review`} color="var(--danger)" icon={<Shield size={20} />} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 300 }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search by name or role..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
        </div>
        {(['', 'HIRE', 'CONSIDER', 'FAIL'] as const).map((r) => (
          <button key={r} onClick={() => setRecFilter(r)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
              background: recFilter === r ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: recFilter === r ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              color: recFilter === r ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
            {r === '' ? 'All Decisions' : r}
          </button>
        ))}
        <button onClick={load} style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              {['Candidate', 'Applied Role', 'Overall Score', 'Recommendation', 'Integrity Status', 'Date Completed', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={{ padding: '16px' }}><div style={{ height: 12, borderRadius: 6, background: 'var(--bg-elevated)' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No candidate interview reports available yet. Once a candidate finishes their interview, their structured report will appear here automatically.
                </td>
              </tr>
            ) : (
              paginatedReports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>
                        {r.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.candidateName}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.role}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{(r.overallScore || 0).toFixed(1)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/10</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={statusVariant[r.recommendation] || 'gray'}>{r.recommendation}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Shield size={13} style={{ color: r.riskScore >= 60 ? 'var(--danger)' : r.riskScore >= 25 ? 'var(--warning)' : 'var(--success)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: r.riskScore >= 60 ? 'var(--danger)' : r.riskScore >= 25 ? '#d97706' : '#059669' }}>
                        {r.riskScore >= 60 ? `High Risk (${r.riskScore})` : r.riskScore >= 25 ? `Moderate (${r.riskScore})` : 'Clean'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
                    {r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleViewReport(r)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
                        cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 11, fontWeight: 600
                      }}>
                      <Eye size={12} /> View Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setPage(p)}
      />

      {/* Detailed Report Modal */}
      {viewingReport && (
        <Modal
          open={viewingReport !== null}
          onClose={() => setViewingReport(null)}
          title="Structured Interview Evaluation Report"
          size="lg"
        >
          {!detailedReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
              <div style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent-blue)', width: 32, height: 32, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading AI Structured Report...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '72vh', overflowY: 'auto', paddingRight: 4 }}>
              {/* Header card summary */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: '20px 24px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{detailedReport.candidateName}</h3>
                    <Badge variant={statusVariant[detailedReport.recommendation] || 'gray'}>{detailedReport.recommendation}</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>Role Applied: <strong>{detailedReport.role}</strong></p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Completed on {detailedReport.completedAt ? new Date(detailedReport.completedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 2 }}>OVERALL SCORE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: recommendationColors[detailedReport.recommendation] || 'var(--accent-blue)' }}>
                        {(detailedReport.overallScore || 0).toFixed(1)}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/10</span>
                    </div>
                  </div>
                  <ScoreRing score={Math.round(detailedReport.overallScore || 0)} size={54} />
                </div>
              </div>

              {/* Main Report: Executive summary & Categories split */}
              {detailedReport.report ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                  {/* Left Column: Summary and strengths */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 10 }}>
                        ✦ Executive Summary
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {detailedReport.report.executiveSummary}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 16 }}>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                          ↑ Key Strengths
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {detailedReport.report.strengths.map((s, idx) => (
                            <li key={idx} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 16 }}>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                          ↓ Development Areas
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {detailedReport.report.weaknesses.map((w, idx) => (
                            <li key={idx} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Skill categories & integrity */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                        📊 Skill Competency
                      </h4>
                      {detailedReport.report.categories.map((cat, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{cat.name}</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{cat.score}/10</span>
                          </div>
                          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                            <div style={{ height: '100%', width: `${cat.score * 10}%`, background: 'var(--accent-blue)', borderRadius: 2 }} />
                          </div>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{cat.justification}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                        🛡 Proctoring Log
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                        <Shield size={16} style={{ color: detailedReport.riskScore >= 60 ? 'var(--danger)' : 'var(--success)' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {detailedReport.riskScore >= 60 ? 'Suspicious Proctoring Record' : 'Clean / Low Risk Record'}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            {detailedReport.violationCount || 0} violation(s) · Integrity score: {100 - detailedReport.riskScore}/100
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Detailed Transcript */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <HelpCircle size={15} style={{ color: 'var(--accent-blue)' }} /> Full Interview Q&A Transcript
                </h4>
                {detailedReport.questions && detailedReport.questions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {detailedReport.questions.map((q, idx) => {
                      const answer = detailedReport.answers?.[idx] || 'No answer provided.'
                      const ev = (detailedReport.evaluations?.[idx] || {}) as any
                      return (
                        <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{q}</span>
                            </div>
                            {ev.score !== undefined && (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: ev.score >= 7 ? 'rgba(16,185,129,0.08)' : ev.score >= 5 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', color: ev.score >= 7 ? 'var(--success)' : ev.score >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                                Score: {ev.score}/10
                              </span>
                            )}
                          </div>
                          <div style={{ padding: 10, background: 'var(--bg-deep)', borderLeft: '3px solid var(--border-strong)', borderRadius: '0 8px 8px 0', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                            <strong style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>CANDIDATE RESPONSE:</strong>
                            "{answer}"
                          </div>
                          {ev.feedback && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                              <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(79, 70, 229, 0.04)', color: 'var(--text-secondary)' }}>
                                <strong>Feedback:</strong> {ev.feedback}
                              </div>
                              {ev.strength && (
                                <div style={{ color: '#059669' }}>
                                  <strong>✓ Strength:</strong> {ev.strength}
                                </div>
                              )}
                              {ev.improvement && (
                                <div style={{ color: '#d97706' }}>
                                  <strong>↗ Improvement Area:</strong> {ev.improvement}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No transcript questions available.</p>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
                <button
                  onClick={() => setViewingReport(null)}
                  style={{
                    background: 'var(--accent-blue)', border: 'none', borderRadius: 10,
                    padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
