import { useCallback, useEffect, useRef, useState } from 'react'
import { useInterviewStore } from '../store/interviewStore'
import type { ProctoringViolation } from '../store/interviewStore'

interface ProctoringOptions {
  onViolation?: (v: ProctoringViolation) => void
  onTerminate?: () => void
  enabled?: boolean
}

export function useProctoring({ onViolation, onTerminate, enabled = true }: ProctoringOptions = {}) {
  const addViolation = useInterviewStore((s) => s.addViolation)
  const violations = useInterviewStore((s) => s.violations)
  const riskScore = useInterviewStore((s) => s.riskScore)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceDetectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [faceStatus, setFaceStatus] = useState<'ok' | 'no_face' | 'multiple_faces'>('ok')
  const [tabViolations, setTabViolations] = useState(0)
  const violationCountRef = useRef(0)

  const recordViolation = useCallback(
    (type: ProctoringViolation['type'], severity: ProctoringViolation['severity'], details: string) => {
      const v: ProctoringViolation = { type, timestamp: new Date(), severity, details }
      addViolation(v)
      onViolation?.(v)
      violationCountRef.current += 1

      if (violationCountRef.current >= 5) {
        onTerminate?.()
      }
    },
    [addViolation, onViolation, onTerminate]
  )

  // ── Camera + face detection ─────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!enabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }

      // Simple face detection via canvas pixel analysis (no external lib required)
      faceDetectionIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.drawImage(videoRef.current, 0, 0, 320, 240)
        // In production: integrate face-api.js or TensorFlow.js BlazeFace
        // For now, simulate detection state
      }, 3000)
    } catch (err) {
      console.warn('Camera access denied:', err)
      setCameraActive(false)
    }
  }, [enabled])

  const stopCamera = useCallback(() => {
    if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  // ── Tab / window focus monitoring ───────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabViolations((n) => n + 1)
        recordViolation('tab_switch', 'high', 'Candidate switched or minimized the browser tab')
      }
    }

    const handleBlur = () => {
      recordViolation('window_blur', 'medium', 'Browser window lost focus')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enabled, recordViolation])

  // ── Fullscreen enforcement ──────────────────────────────────────────────────
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen()
  }, [])

  useEffect(() => {
    if (!enabled) return
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen_exit', 'medium', 'Candidate exited fullscreen mode')
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [enabled, recordViolation])

  // ── Right-click & copy prevention ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('copy', prevent)
    document.addEventListener('paste', prevent)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('copy', prevent)
      document.removeEventListener('paste', prevent)
    }
  }, [enabled])

  return {
    videoRef,
    canvasRef,
    cameraActive,
    faceStatus,
    tabViolations,
    violations,
    riskScore,
    startCamera,
    stopCamera,
    requestFullscreen,
    recordViolation,
  }
}
