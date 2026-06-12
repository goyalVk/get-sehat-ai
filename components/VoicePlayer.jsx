'use client'
import { useState, useEffect, useRef } from 'react'

export default function VoicePlayer({ report, result }) {
  const [isPlaying, setIsPlaying, ] = useState(false)
  const [isPaused, setIsPaused]     = useState(false)
  const [supported, setSupported]   = useState(false)
  const [speed, setSpeed] = useState(0.85)
  const utteranceRef = useRef(null)

  useEffect(() => {
    setSupported('speechSynthesis' in window)

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  const buildScript = () => {
    const lines = []

    // 1. Greeting
    const name = report?.patient?.name
    const reportType = result?.report_type || 'Medical Report'
    if (name) {
      lines.push(`${name} ji, aapki ${reportType} report ka result sun rahe hain.`)
    } else {
      lines.push(`Aapki ${reportType} report ka result sun rahe hain.`)
    }

    // 2. Urgent flags
    if (result?.urgent_flags?.length > 0) {
      lines.push('Dhyan dein — kuch urgent values hain.')
      result.urgent_flags.forEach(flag => {
        lines.push(flag)
      })
    }

    // 3. Summary
    if (result?.summary && result.summary.length > 20) {
      lines.push('AI Summary.')
      lines.push(result.summary)
    }

    // 4. Abnormal parameters
    const abnormal = result?.parameters?.filter(
      p => p.status && p.status.toLowerCase() !== 'normal'
    ) || []

    if (abnormal.length > 0) {
      lines.push(`${abnormal.length} values normal se alag hain.`)
      abnormal.forEach(p => {
        const statusWord =
          p.status === 'high'     ? 'zyada hai' :
          p.status === 'low'      ? 'kam hai' :
          p.status === 'critical' ? 'bahut urgent hai' : p.status
        lines.push(
          `${p.name} — ${p.value} ${p.unit || ''} — ${statusWord}.`
        )
        if (p.explanation) lines.push(p.explanation)
      })
    }

    // 5. Normal count
    const normalCount = result?.parameters?.filter(
      p => p.status?.toLowerCase() === 'normal'
    ).length || 0
    if (normalCount > 0) {
      lines.push(`Baaki ${normalCount} values normal hain.`)
    }

    // 6. Lifestyle tips
    if (result?.lifestyle?.diet) {
      lines.push('Diet tip.')
      lines.push(result.lifestyle.diet)
    }

    // 7. Closing
    lines.push('Doctor se zaroor milein apni report le kar.')

    return lines.join(' ')
  }

  const handlePlay = () => {
    // Track voice usage
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'voice_report_played', {
        event_category: 'engagement',
        event_label: 'results_page'
      })
    }
    if (!supported) return

    if (isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    window.speechSynthesis.cancel()

    const script = buildScript()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = 'hi-IN'
    utterance.pitch = 1
    utterance.volume = 1

    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi')
    if (hindiVoice) utterance.voice = hindiVoice
    utterance.rate = speed

    utterance.onstart  = () => { setIsPlaying(true);  setIsPaused(false) }
    utterance.onend    = () => { setIsPlaying(false); setIsPaused(false) }
    utterance.onerror  = () => { setIsPlaying(false); setIsPaused(false) }
    utterance.onpause  = () => { setIsPaused(true);   setIsPlaying(false) }
    utterance.onresume = () => { setIsPaused(false);  setIsPlaying(true)  }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  if (!supported) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
      border: '1.5px solid #99f6e4',
      borderRadius: 16,
      padding: '16px 20px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🔊</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#134e4a', margin: 0 }}>
            Report Sunein
          </p>
          <p style={{ fontSize: 12, color: '#0d9488', margin: 0 }}>
            {isPlaying ? 'Bol raha hai...' : isPaused ? 'Ruka hua hai' : 'Poori report Hindi mein sunein'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!isPlaying && !isPaused && (
          <button onClick={handlePlay} style={{
            background: '#0d9488', color: 'white',
            border: 'none', borderRadius: 10,
            padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            ▶ Sunein
          </button>
        )}
        {isPlaying && (
          <button onClick={handlePause} style={{
            background: '#f0fdfa', color: '#0d9488',
            border: '1.5px solid #99f6e4', borderRadius: 10,
            padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            ⏸ Roko
          </button>
        )}
        {isPaused && (
          <button onClick={handlePlay} style={{
            background: '#0d9488', color: 'white',
            border: 'none', borderRadius: 10,
            padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            ▶ Jaari Rakho
          </button>
        )}
        {(isPlaying || isPaused) && (
          <button onClick={handleStop} style={{
            background: '#fef2f2', color: '#dc2626',
            border: '1.5px solid #fecaca', borderRadius: 10,
            padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer'
          }}>
            ⏹ Band Karo
          </button>
        )}
      </div>

      {/* Speed Controls */}
      <div style={{
        width: '100%',
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #99f6e4',
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }}>
        {[
          { label: '▶ Normal', value: 0.85 },
          { label: '🐇 Fast',  value: 1.1  },
        ].map(s => (
          <button
            key={s.value}
            onClick={() => { setSpeed(s.value); handleStop() }}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: speed === s.value ? '2px solid #0d9488' : '1.5px solid #99f6e4',
              background: speed === s.value ? '#0d9488' : 'white',
              color: speed === s.value ? 'white' : '#0d9488',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
