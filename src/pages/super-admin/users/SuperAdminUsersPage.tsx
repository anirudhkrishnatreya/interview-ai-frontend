import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, Key, Shield, ShieldOff, Edit2, Copy, Building2, User, Eye, EyeOff } from 'lucide-react'
import { usersAdminService, UserAdmin } from '../../../services/usersAdmin'
import { companiesService } from '../../../services/companies'
import { Badge, Pagination } from '../../../components/ui'

const roleColor: Record<string, 'red' | 'blue' | 'yellow'> = {
  super_admin: 'red',
  company_admin: 'blue',
  candidate: 'yellow',
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  candidate: 'Candidate',
}

// ─── Credential Display Modal ─────────────────────────────────────────────────
function UserCredentialModal({ email, password, name, onClose }: {
  email: string; password: string; name: string; onClose: () => void
}) {
  const [showPwd, setShowPwd] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#10b981', marginBottom: 6 }}>
            Account Credentials
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            A login account has been set up for <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>.<br />
            Share these credentials securely.
          </p>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>LOGIN EMAIL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 8, fontFamily: 'monospace' }}>
                {email}
              </code>
              <button onClick={() => copy(email)} style={{ padding: '8px 10px', background: 'rgba(99,179,255,0.1)', border: '1px solid rgba(99,179,255,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)' }}>
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>PASSWORD (shown once)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.06)', padding: '8px 12px', borderRadius: 8, fontFamily: 'monospace', letterSpacing: showPwd ? '0.1em' : '0.3em' }}>
                {showPwd ? password : '•'.repeat(password.length)}
              </code>
              <button onClick={() => setShowPwd(!showPwd)} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => copy(password)} style={{ padding: '8px 10px', background: 'rgba(99,179,255,0.1)', border: '1px solid rgba(99,179,255,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)' }}>
                <Copy size={13} />
              </button>
            </div>
          </div>

          <button onClick={() => copy(`Email: ${email}\nPassword: ${password}`)}
            style={{ width: '100%', padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, cursor: 'pointer', color: '#10b981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Copy size={13} /> {copied ? '✓ Copied!' : 'Copy All Credentials'}
          </button>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#f59e0b', lineHeight: 1.7 }}>
          ⚠ Save these credentials now — the password will not be shown again.
        </div>

        <button onClick={onClose}
          style={{ padding: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, cursor: 'pointer', color: '#10b981', fontSize: 13, fontWeight: 700 }}>
          Got it, I've saved the credentials ✓
        </button>
      </div>
    </div>
  )
}

// ─── User Form Modal ──────────────────────────────────────────────────────
function UserFormModal({ user, onClose, onSaved }: {
  user?: UserAdmin | null
  onClose: () => void
  onSaved: (result?: { name: string; email: string; defaultPassword?: string }) => void
}) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'company_admin',
    companyId: user?.companyId || '',
  })
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    companiesService.list().then((res) => setCompanies(res.data)).catch(console.error)
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return }
    if (form.role !== 'super_admin' && !form.companyId) { setError('Company is required for non-super admins.'); return }

    setLoading(true)
    try {
      if (user) {
        await usersAdminService.update(user.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          companyId: form.role === 'super_admin' ? null : form.companyId,
        } as any)
        onSaved()
      } else {
        const result = await usersAdminService.create({
          name: form.name,
          email: form.email,
          role: form.role,
          companyId: form.role === 'super_admin' ? null : form.companyId,
        } as any)
        onSaved({ name: result.name, email: result.email, defaultPassword: result.defaultPassword })
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save user')
      setLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.12)',
    borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(99,179,255,0.15)', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{user ? 'Edit User' : 'Add User'}</h3>
            {!user && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>A login password will be auto-generated.</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input style={fieldStyle} placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input style={fieldStyle} type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Role *</label>
            <select style={fieldStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
              <option value="company_admin">Company Admin</option>
              <option value="candidate">Candidate</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          
          {form.role !== 'super_admin' && (
            <div>
              <label style={labelStyle}>Company *</label>
              <select style={fieldStyle} value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                <option value="">Select a company...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {error && <div style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px' }}>⚠ {error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 2, padding: '10px', background: 'rgba(99,179,255,0.12)', border: '1px solid rgba(99,179,255,0.25)', borderRadius: 10, cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? '⏳ Saving…' : (user ? 'Save Changes' : 'Create User')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  
  const [showAdd, setShowAdd] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null)
  const [credentials, setCredentials] = useState<{ name: string; email: string; defaultPassword: string } | null>(null)
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)

  const showToast = (msg: string, color = '#10b981') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersAdminService.list({ page, limit: 20, search: search || undefined, role: roleFilter || undefined })
      setUsers(res.data)
      setTotal(res.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])

  const handleToggleStatus = async (user: UserAdmin) => {
    const action = user.isActive ? 'Deactivate' : 'Activate'
    if (!window.confirm(`${action} user ${user.name}?`)) return
    try {
      await usersAdminService.toggleStatus(user.id, !user.isActive)
      showToast(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
      load()
    } catch (e) {
      showToast('Failed to change status', '#ef4444')
    }
  }

  const handleResetPassword = async (user: UserAdmin) => {
    if (!window.confirm(`Reset password for ${user.name}? This will invalidate their current password.`)) return
    try {
      const res = await usersAdminService.resetPassword(user.id)
      setCredentials({ name: user.name, email: user.email, defaultPassword: res.defaultPassword })
    } catch (e) {
      showToast('Failed to reset password', '#ef4444')
    }
  }

  return (
    <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, background: 'rgba(10,16,32,0.95)', border: `1px solid ${toast.color}40`, borderRadius: 12, padding: '12px 20px', fontSize: 13, color: toast.color, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>✓ {toast.msg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Platform Users</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total users across all tenants</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'linear-gradient(135deg, rgba(99,179,255,0.2), rgba(56,245,200,0.1))', border: '1px solid rgba(99,179,255,0.35)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 300 }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
        </div>
        {(['', 'super_admin', 'company_admin', 'candidate'] as const).map((s) => (
          <button key={s} onClick={() => setRoleFilter(s)}
            style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', background: roleFilter === s ? 'rgba(99,179,255,0.15)' : 'rgba(255,255,255,0.03)', border: roleFilter === s ? '1px solid rgba(99,179,255,0.3)' : '1px solid rgba(255,255,255,0.07)', color: roleFilter === s ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
            {s === '' ? 'All Roles' : roleLabel[s]}
          </button>
        ))}
        <button onClick={load} style={{ padding: '5px 8px', background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(10,16,32,0.6)', border: '1px solid rgba(99,179,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(99,179,255,0.06)' }}>
              {['User', 'Role', 'Company', 'Status', 'Last Login', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} style={{ padding: '16px' }}><div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} /></td>
                ))}
              </tr>
            )) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No users found.
              </td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: u.isActive ? 1 : 0.6 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,179,255,0.2), rgba(167,139,250,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={roleColor[u.role] || 'gray'}>{roleLabel[u.role] || u.role}</Badge>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {u.company ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Building2 size={13} style={{ color: 'var(--text-muted)' }} /> {u.company.name}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Suspended'}</Badge>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingUser(u)} title="Edit Details"
                      style={{ padding: '6px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleResetPassword(u)} title="Reset Password"
                      style={{ padding: '6px', background: 'none', border: '1px solid rgba(99,179,255,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--accent-blue)' }}>
                      <Key size={13} />
                    </button>
                    <button onClick={() => handleToggleStatus(u)} title={u.isActive ? "Deactivate" : "Activate"}
                      style={{ padding: '6px', background: 'none', border: `1px solid rgba(${u.isActive ? '239,68,68' : '16,185,129'},0.2)`, borderRadius: 8, cursor: 'pointer', color: u.isActive ? '#ef4444' : '#10b981' }}>
                      {u.isActive ? <ShieldOff size={13} /> : <Shield size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={total}
        itemsPerPage={20}
        onPageChange={(p) => setPage(p)}
      />

      {/* Modals */}
      {(showAdd || editingUser) && (
        <UserFormModal
          user={editingUser}
          onClose={() => { setShowAdd(false); setEditingUser(null) }}
          onSaved={(result) => {
            setShowAdd(false)
            setEditingUser(null)
            load()
            if (result && result.defaultPassword) {
              setCredentials(result as any)
            } else {
              showToast('User saved successfully')
            }
          }}
        />
      )}

      {credentials && (
        <UserCredentialModal
          name={credentials.name}
          email={credentials.email}
          password={credentials.defaultPassword}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  )
}
