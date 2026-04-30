'use client'
import { useState, useEffect } from 'react'

const AI_STEPS = [
  { icon: '🔍', text: 'Report scan ho rahi hai...', duration: 4000 },
  { icon: '🧬', text: 'Values identify ho rahe hain...', duration: 6000 },
  { icon: '📊', text: 'Normal ranges compare ho rahe hain...', duration: 6000 },
  { icon: '🧠', text: 'AI patterns analyze kar raha hai...', duration: 6000 },
  { icon: '🌿', text: 'Ayurvedic suggestions prepare ho rahe hain...', duration: 5000 },
  { icon: '✍️', text: 'Hindi mein explain likh raha hai...', duration: 3000 },
]

const HEALTH_FACTS = [
  { emoji: '🩸', fact: 'Kya aap jaante hain?', detail: 'CBC test mein 20+ values hoti hain — Sehat24 inhe ek ek karke check karta hai.' },
  { emoji: '💧', fact: 'Health tip', detail: 'Roz 8-10 glass paani peeye — kidney aur liver dono ko faayda hota hai.' },
  { emoji: '🧬', fact: 'Interesting fact', detail: 'Hamare blood mein 25 trillion red blood cells hain — roz naye bante hain!' },
  { emoji: '🌿', fact: 'Ayurveda says', detail: 'Amla (Indian gooseberry) mein orange se 20x zyada Vitamin C hota hai.' },
  { emoji: '🫀', fact: 'Dil ki baat', detail: 'Har din hamare dil ek lakh baar se zyada dhadakta hai — bilkul silently.' },
  { emoji: '☀️', fact: 'Vitamin D alert', detail: 'India mein 70%+ log Vitamin D deficient hain — roz 15 min dhoop mein baitho.' },
  { emoji: '🍃', fact: 'Ashwagandha', detail: 'Stress hormones kam karta hai aur energy naturally badhata hai — raat ko lo.' },
  { emoji: '🧪', fact: 'Lab tip', detail: 'Blood test hamesha khali pet karo — 8-12 ghante ka fast zaroori hai accurate results ke liye.' },
  { emoji: '🫁', fact: 'Breathing hack', detail: '4-7-8 technique: 4 sec inhale, 7 sec hold, 8 sec exhale — instantly calm ho jaoge.' },
  { emoji: '🥗', fact: 'Iron ke liye', detail: 'Palak ke saath nimbu squeeze karo — Vitamin C iron absorption 3x badhata hai.' },
]

export default function AnalyzingLoader({ fileName }) {
  const [currentStep, setCurrentStep]   = useState(0)
  const [currentFact, setCurrentFact]   = useState(0)
  const [progress, setProgress]         = useState(0)
  const [stepDone, setStepDone]         = useState([])
  const [factVisible, setFactVisible]   = useState(true)

  // Progress bar — 30 seconds mein 95% tak
  useEffect(() => {
    const totalMs = 30000
    const interval = 200
    const increment = (95 / totalMs) * interval
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { clearInterval(timer); return 95 }
        return prev + increment
      })
    }, interval)
    return () => clearInterval(timer)
  }, [])

  // AI steps cycle
  useEffect(() => {
    let stepIndex = 0
    const runStep = () => {
      if (stepIndex >= AI_STEPS.length) return
      setCurrentStep(stepIndex)
      const timeout = setTimeout(() => {
        setStepDone(prev => [...prev, stepIndex])
        stepIndex++
        runStep()
      }, AI_STEPS[stepIndex].duration)
      return timeout
    }
    const t = runStep()
    return () => clearTimeout(t)
  }, [])

  // Health facts rotate every 5 seconds with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => {
        setCurrentFact(prev => (prev + 1) % HEALTH_FACTS.length)
        setFactVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fact = HEALTH_FACTS[currentFact]

  return (
    <div style={{
      marginTop: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg) }
        }
        @keyframes scanLine {
          0%   { top: 0%;    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%;  opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes progressShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .step-item {
          transition: all 0.3s ease;
        }
        .fact-visible {
          animation: fadeSlideUp 0.4s ease both;
        }
        .fact-hidden {
          animation: fadeSlideDown 0.4s ease both;
        }
      `}</style>

      {/* Report scan visual */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1a1a, #0a2525)',
        borderRadius: 20,
        padding: '24px 20px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(13,148,136,0.3)',
      }}>

        {/* Scan line animation */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
          animation: 'scanLine 2.5s ease-in-out infinite',
          boxShadow: '0 0 12px rgba(45,212,191,0.6)',
          pointerEvents: 'none',
        }} />

        {/* File name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(13,148,136,0.2)',
            border: '1px solid rgba(13,148,136,0.4)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>📋</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: 'white', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 260,
            }}>
              {fileName || 'Aapki report'}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(45,212,191,0.7)', margin: 0 }}>
              AI analyze kar raha hai...
            </p>
          </div>
          {/* Spinning indicator */}
          <div style={{
            marginLeft: 'auto',
            width: 24, height: 24,
            border: '2px solid rgba(13,148,136,0.3)',
            borderTopColor: '#2dd4bf',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
        </div>

        {/* AI Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AI_STEPS.map((step, i) => {
            const isDone    = stepDone.includes(i)
            const isCurrent = currentStep === i && !isDone
            const isFuture  = i > currentStep

            return (
              <div key={i} className="step-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: isFuture ? 0.3 : 1,
                transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
              }}>
                {/* Step indicator */}
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: isDone
                    ? 'rgba(74,222,128,0.2)'
                    : isCurrent
                    ? 'rgba(13,148,136,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: isDone
                    ? '1px solid rgba(74,222,128,0.5)'
                    : isCurrent
                    ? '1px solid rgba(45,212,191,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                  animation: isCurrent ? 'pulse 1.5s ease infinite' : 'none',
                }}>
                  {isDone ? '✓' : step.icon}
                </div>

                <span style={{
                  fontSize: 12,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone
                    ? 'rgba(74,222,128,0.8)'
                    : isCurrent
                    ? '#2dd4bf'
                    : 'rgba(255,255,255,0.3)',
                }}>
                  {step.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            Analyzing...
          </span>
          <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{
          height: 6,
          background: '#f1f5f9',
          borderRadius: 100,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 100,
            background: 'linear-gradient(90deg, #0d9488, #2dd4bf, #0d9488)',
            backgroundSize: '200% auto',
            animation: 'progressShimmer 2s linear infinite',
            transition: 'width 0.2s ease',
          }} />
        </div>
      </div>

      {/* Health Fact Card — rotates every 5 sec */}
      <div style={{
        background: '#f0fdfa',
        border: '1px solid #99f6e4',
        borderRadius: 16,
        padding: '16px 18px',
        minHeight: 90,
        overflow: 'hidden',
      }}>
        <div className={factVisible ? 'fact-visible' : 'fact-hidden'}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{fact.emoji}</span>
            <div>
              <p style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0d9488',
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {fact.fact}
              </p>
              <p style={{
                fontSize: 13,
                color: '#0f4f4f',
                margin: 0,
                lineHeight: 1.6,
                fontWeight: 500,
              }}>
                {fact.detail}
              </p>
            </div>
          </div>
        </div>
        {/* Dots indicator */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginTop: 12,
          justifyContent: 'center',
        }}>
          {HEALTH_FACTS.map((_, i) => (
            <div key={i} style={{
              width: i === currentFact ? 16 : 5,
              height: 5,
              borderRadius: 100,
              background: i === currentFact ? '#0d9488' : '#99f6e4',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Small note */}
      <p style={{
        fontSize: 11,
        color: '#cbd5e1',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 1.6,
      }}>
        Thoda wait karo — complex reports mein thoda zyada time lagta hai 🙏
      </p>

    </div>
  )
}
