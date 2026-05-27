import React, { useCallback, useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, UserPlus, Trash2, Copy, Eye, EyeOff, Key } from 'lucide-react'
import { candidateProfilesService, CandidateProfile } from '../../../services/candidateProfiles'
import { Badge, ConfirmModal, Pagination } from '../../../components/ui'

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
  invited: 'blue',
  pending: 'gray',
  started: 'yellow',
  completed: 'green',
  expired: 'gray',
  rejected: 'red',
  shortlisted: 'green',
}

// ─── Credential Display Modal ─────────────────────────────────────────────────
function CredentialModal({ email, password, name, onClose }: {
  email: string; password: string; name: string; onClose: () => void
}) {
  const [showPwd, setShowPwd] = useState(false)
  const [copied, setCopied] = useState(false)
  const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--success)', marginBottom: 6 }}>
            Candidate Added!
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            A login account has been created for <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>.<br />
            Share these credentials with the candidate.
          </p>
        </div>

        {/* Credentials box */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>LOGIN EMAIL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 8, fontFamily: 'monospace', border: '1px solid var(--border)' }}>
                {email}
              </code>
              <button onClick={() => copy(email)} style={{ padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)' }}>
                <Copy size={13} />
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>DEFAULT PASSWORD (shown once)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--success)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 8, fontFamily: 'monospace', letterSpacing: showPwd ? '0.1em' : '0.3em', border: '1px solid var(--border)' }}>
                {showPwd ? password : '•'.repeat(password.length)}
              </code>
              <button onClick={() => setShowPwd(!showPwd)} style={{ padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => copy(password)} style={{ padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)' }}>
                <Copy size={13} />
              </button>
            </div>
          </div>

          {/* Copy all */}
          <button onClick={() => copy(`Email: ${email}\nPassword: ${password}`)}
            style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--success)', borderRadius: 10, cursor: 'pointer', color: 'var(--success)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Copy size={13} /> {copied ? '✓ Copied!' : 'Copy All Credentials'}
          </button>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--warning)', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: 'var(--warning)', lineHeight: 1.7 }}>
          ⚠ Save these credentials now — the password will not be shown again. The candidate can change it after logging in.
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Candidate logs in at <strong style={{ color: 'var(--accent-blue)' }}>{loginUrl}</strong> → Candidate role
        </div>

        <button onClick={onClose}
          style={{ padding: '12px', background: 'var(--success)', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700 }}>
          Got it, I've saved the credentials ✓
        </button>
      </div>
    </div>
  )
}

// ─── Add Candidate Modal ──────────────────────────────────────────────────────
function AddCandidateModal({ onClose, onAdded }: {
  onClose: () => void
  onAdded: (result: { name: string; loginEmail: string; defaultPassword: string }) => void
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return }
    setLoading(true)
    try {
      const result = await candidateProfilesService.create(form)
      // result has: ...profile, defaultPassword, loginEmail
      onAdded({
        name: result.name,
        loginEmail: result.loginEmail || result.email,
        defaultPassword: result.defaultPassword || '',
      })
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to add candidate')
      setLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
    borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Add Candidate</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>A login account will be auto-created for the candidate.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input style={fieldStyle} placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input style={fieldStyle} type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={fieldStyle} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Position Applied</label>
            <input style={fieldStyle} placeholder="e.g. Frontend Engineer" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60, lineHeight: 1.6 }} placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Key size={13} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 1 }} />
          A default login password will be generated automatically. You'll see it after creation.
        </div>

        {error && <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--bg-elevated)', border: '1px solid var(--danger)', borderRadius: 8, padding: '8px 12px' }}>⚠ {error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: '10px', background: 'var(--accent-blue)', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? '⏳ Creating account…' : <><UserPlus size={14} /> Add Candidate</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [credentials, setCredentials] = useState<{ name: string; loginEmail: string; defaultPassword: string } | null>(null)
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
      const res = await candidateProfilesService.list({ page, limit: 20, search: search || undefined, status: statusFilter || undefined })
      setCandidates(res.data)
      setTotal(res.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSelectedIds([])
  }, [page, search, statusFilter])

  const handleDelete = async (id: string) => {
    setDeletingId(null)
    await candidateProfilesService.remove(id)
    showToast('Candidate removed', 'var(--danger)')
    load()
  }

  const handleBulkDelete = async () => {
    setDeletingBulk(false)
    try {
      await Promise.all(selectedIds.map(id => candidateProfilesService.remove(id)))
      showToast(`${selectedIds.length} candidates removed`, 'var(--danger)')
      setSelectedIds([])
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 12, padding: '12px 20px', fontSize: 13, color: toast.color, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>✓ {toast.msg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Candidates</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total · Each candidate gets a login account automatically</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedIds.length > 0 && (
            <button onClick={() => setDeletingBulk(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
              <Trash2 size={15} /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--accent-blue)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
            <UserPlus size={15} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 300 }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
        </div>
        {(['', 'invited', 'pending', 'started', 'completed', 'shortlisted', 'rejected'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', background: statusFilter === s ? 'var(--bg-elevated)' : 'var(--bg-surface)', border: statusFilter === s ? '1px solid var(--border-strong)' : '1px solid var(--border)', color: statusFilter === s ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button onClick={load} style={{ padding: '5px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
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
                  checked={candidates.length > 0 && selectedIds.length === candidates.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(candidates.map(c => c.id))
                    } else {
                      setSelectedIds([])
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              {['Candidate', 'Email / Login', 'Position', 'Status', 'Added', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} style={{ padding: '16px' }}><div style={{ height: 12, borderRadius: 6, background: 'var(--bg-elevated)' }} /></td>
                ))}
              </tr>
            )) : candidates.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No candidates yet. <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 13 }}>Add your first candidate →</button>
              </td></tr>
            ) : candidates.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ width: 40, padding: '14px 16px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(prev => [...prev, c.id])
                      } else {
                        setSelectedIds(prev => prev.filter(id => id !== c.id))
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      {c.phone && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.phone}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.email}</div>
                  {c.userId && <div style={{ fontSize: 9, color: 'var(--accent-blue)', marginTop: 2, letterSpacing: '0.06em' }}>✓ HAS LOGIN</div>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.position || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={statusVariant[c.status] || 'gray'}>{c.status}</Badge>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => setDeletingId(c.id)}
                    style={{ padding: '5px 8px', background: 'none', border: '1px solid var(--danger)', borderRadius: 8, cursor: 'pointer', color: 'var(--danger)' }}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={total}
        itemsPerPage={20}
        onPageChange={(p) => setPage(p)}
      />

      {/* Add Modal */}
      {showAdd && (
        <AddCandidateModal
          onClose={() => setShowAdd(false)}
          onAdded={(result) => {
            setShowAdd(false)
            setCredentials(result)
            load()
          }}
        />
      )}

      {/* Credential display modal */}
      {credentials && (
        <CredentialModal
          name={credentials.name}
          email={credentials.loginEmail}
          password={credentials.defaultPassword}
          onClose={() => { setCredentials(null); showToast('Candidate added successfully!') }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deletingId !== null}
        title="Delete Candidate?"
        message="Are you sure you want to delete this candidate profile? Their login account will remain active."
        confirmText="Delete"
        danger={true}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        onCancel={() => setDeletingId(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        open={deletingBulk}
        title="Delete Selected Candidates?"
        message={`Are you sure you want to delete the ${selectedIds.length} selected candidates? This action cannot be undone.`}
        confirmText="Delete All"
        danger={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setDeletingBulk(false)}
      />
    </div>
  )
}
