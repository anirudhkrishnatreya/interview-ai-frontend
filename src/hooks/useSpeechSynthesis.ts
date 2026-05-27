import { useCallback } from 'react'
import { SPEECH_CONFIG } from '../utils/agentConfig'

export function useSpeechSynthesis() {
  const speak = useCallback((text: string, { onEnd }: { onEnd?: () => void } = {}) => {
    if (!window.speechSynthesis) { onEnd?.(); return }
    window.speechSynthesis.cancel()

    // Safety timeout in case speech synthesis is blocked, fails or hangs
    let fired = false
    const handleEnd = () => {
      if (fired) return
      fired = true
      clearTimeout(timeoutId)
      onEnd?.()
    }

    // Average reading speed is ~15-20 characters per second.
    // Let's allow a very generous buffer (e.g., 5 characters per second, plus a flat 6-second baseline)
    const safetyDuration = (text.length / 5) * 1000 + 6000
    const timeoutId = setTimeout(() => {
      console.warn('Speech synthesis onend timed out. Triggering fallback.')
      window.speechSynthesis.cancel()
      handleEnd()
    }, safetyDuration)

    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = SPEECH_CONFIG.synthesis.rate
    utter.pitch = SPEECH_CONFIG.synthesis.pitch
    utter.volume = SPEECH_CONFIG.synthesis.volume

    const voices = window.speechSynthesis.getVoices()
    const preferred = SPEECH_CONFIG.synthesis.preferredVoices
    const match = voices.find((v) => preferred.some((p) => v.name.includes(p)))
    if (match) utter.voice = match

    utter.onend = handleEnd
    utter.onerror = (err) => {
      console.warn('Speech synthesis utter error:', err)
      handleEnd()
    }

    window.speechSynthesis.speak(utter)
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, stopSpeaking }
}
