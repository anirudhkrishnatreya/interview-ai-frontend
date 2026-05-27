import type { Evaluation } from '../store/interviewStore'

interface ReportData {
  candidateName: string
  role: string
  date: string
  questions: string[]
  answers: string[]
  evaluations: Evaluation[]
  violations?: number
  riskScore?: number
}

export function downloadReport(data: ReportData) {
  const { candidateName, role, date, questions, answers, evaluations, violations = 0, riskScore = 0 } = data

  const avgScore = evaluations.length
    ? evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length
    : 0

  const totalScore = avgScore.toFixed(1)
  const recommendation = avgScore >= 7.5 ? 'HIRE' : avgScore >= 5.5 ? 'CONSIDER' : 'FAIL'
  const recColor = recommendation === 'HIRE' ? '#10b981' : recommendation === 'CONSIDER' ? '#f59e0b' : '#ef4444'
  const recBg = recommendation === 'HIRE' ? '#064e3b' : recommendation === 'CONSIDER' ? '#451a03' : '#450a0a'

  const riskColor = riskScore < 25 ? '#10b981' : riskScore < 60 ? '#f59e0b' : '#ef4444'
  const integrityLabel = riskScore < 25 ? 'HIGH INTEGRITY' : riskScore < 60 ? 'MODERATE RISK' : 'HIGH RISK'

  const questionsHTML = questions
    .map((q, i) => {
      const ev = evaluations[i] || {}
      const ans = answers[i] || 'No answer provided.'
      const scoreColor = (ev.score || 0) >= 7 ? '#10b981' : (ev.score || 0) >= 5 ? '#f59e0b' : '#ef4444'
      return `
      <div class="question-card">
        <div class="question-header">
          <span class="question-num">Q${i + 1}</span>
          <span class="question-score" style="color:${scoreColor}">${ev.score || '—'} / 10</span>
        </div>
        <p class="question-text">${q}</p>
        <div class="answer-block">
          <div class="answer-label">CANDIDATE ANSWER</div>
          <p class="answer-text">${ans}</p>
        </div>
        <div class="eval-grid">
          ${ev.feedback ? `<div class="eval-item"><div class="eval-label">✦ FEEDBACK</div><p>${ev.feedback}</p></div>` : ''}
          ${ev.strength ? `<div class="eval-item strength"><div class="eval-label">↑ STRENGTH</div><p>${ev.strength}</p></div>` : ''}
          ${ev.improvement ? `<div class="eval-item improvement"><div class="eval-label">↗ IMPROVE</div><p>${ev.improvement}</p></div>` : ''}
        </div>
      </div>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Interview Report — ${candidateName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f8fafc;color:#1e293b;padding:40px}
    .wrapper{max-width:820px;margin:0 auto}
    .header{background:#0f172a;color:white;padding:40px;border-radius:16px;margin-bottom:24px}
    .header h1{font-family:'Syne',sans-serif;font-size:28px;font-weight:800}
    .header .sub{color:#94a3b8;font-size:12px;letter-spacing:.06em;margin-top:4px}
    .meta-row{display:flex;gap:32px;margin-top:24px}
    .meta-item label{display:block;font-size:10px;color:#64748b;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
    .meta-item span{font-size:15px;font-weight:600;color:#e2e8f0}
    .score-banner{display:flex;align-items:center;justify-content:space-between;background:#1e293b;padding:24px 32px;border-radius:12px;margin-bottom:16px;flex-wrap:wrap;gap:16px}
    .score-num{font-family:'Syne',sans-serif;font-size:52px;font-weight:800;color:white;line-height:1}
    .score-denom{font-size:20px;color:#64748b}
    .score-label{font-size:11px;color:#64748b;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
    .rec-badge{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;padding:12px 28px;border-radius:40px;background:${recBg};color:${recColor};letter-spacing:.1em}
    .integrity-row{display:flex;align-items:center;gap:16px;background:#1e293b;padding:16px 24px;border-radius:12px;margin-bottom:24px}
    .integrity-label{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${riskColor}}
    .integrity-sub{font-size:12px;color:#64748b;margin-top:2px}
    .risk-bar{flex:1;height:6px;background:#334155;border-radius:4px;overflow:hidden}
    .risk-fill{height:100%;width:${riskScore}%;background:${riskColor};border-radius:4px}
    .question-card{background:white;border-radius:12px;padding:28px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.07);border:1px solid #e2e8f0}
    .question-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .question-num{font-family:'Syne',sans-serif;font-size:12px;font-weight:800;color:#94a3b8;letter-spacing:.1em}
    .question-score{font-family:'Syne',sans-serif;font-size:18px;font-weight:800}
    .question-text{font-size:16px;font-weight:600;color:#1e293b;line-height:1.5;margin-bottom:16px}
    .answer-block{background:#f1f5f9;border-radius:8px;padding:14px 16px;margin-bottom:16px}
    .answer-label{font-size:10px;color:#94a3b8;letter-spacing:.08em;font-weight:600;margin-bottom:6px}
    .answer-text{font-size:14px;color:#475569;line-height:1.6}
    .eval-grid{display:flex;flex-direction:column;gap:10px}
    .eval-item{padding:12px 14px;border-radius:8px;background:#f8fafc;border-left:3px solid #cbd5e1}
    .eval-item.strength{border-left-color:#10b981}
    .eval-item.improvement{border-left-color:#f59e0b}
    .eval-label{font-size:10px;color:#94a3b8;letter-spacing:.08em;font-weight:600;margin-bottom:4px}
    .eval-item p{font-size:13px;color:#475569;line-height:1.5}
    .footer{text-align:center;margin-top:40px;font-size:12px;color:#94a3b8}
    @media print{body{padding:0;background:white}}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${candidateName}</h1>
      <p class="sub">INTERVIEW PERFORMANCE REPORT</p>
      <div class="meta-row">
        <div class="meta-item"><label>Target Role</label><span>${role}</span></div>
        <div class="meta-item"><label>Date</label><span>${date}</span></div>
        <div class="meta-item"><label>Questions</label><span>${questions.length}</span></div>
        <div class="meta-item"><label>Violations</label><span>${violations}</span></div>
      </div>
    </div>
    <div class="score-banner">
      <div>
        <div style="display:flex;align-items:baseline;gap:6px">
          <span class="score-num">${totalScore}</span><span class="score-denom">/ 10</span>
        </div>
        <div class="score-label">Overall Score</div>
      </div>
      <div class="rec-badge">${recommendation}</div>
    </div>
    <div class="integrity-row">
      <div>
        <div class="integrity-label">${integrityLabel}</div>
        <div class="integrity-sub">Risk Score: ${riskScore}/100 · ${violations} violation(s) detected</div>
      </div>
      <div class="risk-bar"><div class="risk-fill"></div></div>
    </div>
    ${questionsHTML}
    <div class="footer">Generated by EasyHiring · Enterprise Platform · ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
  }
}
