import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Video, Users, BarChart3,
  Shield, Settings, Plus, FileText, Zap, Search,
  Brain, Download
} from 'lucide-react'
import { Sidebar } from '../../components/shared/Sidebar'
import { StatCard, Card, Badge, Table, Button, Modal, ScoreRing } from '../../components/ui'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { InterviewsListPage } from './interviews/InterviewsListPage'
import { CandidatesListPage } from './candidates/CandidatesListPage'
import { ReportsPage } from './reports/ReportsPage'

import { candidateProfilesService } from '../../services/candidateProfiles'
import { interviewTemplatesService } from '../../services/interviewTemplates'
import { interviewsService } from '../../services/interviews'

const DEMO_EMAIL = 'demo-company-admin@easyhiring.com'

const navItems = [
  { label: 'Dashboard', path: '/company-admin', icon: <LayoutDashboard size={16} /> },
  { label: 'Interviews', path: '/company-admin/interviews', icon: <Video size={16} />, badge: 12 },
  { label: 'Candidates', path: '/company-admin/candidates', icon: <Users size={16} /> },
  { label: 'Analytics', path: '/company-admin/analytics', icon: <BarChart3 size={16} /> },
  { label: 'Proctoring', path: '/company-admin/proctoring', icon: <Shield size={16} /> },
  // { label: 'AI Settings', path: '/company-admin/ai', icon: <Brain size={16} /> },
  { label: 'Reports', path: '/company-admin/reports', icon: <FileText size={16} /> },
  { label: 'Settings', path: '/company-admin/settings', icon: <Settings size={16} /> },
]

const trendData = [
  { day: 'Mon', interviews: 8, hired: 3 },
  { day: 'Tue', interviews: 12, hired: 5 },
  { day: 'Wed', interviews: 7, hired: 2 },
  { day: 'Thu', interviews: 15, hired: 7 },
  { day: 'Fri', interviews: 18, hired: 8 },
  { day: 'Sat', interviews: 4, hired: 1 },
  { day: 'Sun', interviews: 6, hired: 2 },
]

const scoreDistribution = [
  { name: 'HIRE (7.5+)', value: 38, color: '#10b981' },
  { name: 'CONSIDER (5.5–7.5)', value: 31, color: '#f59e0b' },
  { name: 'FAIL (<5.5)', value: 31, color: '#ef4444' },
]

const candidatesData = [
  { name: 'Priya Mehta', role: 'Frontend Engineer', score: 8.4, status: 'hire', violations: 0, date: 'Feb 21' },
  { name: 'Rahul Gupta', role: 'Data Scientist', score: 7.1, status: 'consider', violations: 2, date: 'Feb 20' },
  { name: 'Akash Patel', role: 'DevOps Engineer', score: 5.2, status: 'pass', violations: 0, date: 'Feb 20' },
  { name: 'Divya Nair', role: 'Product Manager', score: 9.1, status: 'hire', violations: 0, date: 'Feb 19' },
  { name: 'Kiran Shah', role: 'Backend Engineer', score: 6.8, status: 'consider', violations: 5, date: 'Feb 19' },
]

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
  hire: 'green', consider: 'yellow', pass: 'red', completed: 'green', invited: 'blue', pending: 'gray', started: 'yellow',
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 32px', textAlign: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const isDemo = user?.email === DEMO_EMAIL

  // Real data state
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalCandidates: 0,
    completedInterviews: 0,
    avgScore: 0,
    violations: 0,
  })
  const [recentCandidates, setRecentCandidates] = useState<any[]>([])
  const [scoreDist, setScoreDist] = useState<any[]>([])
  const [loading, setLoading] = useState(!isDemo)

  useEffect(() => {
    if (isDemo) return

    async function loadDashboardData() {
      try {
        const [templatesRes, candidatesRes, reportsRes] = await Promise.all([
          interviewTemplatesService.list({ page: 1, limit: 100 }),
          candidateProfilesService.list({ page: 1, limit: 100 }),
          interviewsService.list({ page: 1, limit: 100 }),
        ])

        const totalTemplates = templatesRes.total || templatesRes.data?.length || 0
        const totalCand = candidatesRes.total || candidatesRes.data?.length || 0
        const reports = reportsRes.data || []
        
        const completed = reports.length
        const totalScore = reports.reduce((sum: number, r: any) => sum + (r.overallScore || 0), 0)
        const avg = completed ? totalScore / completed : 0
        const highRisk = reports.filter((r: any) => r.riskScore >= 60).length

        setStats({
          totalInterviews: totalTemplates,
          totalCandidates: totalCand,
          completedInterviews: completed,
          avgScore: avg,
          violations: highRisk,
        })

        // Compute score distribution
        const hireCount = reports.filter((r: any) => r.recommendation === 'HIRE').length
        const considerCount = reports.filter((r: any) => r.recommendation === 'CONSIDER').length
        const passCount = reports.filter((r: any) => r.recommendation === 'FAIL').length
        
        const totalDecisions = hireCount + considerCount + passCount
        const dist = totalDecisions ? [
          { name: 'HIRE (7.5+)', value: Math.round((hireCount / totalDecisions) * 100), color: '#10b981' },
          { name: 'CONSIDER (5.5–7.5)', value: Math.round((considerCount / totalDecisions) * 100), color: '#f59e0b' },
          { name: 'FAIL (<5.5)', value: Math.round((passCount / totalDecisions) * 100), color: '#ef4444' },
        ] : []
        setScoreDist(dist)

        // Map candidates to table structure
        const mapped = candidatesRes.data.slice(0, 5).map((c: any) => {
          const report = reports.find((r: any) => r.candidateName === c.name)
          return {
            name: c.name,
            role: c.position || 'Software Engineer',
            score: report ? report.overallScore : 0,
            status: report ? report.recommendation?.toLowerCase() : c.status?.toLowerCase() || 'invited',
            violations: report ? report.violationCount || 0 : 0,
            date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }
        })
        setRecentCandidates(mapped)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [isDemo])

  const showScoreDist = isDemo ? scoreDistribution : scoreDist

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '32px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {user?.companyName || 'Company'} Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Recruitment analytics &amp; interview management</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
            <div style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent-blue)', width: 32, height: 32, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading dashboard...</p>
          </div>
        </Card>
      ) : !isDemo && stats.totalInterviews === 0 && stats.totalCandidates === 0 ? (
        <Card>
          <EmptyState
            title="No data yet"
            desc="Your dashboard will populate once you create interviews and invite candidates."
          />
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            <StatCard label="Total Interviews" value={isDemo ? "342" : stats.totalInterviews} sub="All active templates" color="var(--accent-blue)" icon={<Video size={24} />} />
            <StatCard label="Total Candidates" value={isDemo ? "38%" : stats.totalCandidates} sub={isDemo ? "↑ 4% vs last month" : "In recruitment pipeline"} color="#10b981" icon={<Zap size={24} />} />
            <StatCard label="Avg Score" value={isDemo ? "6.8" : stats.avgScore.toFixed(1)} sub="Out of 10 average" color="var(--accent-cyan)" icon={<BarChart3 size={24} />} />
            <StatCard label="Completed Sessions" value={isDemo ? "12" : stats.completedInterviews} sub="AI reports compiled" color="#f59e0b" icon={<FileText size={24} />} />
            <StatCard label="High Risk Flags" value={isDemo ? "23" : stats.violations} sub="Integrity reports" color="var(--danger)" icon={<Shield size={24} />} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isDemo ? '1fr 320px' : showScoreDist.length > 0 ? '1fr 320px' : '1fr', gap: 20 }}>
            {isDemo && (
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                  Interview Activity
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="greenG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="interviews" stroke="#4f46e5" strokeWidth={2} fill="url(#blueG)" name="Interviews" />
                    <Area type="monotone" dataKey="hired" stroke="#10b981" strokeWidth={2} fill="url(#greenG)" name="Hired" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {!isDemo && (
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                  Quick Overview
                </h3>
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                  Your recruitment channel is active. View your detailed reports and logs using the left navigation menu.
                </div>
              </Card>
            )}

            {showScoreDist.length > 0 && (
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                  Score Distribution
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={showScoreDist} cx="50%" cy="50%" innerRadius={44} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {showScoreDist.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {showScoreDist.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-muted)', flex: 1 }}>{d.name}</span>
                      <span style={{ color: d.color, fontWeight: 700 }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {(isDemo ? candidatesData : recentCandidates).length > 0 && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>Recent Candidates</h3>
              </div>
              <Table
                data={isDemo ? candidatesData : recentCandidates}
                columns={[
                  { key: 'name', header: 'Candidate' },
                  { key: 'role', header: 'Role' },
                  { key: 'score', header: 'Score', render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ScoreRing score={r.score} size={36} /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.score}/10</span></div> },
                  { key: 'status', header: 'Recommendation', render: (r) => <Badge variant={statusVariant[r.status] || 'gray'}>{r.status.toUpperCase()}</Badge> },
                  { key: 'violations', header: 'Violations', render: (r) => <span style={{ color: r.violations > 3 ? '#ef4444' : r.violations > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: r.violations > 0 ? 600 : 400 }}>{r.violations}</span> },
                  { key: 'date', header: 'Date' },
                ]}
              />
            </Card>
          )}
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Interview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>JOB TITLE</label>
            <input className="input-dark" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>DEPARTMENT</label>
            <input className="input-dark" placeholder="e.g. Engineering" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NUMBER OF QUESTIONS</label>
            <input className="input-dark" type="number" defaultValue={6} min={3} max={15} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1" onClick={() => setCreateOpen(false)}>Create Interview</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProctoringPage() {
  const { user } = useAuthStore()
  const isDemo = user?.email === DEMO_EMAIL

  // Real data state
  const [proctoringSessions, setProctoringSessions] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeCount: 0,
    violationsCount: 0,
    highRiskCount: 0,
    cleanRate: 100,
  })
  const [loading, setLoading] = useState(!isDemo)

  useEffect(() => {
    if (isDemo) return

    async function loadProctoringData() {
      try {
        const reportsRes = await interviewsService.list({ page: 1, limit: 100 })
        const reports = reportsRes.data || []

        const completed = reports.length
        const highRisk = reports.filter((r: any) => r.riskScore >= 60)
        const medRisk = reports.filter((r: any) => r.riskScore >= 25 && r.riskScore < 60)
        const cleanCount = reports.filter((r: any) => r.riskScore < 25).length

        const totalViolations = reports.reduce((sum: number, r: any) => sum + (r.violationCount || 0), 0)
        const rate = completed ? Math.round((cleanCount / completed) * 100) : 100

        setStats({
          activeCount: 0,
          violationsCount: totalViolations,
          highRiskCount: highRisk.length,
          cleanRate: rate,
        })

        const mapped = reports.map((r: any) => ({
          name: r.candidateName,
          role: r.role,
          violations: r.violationCount || 0,
          riskScore: r.riskScore || 0,
          date: new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }))
        setProctoringSessions(mapped)
      } catch (err) {
        console.error('Failed to load proctoring data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProctoringData()
  }, [isDemo])

  return (
    <div style={{ padding: '32px 28px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Proctoring Center</h1>

      {loading ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
            <div style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent-blue)', width: 32, height: 32, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading proctoring data...</p>
          </div>
        </Card>
      ) : !isDemo && proctoringSessions.length === 0 ? (
        <Card>
          <EmptyState
            title="No proctoring sessions yet"
            desc="Proctoring data will appear here once candidates start taking interviews."
          />
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Active Sessions" value={isDemo ? "8" : stats.activeCount} sub="Being monitored" color="var(--accent-cyan)" />
            <StatCard label="Violations Today" value={isDemo ? "14" : stats.violationsCount} sub="Total across sessions" color="var(--warning)" />
            <StatCard label="High Risk" value={isDemo ? "2" : stats.highRiskCount} sub="Require review" color="var(--danger)" />
            <StatCard label="Clean Sessions" value={isDemo ? "87%" : `${stats.cleanRate}%`} sub="No major violations" color="#10b981" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
            {(isDemo ? candidatesData : proctoringSessions).map((c, i) => {
              const risk = isDemo ? c.violations : c.riskScore
              const violationsCount = isDemo ? c.violations : c.violations
              return (
                <Card key={i} hover>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.role}</div>
                    </div>
                    <Badge variant={risk >= 60 ? 'red' : risk >= 25 ? 'yellow' : 'green'}>
                      {risk >= 60 ? 'HIGH RISK' : risk >= 25 ? 'MEDIUM' : 'CLEAN'}
                    </Badge>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>INTEGRITY SCORE</div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${100 - risk}%`, background: risk >= 60 ? '#ef4444' : risk >= 25 ? '#f59e0b' : '#10b981', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                      {violationsCount} violation(s) · {c.date}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function CompanyAdminLayout() {
  const { user } = useAuthStore()
  const [templateCount, setTemplateCount] = useState<number | undefined>(undefined)

  useEffect(() => {
    interviewTemplatesService.list({ page: 1, limit: 1 })
      .then((res) => {
        setTemplateCount(res.total)
      })
      .catch((err) => {
        console.warn('Failed to load template count for sidebar:', err)
      })
  }, [])

  const dynamicNavItems = React.useMemo(() => {
    return navItems.map((item) => {
      if (item.label === 'Interviews') {
        return { ...item, badge: templateCount && templateCount > 0 ? templateCount : undefined }
      }
      return item
    })
  }, [templateCount])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Sidebar navItems={dynamicNavItems} title="Company Admin" subtitle={user?.companyName || 'Company'} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="interviews/*" element={<InterviewsListPage />} />
          <Route path="candidates/*" element={<CandidatesListPage />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="proctoring" element={<ProctoringPage />} />
          <Route path="ai" element={<Dashboard />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/company-admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
