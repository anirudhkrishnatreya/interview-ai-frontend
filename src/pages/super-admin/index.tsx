import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, BarChart3,
  Shield, CreditCard, Settings, Flag, Activity, FileText
} from 'lucide-react'
import { Sidebar } from '../../components/shared/Sidebar'
import { StatCard, Card, Badge, Table } from '../../components/ui'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { SuperAdminUsersPage } from './users/SuperAdminUsersPage'

// Only this account sees dummy data
const DEMO_EMAIL = 'superadmin@interviewai.com'

const navItems = [
  { label: 'Overview', path: '/super-admin', icon: <LayoutDashboard size={16} /> },
  { label: 'Companies', path: '/super-admin/companies', icon: <Building2 size={16} />, badge: 47 },
  { label: 'Users', path: '/super-admin/users', icon: <Users size={16} /> },
  { label: 'Analytics', path: '/super-admin/analytics', icon: <BarChart3 size={16} /> },
  { label: 'Security', path: '/super-admin/security', icon: <Shield size={16} /> },
  { label: 'Billing', path: '/super-admin/billing', icon: <CreditCard size={16} /> },
  { label: 'Audit Logs', path: '/super-admin/audit', icon: <FileText size={16} /> },
  { label: 'Feature Flags', path: '/super-admin/flags', icon: <Flag size={16} /> },
  { label: 'Settings', path: '/super-admin/settings', icon: <Settings size={16} /> },
]

const usageData = [
  { month: 'Aug', interviews: 1240, revenue: 38000 },
  { month: 'Sep', interviews: 1680, revenue: 51000 },
  { month: 'Oct', interviews: 2100, revenue: 64000 },
  { month: 'Nov', interviews: 1950, revenue: 59000 },
  { month: 'Dec', interviews: 2400, revenue: 73000 },
  { month: 'Jan', interviews: 3100, revenue: 94000 },
  { month: 'Feb', interviews: 3680, revenue: 112000 },
]

const companiesData = [
  { name: 'TechCorp Inc', plan: 'Enterprise', seats: 500, used: 342, mrr: '$4,800', status: 'active', risk: 'low' },
  { name: 'HireX Global', plan: 'Professional', seats: 100, used: 97, mrr: '$1,200', status: 'active', risk: 'medium' },
  { name: 'RecruitPro', plan: 'Starter', seats: 25, used: 12, mrr: '$299', status: 'trial', risk: 'low' },
  { name: 'TalentBridge', plan: 'Professional', seats: 100, used: 88, mrr: '$1,200', status: 'active', risk: 'low' },
  { name: 'HRIntelligence', plan: 'Enterprise', seats: 1000, used: 621, mrr: '$9,600', status: 'active', risk: 'high' },
]

const statusColor: Record<string, string> = { active: 'green', trial: 'yellow', suspended: 'red' }
const riskColor: Record<string, string> = { low: 'green', medium: 'yellow', high: 'red' }

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

function Overview() {
  const { user } = useAuthStore()
  const isDemo = user?.email === DEMO_EMAIL

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '32px 28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Real-time metrics across all tenants</p>
      </div>

      {isDemo ? (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <StatCard label="Total Companies" value="47" sub="+3 this month" color="var(--accent-blue)" icon={<Building2 size={24} />} />
            <StatCard label="Total Interviews" value="38.4K" sub="↑ 19% vs last month" color="var(--accent-cyan)" icon={<Activity size={24} />} />
            <StatCard label="Monthly Revenue" value="$112K" sub="MRR · ↑ 14%" color="#10b981" icon={<CreditCard size={24} />} />
            <StatCard label="Active Users" value="12,840" sub="Across all tenants" color="var(--accent-violet)" icon={<Users size={24} />} />
            <StatCard label="AI Evaluations" value="94.2%" sub="Completion rate" color="#f59e0b" icon={<BarChart3 size={24} />} />
            <StatCard label="Avg Risk Score" value="18/100" sub="Platform integrity" color="var(--success)" icon={<Shield size={24} />} />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                Monthly Interviews
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="interviews" stroke="#4f46e5" strokeWidth={2} fill="url(#blueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                Revenue (MRR)
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={usageData}>
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Companies table */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
              Top Companies
            </h3>
            <Table
              data={companiesData}
              columns={[
                { key: 'name', header: 'Company' },
                { key: 'plan', header: 'Plan', render: (r) => <Badge variant="blue">{r.plan}</Badge> },
                { key: 'seats', header: 'Seats', render: (r) => `${r.used}/${r.seats}` },
                { key: 'mrr', header: 'MRR' },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusColor[r.status] as any}>{r.status}</Badge> },
                { key: 'risk', header: 'Risk', render: (r) => <Badge variant={riskColor[r.risk] as any}>{r.risk}</Badge> },
              ]}
            />
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState
            title="No platform data yet"
            desc="Stats and charts will appear here as companies join and use the platform."
          />
        </Card>
      )}
    </div>
  )
}

function SecurityPage() {
  const { user } = useAuthStore()
  const isDemo = user?.email === DEMO_EMAIL

  const violations = [
    { company: 'HRIntelligence', type: 'Multiple faces detected', severity: 'high', count: 23, time: '2 min ago' },
    { company: 'TechCorp Inc', type: 'Tab switching', severity: 'medium', count: 8, time: '14 min ago' },
    { company: 'HireX Global', type: 'Fullscreen exit', severity: 'medium', count: 5, time: '1h ago' },
    { company: 'RecruitPro', type: 'No face detected', severity: 'high', count: 3, time: '2h ago' },
  ]

  return (
    <div style={{ padding: '32px 28px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Security Monitor</h1>

      {isDemo ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Active Sessions" value="284" sub="Being monitored" color="var(--accent-cyan)" />
            <StatCard label="Violations Today" value="39" sub="Across all tenants" color="var(--warning)" />
            <StatCard label="Terminated Sessions" value="2" sub="Auto-terminated" color="var(--danger)" />
          </div>
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
              Recent Violations
            </h3>
            <Table
              data={violations}
              columns={[
                { key: 'company', header: 'Company' },
                { key: 'type', header: 'Violation Type' },
                { key: 'severity', header: 'Severity', render: (r) => <Badge variant={r.severity === 'high' ? 'red' : 'yellow'}>{r.severity}</Badge> },
                { key: 'count', header: 'Count', render: (r) => <span style={{ color: r.count > 10 ? '#ef4444' : '#f59e0b' }}>{r.count}</span> },
                { key: 'time', header: 'Last Seen' },
              ]}
            />
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState
            title="No security events yet"
            desc="Violation logs and live session monitoring will appear here once companies run interviews."
          />
        </Card>
      )}
    </div>
  )
}

export default function SuperAdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Sidebar navItems={navItems} title="Super Admin" subtitle="PLATFORM MANAGEMENT" />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="companies" element={<Overview />} />
          <Route path="users" element={<SuperAdminUsersPage />} />
          <Route path="analytics" element={<Overview />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="billing" element={<Overview />} />
          <Route path="audit" element={<Overview />} />
          <Route path="flags" element={<Overview />} />
          <Route path="settings" element={<Overview />} />
          <Route path="*" element={<Navigate to="/super-admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
