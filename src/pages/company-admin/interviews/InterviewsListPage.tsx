import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Copy, Archive, Trash2, Eye, MoreHorizontal, RefreshCw, Users, HelpCircle, Shield, Tag } from 'lucide-react'
import { interviewTemplatesService, InterviewTemplate } from '../../../services/interviewTemplates'
import { useInterviewAdminStore } from '../../../store/interviewAdminStore'
import { CreateInterviewWizard } from './CreateInterviewWizard'
import { Badge, ConfirmModal, Modal, Pagination } from '../../../components/ui'
import { AssignInterviewModal } from '../candidates/AssignInterviewModal'

const statusVariant: Record<string, 'green' | 'yellow' | 'gray'> = {
  active: 'green',
  draft: 'yellow',
  archived: 'gray',
}

const typeLabel: Record<string, string> = {
  technical: 'Technical',
  hr: 'HR',
  behavioral: 'Behavioral',
  system_design: 'System Design',
  ai_mixed: 'AI Mixed',
}

const difficultyColor: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  adaptive: '#a78bfa',
}

export function InterviewsListPage() {
  const wizardStore = useInterviewAdminStore()
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [assigningTemplate, setAssigningTemplate] = useState<InterviewTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<InterviewTemplate | null>(null)
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Selection and Bulk Deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deletingBulk, setDeletingBulk] = useState(false)

  const showToast = (msg: string, color = 'var(--success)') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await interviewTemplatesService.list({ page, limit: 15, status: statusFilter || undefined })
      setTemplates(res.data)
      setTotal(res.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSelectedIds([])
  }, [page, statusFilter])

  const handleDuplicate = async (id: string) => {
    await interviewTemplatesService.duplicate(id)
    showToast('Interview duplicated successfully')
    load()
  }

  const handleArchive = async (id: string) => {
    await interviewTemplatesService.archive(id)
    showToast('Interview archived', 'var(--warning)')
    load()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(null)
    await interviewTemplatesService.remove(id)
    showToast('Interview deleted', 'var(--danger)')
    load()
  }

  const handleBulkDelete = async () => {
    setDeletingBulk(false)
    try {
      await Promise.all(selectedIds.map(id => interviewTemplatesService.remove(id)))
      showToast(`${selectedIds.length} interviews deleted`, 'var(--danger)')
      setSelectedIds([])
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = templates.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 12, padding: '12px 20px', fontSize: 13, color: toast.color, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          ✓ {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Interviews</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total templates</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedIds.length > 0 && (
            <button onClick={() => setDeletingBulk(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
              <Trash2 size={15} /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => wizardStore.openWizard()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-blue)',
              border: 'none', borderRadius: 12,
              padding: '10px 20px', fontSize: 13, fontWeight: 700,
              color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}>
            <Plus size={15} /> Create Interview
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search interviews..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
        </div>
        {(['', 'active', 'draft', 'archived'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
              background: statusFilter === s ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: statusFilter === s ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              color: statusFilter === s ? 'var(--accent-blue)' : 'var(--text-muted)',
            }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
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
              <th style={{ width: 40, padding: '12px 16px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filtered.map(t => t.id))
                    } else {
                      setSelectedIds([])
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              {['Interview', 'Type', 'Difficulty', 'Questions', 'Assigned', 'Completed', 'Status', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} style={{ padding: '16px' }}>
                      <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-elevated)', animation: 'pulse 2s ease-in-out infinite' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No interview templates found. <button onClick={() => wizardStore.openWizard()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 13 }}>Create your first one →</button>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ width: 40, padding: '14px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, t.id])
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== t.id))
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.role} · {t.durationMinutes}m</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{typeLabel[t.interviewType] || t.interviewType}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: difficultyColor[t.difficulty] }}>{t.difficulty}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.questions?.length || 0}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.assignedCount}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{t.completedCount}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={statusVariant[t.status] || 'gray'}>{t.status}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => setAssigningTemplate(t)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 11 }}>
                        <Users size={12} /> Assign
                      </button>
                      <button onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                        style={{ padding: '5px 6px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <MoreHorizontal size={14} />
                      </button>
                      {openMenu === t.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 100,
                          background: 'var(--bg-card)', border: '1px solid var(--border)',
                          borderRadius: 12, padding: 8, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }} onMouseLeave={() => setOpenMenu(null)}>
                          {[
                            { icon: <Eye size={13} />, label: 'View', action: () => setViewingTemplate(t) },
                            { icon: <Copy size={13} />, label: 'Duplicate', action: () => handleDuplicate(t.id) },
                            { icon: <Archive size={13} />, label: 'Archive', action: () => handleArchive(t.id) },
                            { icon: <Trash2 size={13} />, label: 'Delete', action: () => setDeletingId(t.id), danger: true },
                          ].map((item) => (
                            <button key={item.label} onClick={() => { item.action(); setOpenMenu(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 12, color: item.danger ? 'var(--danger)' : 'var(--text-secondary)', textAlign: 'left' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                              {item.icon} {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={total}
        itemsPerPage={15}
        onPageChange={(p) => setPage(p)}
      />

      {/* Wizard modal */}
      {wizardStore.wizardOpen && (
        <CreateInterviewWizard onClose={() => wizardStore.closeWizard()} onCreated={() => { load(); showToast('Interview created successfully!') }} />
      )}

      {/* Assign modal */}
      {assigningTemplate && (
        <AssignInterviewModal
          template={assigningTemplate}
          onClose={() => setAssigningTemplate(null)}
          onAssigned={() => { showToast('Interview assigned!'); load(); setAssigningTemplate(null) }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deletingId !== null}
        title="Delete Interview?"
        message="Are you sure you want to delete this interview template? This action cannot be undone."
        confirmText="Delete"
        danger={true}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        onCancel={() => setDeletingId(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        open={deletingBulk}
        title="Delete Selected Interviews?"
        message={`Are you sure you want to delete the ${selectedIds.length} selected interview templates? This action cannot be undone.`}
        confirmText="Delete All"
        danger={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setDeletingBulk(false)}
      />

      {/* View Template Modal */}
      {viewingTemplate && (
        <Modal
          open={viewingTemplate !== null}
          onClose={() => setViewingTemplate(null)}
          title="Interview Template Details"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
            {/* Header info card */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{viewingTemplate.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Role: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{viewingTemplate.role}</span></p>
                {viewingTemplate.department && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Department: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{viewingTemplate.department}</span></p>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{typeLabel[viewingTemplate.interviewType] || viewingTemplate.interviewType}</span></p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge variant={statusVariant[viewingTemplate.status] || 'gray'}>{viewingTemplate.status}</Badge>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, color: '#fff', background: difficultyColor[viewingTemplate.difficulty] || 'var(--accent-blue)', textTransform: 'uppercase' }}>
                    {viewingTemplate.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Duration: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{viewingTemplate.durationMinutes} min</span></p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question Mode: <span style={{ color: 'var(--accent-blue)', fontWeight: 600, textTransform: 'uppercase' }}>{viewingTemplate.questionMode || 'AI'}</span></p>
              </div>
            </div>

            {/* Two column detail / rules */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
              {/* Left col: Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <HelpCircle size={15} style={{ color: 'var(--accent-blue)' }} /> Questions ({viewingTemplate.questions?.length || 0})
                </h4>
                {viewingTemplate.questions && viewingTemplate.questions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto', paddingRight: 6 }}>
                    {viewingTemplate.questions.map((q, idx) => (
                      <div key={q.id || idx} style={{ padding: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {q.type}
                            </span>
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : q.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: q.difficulty === 'hard' ? 'var(--danger)' : q.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 550, lineHeight: 1.5 }}>{q.text}</p>
                        {q.expectedAnswer && (
                          <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-deep)', borderRadius: 6, fontSize: 11 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Expected: </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{q.expectedAnswer}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No questions configured for this template.</p>
                )}
              </div>

              {/* Right col: Rules & Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <Shield size={15} style={{ color: 'var(--danger)' }} /> Proctoring Rules
                </h4>
                <div style={{ padding: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Camera Required', val: viewingTemplate.rules?.cameraRequired },
                    { label: 'Microphone Required', val: viewingTemplate.rules?.microphoneRequired },
                    { label: 'Fullscreen Required', val: viewingTemplate.rules?.fullscreenRequired },
                    { label: 'Tab Switch Disallowed', val: !viewingTemplate.rules?.tabSwitchAllowed },
                    { label: `Max Tab Switches (${viewingTemplate.rules?.maxTabSwitchWarnings || 0})`, val: !viewingTemplate.rules?.tabSwitchAllowed },
                    { label: 'Multi-Face Detection', val: viewingTemplate.rules?.multipleFaceDetection },
                    { label: 'Internet Stability Check', val: viewingTemplate.rules?.internetStabilityCheck },
                    { label: 'Recording Enabled', val: viewingTemplate.rules?.recordingEnabled },
                    { label: 'Resume Upload Required', val: viewingTemplate.rules?.resumeUploadRequired },
                  ].map((r, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: r.val ? 'var(--success)' : 'var(--text-muted)' }}>
                        {r.val ? '✓ Yes' : '— No'}
                      </span>
                    </div>
                  ))}
                </div>

                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginTop: 10 }}>
                  <Tag size={15} style={{ color: 'var(--accent-cyan)' }} /> Selected Topics
                </h4>
                {viewingTemplate.topics && viewingTemplate.topics.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {viewingTemplate.topics.map((t) => (
                      <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.15)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No specific topics specified.</p>
                )}
              </div>
            </div>

            {/* Footer buttons / close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <button
                onClick={() => setViewingTemplate(null)}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '8px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => { setAssigningTemplate(viewingTemplate); setViewingTemplate(null) }}
                style={{
                  background: 'var(--accent-blue)', border: 'none', borderRadius: 10,
                  padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'
                }}
              >
                Assign Candidate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

