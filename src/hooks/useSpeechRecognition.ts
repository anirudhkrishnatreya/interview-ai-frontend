import { useRef, useState, useCallback, useEffect } from 'react'
import { SPEECH_CONFIG } from '../utils/agentConfig'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  type SpeechRecognition = any
  type SpeechRecognitionEvent = any
  type SpeechRecognitionErrorEvent = any
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
}

export function useSpeechRecognition({ onFinalTranscript, onInterimTranscript }: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(() => Boolean(SpeechRecognitionAPI))
  const [interimText, setInterimText] = useState('')
  const accumulatedRef = useRef('')

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stopListening = useCallback(() => {
    clearSilenceTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [clearSilenceTimer])

  const startListening = useCallback(() => {
    if (!isSupported || !SpeechRecognitionAPI) return
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
    }

    const rec = new SpeechRecognitionAPI()
    rec.continuous = true
    rec.interimResults = SPEECH_CONFIG.recognition.interimResults
    rec.lang = SPEECH_CONFIG.recognition.lang
    recognitionRef.current = rec
    accumulatedRef.current = ''

    rec.onstart = () => {
      setIsListening(true)
      setInterimText('')
    }

    rec.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer()
      let interim = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalChunk += transcript + ' '
        } else {
          interim += transcript
        }
      }

      if (finalChunk) accumulatedRef.current += finalChunk
      const displayText = accumulatedRef.current + interim
      setInterimText(displayText)
      onInterimTranscript?.(displayText)

      silenceTimerRef.current = setTimeout(() => {
        const final = accumulatedRef.current.trim() || interim.trim()
        if (final) {
          rec.stop()
          onFinalTranscript(final)
        }
      }, SPEECH_CONFIG.recognition.silenceTimeout)
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      console.warn('Speech recognition error:', event.error)
      setIsListening(false)
    }

    rec.onend = () => {
      clearSilenceTimer()
      setIsListening(false)
      setInterimText('')
    }

    rec.start()
  }, [isSupported, onFinalTranscript, onInterimTranscript, clearSilenceTimer])

  useEffect(() => {
    return () => {
      clearSilenceTimer()
      try { recognitionRef.current?.abort() } catch (_) {}
    }
  }, [clearSilenceTimer])

  return { startListening, stopListening, isListening, isSupported, interimText }
}
