import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useInterviewAdminStore } from '../../../store/interviewAdminStore'
import { interviewTemplatesService, aiService } from '../../../services/interviewTemplates'
import { Step1Details } from './wizard/Step1Details'
import { Step2Skills } from './wizard/Step2Skills'
import { Step3Questions } from './wizard/Step3Questions'
import { Step4Difficulty } from './wizard/Step4Difficulty'
import { Step5Rules } from './wizard/Step5Rules'
import { Step6Review } from './wizard/Step6Review'

const STEPS = [
  { label: 'Details', short: '1' },
  { label: 'Skills', short: '2' },
  { label: 'Questions', short: '3' },
  { label: 'Difficulty', short: '4' },
  { label: 'Rules', short: '5' },
  { label: 'Review', short: '6' },
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateInterviewWizard({ onClose, onCreated }: Props) {
  const store = useInterviewAdminStore()
  const { currentStep, draft, nextStep, prevStep } = store
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    setError(null)
    // Step 1 validation
    if (currentStep === 0) {
      const { title, role } = draft.step1
      if (!title.trim() || !role.trim()) {
        setError('Interview title and role are required.')
        return
      }
    }
    nextStep()
  }

  const handleCreate = async () => {
    store.setSaving(true)
    setError(null)
    try {
      await interviewTemplatesService.create({
        ...draft.step1,
        topics: draft.topics,
        questions: draft.questions,
        questionMode: draft.questionMode,
        difficulty: draft.difficulty,
        rules: draft.rules,
        status: 'active',
      })
      store.resetWizard()
      onCreated()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create interview. Please try again.')
      store.setSaving(false)
    }
  }

  const isLast = currentStep === 5

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 800, maxHeight: '95vh',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 24,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-surface)'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Create Interview
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '16px 28px 0', display: 'flex', gap: 8, flexShrink: 0, background: 'var(--bg-card)' }}>
          {STEPS.map((step, i) => {
            const isActive = i === currentStep
            const isDone = i < currentStep
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--success)' : isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: isDone ? '1.5px solid var(--success)' : isActive ? '1.5px solid var(--border-strong)' : '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: isDone ? '#fff' : isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {isDone ? <Check size={13} /> : step.short}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: isDone ? 'var(--success)' : 'var(--border)', opacity: isDone ? 0.3 : 1 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', background: 'var(--bg-card)' }}>
          {error && (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--danger)',
              borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--danger)', marginBottom: 16,
            }}>
              ⚠ {error}
            </div>
          )}

          {currentStep === 0 && <Step1Details />}
          {currentStep === 1 && <Step2Skills />}
          {currentStep === 2 && <Step3Questions />}
          {currentStep === 3 && <Step4Difficulty />}
          {currentStep === 4 && <Step5Rules />}
          {currentStep === 5 && <Step6Review />}
        </div>

        {/* Footer nav */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-surface)'
        }}>
          <button
            onClick={prevStep} disabled={currentStep === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 18px', fontSize: 13, color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={15} /> Back
          </button>

          {isLast ? (
            <button
              onClick={handleCreate} disabled={store.isSaving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--accent-blue)',
                border: 'none', borderRadius: 10,
                padding: '10px 24px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
                color: '#fff', cursor: store.isSaving ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {store.isSaving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Check size={14} /> Create Interview</>}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600,
                color: 'var(--accent-blue)', cursor: 'pointer',
              }}
            >
              Next <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
