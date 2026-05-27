import React, { useState } from 'react'
import { Sparkles, Plus, Trash2, Edit3, ChevronDown, ChevronUp, Loader2, Check, X } from 'lucide-react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'
import { aiService } from '../../../../services/interviewTemplates'
import type { TemplateQuestion } from '../../../../services/interviewTemplates'

const genId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)

const modeLabel: Record<string, { title: string; desc: string }> = {
  ai: { title: 'AI Generated', desc: 'Let AI create all questions based on your topics and difficulty.' },
  manual: { title: 'Manual', desc: 'Write your own questions with expected answers and scoring criteria.' },
  hybrid: { title: 'Hybrid (Recommended)', desc: 'AI generates a base set, then you can edit and add your own.' },
}

const typeColors: Record<string, string> = {
  technical: '#63b3ff',
  behavioral: '#10b981',
  situational: '#f59e0b',
  custom: '#a78bfa',
}

function QuestionCard({ q, index, onEdit, onDelete }: { q: TemplateQuestion; index: number; onEdit: (id: string, data: Partial<TemplateQuestion>) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(q.text)

  const saveEdit = () => { onEdit(q.id, { text }); setEditing(false) }

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,179,255,0.1)', border: '1px solid rgba(99,179,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,179,255,0.2)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: 60 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={saveEdit} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, cursor: 'pointer', color: '#10b981' }}><Check size={13} /></button>
                <button onClick={() => setEditing(false)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>{q.text}</p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${typeColors[q.type] || '#888'}18`, color: typeColors[q.type] || '#888', border: `1px solid ${typeColors[q.type] || '#888'}30`, fontWeight: 600, letterSpacing: '0.05em' }}>
              {q.type?.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {q.difficulty}
            </span>
            {q.source === 'ai' && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>AI</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => setExpanded(!expanded)} style={{ padding: '4px 6px', background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={() => setEditing(true)} style={{ padding: '4px 6px', background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(q.id)} style={{ padding: '4px 6px', background: 'none', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(99,179,255,0.06)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.expectedAnswer && <div><div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>EXPECTED ANSWER</div><p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.expectedAnswer}</p></div>}
          {q.scoringCriteria && <div><div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>SCORING CRITERIA</div><p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.scoringCriteria}</p></div>}
          {q.followupHints && <div><div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>FOLLOW-UP HINTS</div><p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.followupHints}</p></div>}
        </div>
      )}
    </div>
  )
}

function AddCustomQuestion({ onAdd }: { onAdd: (q: Omit<TemplateQuestion, 'id'>) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ text: '', type: 'technical', difficulty: 'medium', expectedAnswer: '', scoringCriteria: '', followupHints: '' })

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(99,179,255,0.15)', borderRadius: 12, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
      <Plus size={14} /> Add Custom Question
    </button>
  )

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,179,255,0.15)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea placeholder="Question text..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: 64 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }}>
          <option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="situational">Situational</option><option value="custom">Custom</option>
        </select>
        <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }}>
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
      </div>
      <input placeholder="Expected answer summary (optional)" value={form.expectedAnswer} onChange={(e) => setForm({ ...form, expectedAnswer: e.target.value })}
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { onAdd({ ...form, source: 'manual', tags: [] } as any); setForm({ text: '', type: 'technical', difficulty: 'medium', expectedAnswer: '', scoringCriteria: '', followupHints: '' }); setOpen(false) }}
          disabled={!form.text.trim()}
          style={{ flex: 1, padding: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, cursor: 'pointer', color: '#10b981', fontSize: 12, fontWeight: 600 }}>
          Add Question
        </button>
        <button onClick={() => setOpen(false)} style={{ padding: '8px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Step3Questions() {
  const store = useInterviewAdminStore()
  const { draft, setQuestionMode, setQuestions, addQuestion, updateQuestion, removeQuestion, isGeneratingQuestions, setGeneratingQuestions } = store

  const handleAiGenerate = async () => {
    setGeneratingQuestions(true)
    try {
      const generated = await aiService.generateInterviewQuestions({
        role: draft.step1.role,
        topics: draft.topics.length ? draft.topics : [draft.step1.role],
        difficulty: draft.difficulty,
        numQuestions: draft.step1.numQuestions,
        interviewType: draft.step1.interviewType,
      })
      const withIds = generated.map((q) => ({ ...q, id: genId() }))
      if (draft.questionMode === 'ai') {
        setQuestions(withIds)
      } else {
        // hybrid: append
        setQuestions([...draft.questions.filter((q) => q.source === 'manual'), ...withIds])
      }
    } catch (e) {
      console.error('Failed to generate questions', e)
    } finally {
      setGeneratingQuestions(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Question Configuration</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choose how interview questions are generated.</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {(['ai', 'manual', 'hybrid'] as const).map((mode) => {
          const isActive = draft.questionMode === mode
          return (
            <button key={mode} onClick={() => setQuestionMode(mode)}
              style={{
                padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                background: isActive ? 'rgba(99,179,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: isActive ? '1px solid rgba(99,179,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', marginBottom: 4 }}>
                {mode === 'hybrid' && '⭐ '}{modeLabel[mode].title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{modeLabel[mode].desc}</div>
            </button>
          )
        })}
      </div>

      {/* AI Generate button */}
      {(draft.questionMode === 'ai' || draft.questionMode === 'hybrid') && (
        <button onClick={handleAiGenerate} disabled={isGeneratingQuestions}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,179,255,0.1))',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, cursor: isGeneratingQuestions ? 'not-allowed' : 'pointer',
          }}>
          {isGeneratingQuestions ? <Loader2 size={16} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} style={{ color: '#a78bfa' }} />}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>
              {isGeneratingQuestions ? 'Generating questions…' : `Generate ${draft.step1.numQuestions} AI Questions`}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Based on {draft.topics.length} selected topics · {draft.difficulty} difficulty
            </div>
          </div>
        </button>
      )}

      {/* Questions list */}
      {draft.questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>
            QUESTIONS ({draft.questions.length})
          </div>
          {draft.questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i}
              onEdit={updateQuestion} onDelete={removeQuestion} />
          ))}
        </div>
      )}

      {/* Add custom */}
      {(draft.questionMode === 'manual' || draft.questionMode === 'hybrid') && (
        <AddCustomQuestion onAdd={addQuestion} />
      )}

      {draft.questions.length === 0 && !isGeneratingQuestions && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          No questions yet. {draft.questionMode !== 'manual' ? 'Click "Generate AI Questions" above' : 'Add your first question below'}.
        </div>
      )}
    </div>
  )
}
