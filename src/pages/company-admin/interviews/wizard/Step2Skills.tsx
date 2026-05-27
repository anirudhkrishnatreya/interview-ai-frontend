import React, { useState } from 'react'
import { Sparkles, X, Plus, Loader2, Search } from 'lucide-react'
import { useInterviewAdminStore } from '../../../../store/interviewAdminStore'
import { aiService } from '../../../../services/interviewTemplates'

const PRESET_TOPICS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
  'REST APIs', 'GraphQL', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'System Design', 'DSA', 'Algorithms', 'Data Structures',
  'Machine Learning', 'AWS', 'Docker', 'Kubernetes',
  'CI/CD', 'Git', 'Agile', 'Communication', 'Leadership', 'Problem Solving',
]

export function Step2Skills() {
  const store = useInterviewAdminStore()
  const { draft, addTopic, removeTopic, isGeneratingTopics, setGeneratingTopics } = store
  const [search, setSearch] = useState('')
  const [aiCategories, setAiCategories] = useState<Record<string, string[]>>({})
  const [customInput, setCustomInput] = useState('')

  const handleAiSuggest = async () => {
    setGeneratingTopics(true)
    try {
      const result = await aiService.generateTopics({
        role: draft.step1.role,
        description: draft.step1.description,
        interviewType: draft.step1.interviewType,
      })
      setAiCategories(result.categories)
      // Auto-add all suggested topics
      result.topics.forEach((t) => addTopic(t))
    } catch (e) {
      console.error('Failed to generate topics', e)
    } finally {
      setGeneratingTopics(false)
    }
  }

  const filteredPresets = PRESET_TOPICS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase()) && !draft.topics.includes(t)
  )

  const handleAddCustom = () => {
    if (customInput.trim()) {
      addTopic(customInput.trim())
      setCustomInput('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Skills & Topics
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select topics the interview should cover. You can use AI to auto-suggest based on the role.</p>
      </div>

      {/* AI Suggest Button */}
      <button
        onClick={handleAiSuggest} disabled={!draft.step1.role || isGeneratingTopics}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
          background: isGeneratingTopics ? 'rgba(99,179,255,0.05)' : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,179,255,0.1))',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, cursor: isGeneratingTopics || !draft.step1.role ? 'not-allowed' : 'pointer',
          opacity: !draft.step1.role ? 0.5 : 1, transition: 'all 0.2s',
        }}
      >
        {isGeneratingTopics
          ? <Loader2 size={16} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
          : <Sparkles size={16} style={{ color: '#a78bfa' }} />
        }
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>
            {isGeneratingTopics ? 'AI is thinking…' : 'AI Suggest Topics'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Auto-generate relevant skills for "{draft.step1.role || 'your role'}"
          </div>
        </div>
      </button>

      {/* AI Category Results */}
      {Object.keys(aiCategories).length > 0 && (
        <div style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#a78bfa', letterSpacing: '0.1em', marginBottom: 12 }}>✦ AI SUGGESTIONS</div>
          {Object.entries(aiCategories).map(([cat, topics]) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {topics.map((topic) => (
                  <button key={topic}
                    onClick={() => addTopic(topic)}
                    style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
                      background: draft.topics.includes(topic) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                      border: draft.topics.includes(topic) ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: draft.topics.includes(topic) ? '#a78bfa' : 'var(--text-secondary)',
                    }}
                  >
                    {draft.topics.includes(topic) ? '✓ ' : '+ '}{topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected topics */}
      {draft.topics.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>
            SELECTED TOPICS ({draft.topics.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {draft.topics.map((topic) => (
              <div key={topic} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(99,179,255,0.1)', border: '1px solid rgba(99,179,255,0.25)',
                borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--accent-blue)',
              }}>
                {topic}
                <button onClick={() => removeTopic(topic)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(99,179,255,0.5)' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>OR BROWSE PRESET TOPICS</div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', flex: 1 }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filteredPresets.slice(0, 20).map((topic) => (
            <button key={topic} onClick={() => addTopic(topic)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(99,179,255,0.3)'; (e.target as HTMLButtonElement).style.color = 'var(--accent-blue)' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
            >
              + {topic}
            </button>
          ))}
        </div>

        {/* Custom topic input */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input
            type="text" placeholder="Add custom topic…" value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,179,255,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={handleAddCustom}
            style={{ padding: '8px 14px', background: 'rgba(99,179,255,0.1)', border: '1px solid rgba(99,179,255,0.2)', borderRadius: 10, color: 'var(--accent-blue)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
