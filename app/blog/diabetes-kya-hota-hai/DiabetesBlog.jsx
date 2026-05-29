'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ── Animated counter ── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(to / 40)
    const id = setInterval(() => {
      start = Math.min(start + step, to)
      setVal(start)
      if (start >= to) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [visible, to])
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>
}

/* ── Blood Sugar Gauge ── */
function SugarGauge() {
  const [ref, visible] = useReveal()
  const rows = [
    { label: 'Fasting (khali pet)',       normal: '70–99',    pre: '100–125',    danger: '126+',    unit: 'mg/dL' },
    { label: 'PP (2 hr baad)',            normal: '<140',     pre: '140–199',    danger: '200+',    unit: 'mg/dL' },
    { label: 'HbA1c (3 mahine average)', normal: '<5.6%',    pre: '5.7–6.4%',   danger: '≥6.5%',  unit: '' },
  ]
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.6s ease' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {[['#22c55e', 'Normal — Safe Zone'], ['#f59e0b', 'Prediabetes — Warning'], ['#ef4444', 'Diabetes — Action Needed']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{l}</span>
          </div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{row.label}</div>
          <div style={{ display: 'flex', height: 36, borderRadius: 10, overflow: 'hidden', gap: 2 }}>
            {[
              { bg: '#dcfce7', border: '#22c55e', val: row.normal, color: '#15803d', flex: 3 },
              { bg: '#fef3c7', border: '#f59e0b', val: row.pre,    color: '#92400e', flex: 2.5 },
              { bg: '#fee2e2', border: '#ef4444', val: row.danger, color: '#991b1b', flex: 2 },
            ].map((seg, j) => (
              <div key={j} style={{
                flex: seg.flex, background: seg.bg, border: `1.5px solid ${seg.border}`,
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: seg.color, padding: '0 6px', textAlign: 'center',
                opacity: visible ? 1 : 0,
                transform: visible ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: `all 0.5s ease ${0.1 * i + 0.15 * j}s`,
              }}>
                {seg.val} {row.unit}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Body Animation: Visual inside-body simulation ── */
function BodyAnimation() {
  const [ref, visible] = useReveal()
  const [mode, setMode] = useState('normal')

  const cfg = {
    normal: {
      glucoseN: 5, gColor: '#fbbf24', gBorder: '#f59e0b',
      showInsulin: true, insulinOk: true,
      vesselBg: '#fff7ed', vesselBorder: '#fcd34d',
      panBg: '#f0fdf4', panBorder: '#86efac', panColor: '#15803d',
      panMsg: '✅ Insulin release ho rahi hai',
      cellBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', cellBorder: '#22c55e',
      gateColor: '#22c55e', gateEmoji: '🔓',
      energyIcon: '⚡', energyLabel: 'Energy Banti Hai!', energyColor: '#15803d',
      cellSub: 'Glucose andar → Fuel ready',
      arrowColor: '#22c55e',
      statusBg: '#f0fdf4', statusBorder: '#bbf7d0', statusColor: '#15803d',
      statusText: '✅ Blood sugar normal — glucose cells mein jaata hai, poora body energized rehta hai',
    },
    t2: {
      glucoseN: 12, gColor: '#f97316', gBorder: '#ea580c',
      showInsulin: true, insulinOk: false,
      vesselBg: '#fff1f2', vesselBorder: '#fca5a5',
      panBg: '#fffbeb', panBorder: '#fde68a', panColor: '#d97706',
      panMsg: '⚠️ Insulin banta hai par cells refuse karti hain',
      cellBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', cellBorder: '#94a3b8',
      gateColor: '#ef4444', gateEmoji: '🔒',
      energyIcon: '😢', energyLabel: 'Cell Bhookha Hai', energyColor: '#64748b',
      cellSub: 'Glucose bahar jam gaya',
      arrowColor: '#f59e0b',
      statusBg: '#fff7ed', statusBorder: '#fed7aa', statusColor: '#d97706',
      statusText: '⚠️ Type 2 — Cells insulin ko ignore karti hain. Glucose blood mein jam jaata hai, cells ko koi fuel nahi milta',
    },
    t1: {
      glucoseN: 14, gColor: '#ef4444', gBorder: '#dc2626',
      showInsulin: false, insulinOk: false,
      vesselBg: '#fff1f2', vesselBorder: '#fca5a5',
      panBg: '#fef2f2', panBorder: '#fca5a5', panColor: '#dc2626',
      panMsg: '❌ Immune system ne beta cells destroy kiye — insulin = zero',
      cellBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', cellBorder: '#94a3b8',
      gateColor: '#ef4444', gateEmoji: '🔒',
      energyIcon: '💀', energyLabel: 'Cell Starved Hai', energyColor: '#64748b',
      cellSub: 'Koi key hi nahi — darwaaza band',
      arrowColor: '#ef4444',
      statusBg: '#fff1f2', statusBorder: '#fecdd3', statusColor: '#dc2626',
      statusText: '❌ Type 1 — Pancreas ne insulin banana bilkul band kar diya. Bina injection ke cells ko fuel hi nahi milta',
    },
  }
  const c = cfg[mode]

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <style>{`
        @keyframes dbFlowR {
          0%   { left:-28px; opacity:0; }
          8%   { opacity:1; }
          92%  { opacity:1; }
          100% { left:calc(100% + 28px); opacity:0; }
        }
        @keyframes dbFloatKey {
          0%   { left:2%; opacity:0; }
          10%  { opacity:.9; }
          88%  { opacity:.9; }
          100% { left:91%; opacity:0; }
        }
        @keyframes dbCellGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,.35); }
          50%     { box-shadow:0 0 0 10px rgba(34,197,94,0); }
        }
        @keyframes dbGatePop {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.2); }
        }
        @keyframes dbPanPulse {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.08); }
        }
        @keyframes dbBlock {
          0%,100% { transform:rotate(0deg); }
          25%     { transform:rotate(-8deg); }
          75%     { transform:rotate(8deg); }
        }
      `}</style>

      {/* ── Mode toggle ── */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {[
          { k:'normal', label:'✅ Normal Body',     color:'#0d9488' },
          { k:'t2',     label:'⚠️ Type 2 Diabetes', color:'#d97706' },
          { k:'t1',     label:'🔴 Type 1 Diabetes', color:'#dc2626' },
        ].map(b => (
          <button key={b.k} onClick={() => setMode(b.k)} style={{
            padding:'8px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
            border:`2px solid ${b.color}`,
            background: mode === b.k ? b.color : 'white',
            color: mode === b.k ? 'white' : b.color,
            transition:'all 0.25s ease',
          }}>{b.label}</button>
        ))}
      </div>

      <div style={{ background:'white', border:'1.5px solid #e2e8f0', borderRadius:20, overflow:'hidden' }}>

        {/* Food → bloodstream label */}
        <div style={{ padding:'14px 18px 6px', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:26 }}>🍚</span>
          <div style={{ flex:1, height:3, borderRadius:2, background:`linear-gradient(90deg,${c.gColor},transparent)`, transition:'background 0.4s' }} />
          <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Khaana khate ho → Glucose blood mein</span>
        </div>

        {/* ── BLOOD VESSEL ── */}
        <div style={{ position:'relative', margin:'8px 16px', height:88, background:c.vesselBg, border:`2.5px solid ${c.vesselBorder}`, borderRadius:16, overflow:'hidden', transition:'background 0.4s, border-color 0.4s' }}>
          <span style={{ position:'absolute', top:5, left:10, fontSize:9, fontWeight:800, color:'#ef4444', opacity:.65, letterSpacing:'.08em' }}>BLOOD VESSEL</span>

          {/* Glucose molecules */}
          {Array.from({ length: c.glucoseN }).map((_, i) => (
            <div key={`g${i}`} style={{
              position:'absolute',
              top: 16 + (i % 3) * 22,
              width:22, height:22, borderRadius:'50%',
              background: c.gColor,
              border: `2.5px solid ${c.gBorder}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:8, fontWeight:800, color:'white',
              animation: `dbFlowR ${2.2 + (i % 4) * 0.45}s linear ${i * 0.32}s infinite`,
              zIndex: 2,
              transition: 'background 0.4s, border-color 0.4s',
              boxShadow: `0 0 6px ${c.gColor}88`,
            }}>G</div>
          ))}

          {/* Insulin key molecules */}
          {c.showInsulin && Array.from({ length: 3 }).map((_, i) => (
            <div key={`k${i}`} style={{
              position:'absolute',
              top: 26 + i * 18,
              fontSize:17,
              lineHeight:1,
              animation: `dbFloatKey ${3.4 + i * 0.55}s linear ${i * 1.2}s infinite`,
              opacity: c.insulinOk ? 1 : 0.3,
              filter: c.insulinOk ? 'none' : 'grayscale(1)',
              zIndex: 3,
            }}>🔑</div>
          ))}

          {/* Type 1 overlay — no insulin at all */}
          {mode === 't1' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,.06)', zIndex:8 }}>
              <div style={{ background:'#dc2626', color:'white', fontSize:12, fontWeight:800, padding:'6px 18px', borderRadius:22, letterSpacing:'.04em' }}>
                ❌ Insulin Nahi Banta — Koi Key Nahi
              </div>
            </div>
          )}

          {/* Type 2 badge */}
          {mode === 't2' && (
            <div style={{ position:'absolute', top:6, right:10, background:'rgba(234,88,12,.92)', color:'white', fontSize:10, fontWeight:800, padding:'4px 12px', borderRadius:12, zIndex:8 }}>
              ⚠️ Insulin Resistance — Key Ignored
            </div>
          )}
        </div>

        {/* ── PANCREAS + ARROW + CELL row ── */}
        <div style={{ display:'flex', gap:10, padding:'8px 16px 16px', alignItems:'stretch' }}>

          {/* Pancreas */}
          <div style={{ width:96, background:c.panBg, border:`1.5px solid ${c.panBorder}`, borderRadius:16, padding:'14px 8px', textAlign:'center', flexShrink:0, transition:'all 0.4s' }}>
            <div style={{ fontSize:30, animation: mode==='normal' ? 'dbPanPulse 2s ease-in-out infinite' : 'none' }}>🫁</div>
            <div style={{ fontSize:10, fontWeight:800, color:c.panColor, marginTop:6 }}>Pancreas</div>
            <div style={{ fontSize:9, color:'#64748b', marginTop:4, lineHeight:1.5 }}>{c.panMsg}</div>
          </div>

          {/* Arrow */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, flexShrink:0 }}>
            <div style={{ fontSize:22, color:c.arrowColor, transition:'color 0.4s', animation: mode==='t2'?'dbBlock 1s ease-in-out infinite':'none' }}>
              {mode === 'normal' ? '→' : mode === 't2' ? '↛' : '✕'}
            </div>
            {mode !== 'normal' && (
              <div style={{ fontSize:8, color:'#ef4444', fontWeight:800, textAlign:'center', lineHeight:1.3 }}>
                {mode === 't2' ? 'Blocked' : 'No Key'}
              </div>
            )}
          </div>

          {/* Cell */}
          <div style={{
            flex:1, background:c.cellBg, border:`2.5px solid ${c.cellBorder}`, borderRadius:16, padding:'12px 12px',
            textAlign:'center', transition:'all 0.4s',
            animation: mode==='normal' ? 'dbCellGlow 2s ease-in-out infinite' : 'none',
          }}>
            {/* Receptor gate row */}
            <div style={{ display:'flex', gap:5, justifyContent:'center', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:9, color:'#94a3b8', fontWeight:700 }}>RECEPTORS</span>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  width:22, height:22, borderRadius:6,
                  background: c.gateColor,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12,
                  animation: mode==='normal' ? `dbGatePop 1.6s ease-in-out ${i * 0.3}s infinite` : 'none',
                  transition:'background 0.4s',
                  boxShadow: mode==='normal' ? `0 0 8px ${c.gateColor}55` : 'none',
                }}>{c.gateEmoji}</div>
              ))}
            </div>

            <div style={{ fontSize:30, marginBottom:6 }}>{c.energyIcon}</div>
            <div style={{ fontSize:13, fontWeight:800, color:c.energyColor, marginBottom:3 }}>{c.energyLabel}</div>
            <div style={{ fontSize:10, color:'#94a3b8' }}>{c.cellSub}</div>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div style={{ margin:'0 16px 16px', padding:'11px 16px', background:c.statusBg, border:`1.5px solid ${c.statusBorder}`, borderRadius:12, transition:'all 0.4s' }}>
          <span style={{ fontSize:13, fontWeight:700, color:c.statusColor, lineHeight:1.5 }}>{c.statusText}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Type Cards ── */
function TypeCards() {
  const [ref, visible] = useReveal()
  const types = [
    { emoji: '🧬', title: 'Type 1', tag: 'Autoimmune', tagColor: '#7c3aed', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '#c4b5fd', body: 'Pancreas insulin bilkul nahi banata. Immune system ne beta cells destroy kar diye.', who: '👦 Bachche / Young adults', rev: false },
    { emoji: '🍔', title: 'Type 2', tag: 'Sabse Common', tagColor: '#0d9488', bg: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border: '#5eead4', body: 'Insulin banta hai lekin body use ignore karti hai — insulin resistance.', who: '👨 Adults, overweight, inactive', rev: true },
    { emoji: '🤰', title: 'Gestational', tag: 'Pregnancy mein', tagColor: '#ec4899', bg: 'linear-gradient(135deg,#fdf2f8,#fce7f3)', border: '#f9a8d4', body: 'Pregnancy ke hormones insulin ko block karte hain. Delivery ke baad usually theek.', who: '👩 Pregnant women', rev: false },
    { emoji: '⚠️', title: 'Prediabetes', tag: 'Warning Stage', tagColor: '#d97706', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fcd34d', body: 'Sugar borderline hai. Yeh stage reversible hai — abhi action lo.', who: '🇮🇳 India mein crores log', rev: false },
  ]
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
      {types.map((t, i) => (
        <div key={i} style={{
          background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 18, padding: '20px 18px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>{t.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{t.title}</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: t.tagColor, padding: '2px 8px', borderRadius: 20 }}>{t.tag}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{t.body}</p>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{t.who}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Symptoms Grid ── */
function SymptomsGrid() {
  const [ref, visible] = useReveal()
  const symptoms = [
    { emoji: '🚽', text: 'Baar baar peshab', sub: 'Khaas kar raat mein' },
    { emoji: '💧', text: 'Bahut zyada pyaas', sub: 'Bujhti hi nahi' },
    { emoji: '😴', text: 'Hamesha thakaan', sub: 'Chahe kuch na kiya ho' },
    { emoji: '👁️', text: 'Aankhon mein blur', sub: 'Vision dhundhlata hai' },
    { emoji: '🍽️', text: 'Bahut zyada bhook', sub: 'Khaane ke baad bhi' },
    { emoji: '⚖️', text: 'Achanak weight girana', sub: 'Bina diet ke bhi' },
    { emoji: '🩹', text: 'Ghav dheere bharte hain', sub: 'Chhoti cut bhi' },
    { emoji: '🦶', text: 'Haath-paon sunn', sub: 'Numbness / tingling' },
    { emoji: '🔁', text: 'Baar baar infection', sub: 'Skin, urine, gums' },
    { emoji: '😵', text: 'Chakkar / sar dard', sub: 'Common sign hai' },
  ]
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
      {symptoms.map((s, i) => (
        <div key={i} style={{
          background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '14px 12px',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          transition: `all 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{s.text}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Remedy Cards ── */
function RemedyCards() {
  const [ref, visible] = useReveal()
  const [active, setActive] = useState(null)
  const remedies = [
    { emoji: '🥒', name: 'Karela', how: 'Roz subah khali pet 50-100ml juice', why: 'Polypeptide-p — plant insulin jaise kaam karta hai', color: '#dcfce7', border: '#4ade80', text: '#15803d' },
    { emoji: '🌾', name: 'Methi Dana', how: 'Raat ko bigo do, subah khali pet khao', why: 'Galactomannan — sugar absorption slow karta hai', color: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    { emoji: '🫐', name: 'Jamun Beej', how: 'Beej sukha ke powder — 1 chamach roz', why: 'Jamboline — insulin secretion stimulate karta hai', color: '#ede9fe', border: '#a78bfa', text: '#5b21b6' },
    { emoji: '🌿', name: 'Dalchini', how: 'Half tsp powder chai/paani mein', why: 'MHCP — insulin jaisa glucose absorb karta hai', color: '#fff7ed', border: '#fb923c', text: '#9a3412' },
    { emoji: '🍵', name: 'Tulsi', how: '5-6 patte khali pet roz', why: 'Antioxidants — pancreatic cells protect karta hai', color: '#f0fdf4', border: '#4ade80', text: '#14532d' },
  ]
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {remedies.map((r, i) => (
        <div key={i}
          onClick={() => setActive(active === i ? null : i)}
          style={{
            background: r.color, border: `1.5px solid ${r.border}`, borderRadius: 14,
            padding: '16px 18px', cursor: 'pointer',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-24px)',
            transition: `all 0.4s ease ${i * 0.08}s`,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{r.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: r.text }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#374151' }}>{r.how}</div>
              </div>
            </div>
            <span style={{ fontSize: 18, color: r.text, transform: active === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }}>▾</span>
          </div>
          {active === i && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${r.border}`, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              💡 <strong>Kyun kaam karta hai:</strong> {r.why}
            </div>
          )}
        </div>
      ))}
      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>↑ Kisi bhi nuskhe pe tap karo aur jaano kyun kaam karta hai</p>
    </div>
  )
}

/* ── Do / Don't ── */
function FoodCards() {
  const [ref, visible] = useReveal()
  const eat = [
    { e: '🥬', t: 'Bhindi, karela, palak' },
    { e: '🫘', t: 'Dal, rajma, chana' },
    { e: '🌾', t: 'Oats, daliya, brown rice' },
    { e: '🍏', t: 'Amla, guava, jamun' },
    { e: '🫓', t: 'Whole wheat roti' },
    { e: '🥚', t: 'Eggs, fish, chicken' },
    { e: '🥜', t: 'Badam, akhrot (5 roz)' },
    { e: '🍵', t: 'Green tea (bina sugar)' },
  ]
  const avoid = [
    { e: '🍚', t: 'Zyada white rice' },
    { e: '🍞', t: 'Maida — bread, naan, biscuit' },
    { e: '🥤', t: 'Cold drinks, packaged juice' },
    { e: '🥭', t: 'Mango, banana, grapes' },
    { e: '🍬', t: 'Mithaai, halwa, ladoo' },
    { e: '🍟', t: 'Pakodey, puri, chips' },
    { e: '🍫', t: 'Ultra-processed snacks' },
    { e: '🍺', t: 'Alcohol' },
  ]
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)', transition: 'all 0.5s ease 0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#15803d' }}>Khaao Zaroor</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {eat.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 10px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(-10px)',
              transition: `all 0.35s ease ${0.15 + i * 0.05}s`,
            }}>
              <span style={{ fontSize: 16 }}>{item.e}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>{item.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(20px)', transition: 'all 0.5s ease 0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>❌</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#991b1b' }}>Door Raho</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {avoid.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '8px 10px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(10px)',
              transition: `all 0.35s ease ${0.15 + i * 0.05}s`,
            }}>
              <span style={{ fontSize: 16 }}>{item.e}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Exercise Bars ── */
function ExerciseBars() {
  const [ref, visible] = useReveal()
  const exercises = [
    { icon: '🚶', label: '30 min brisk walk roz', impact: 90, unit: 'HbA1c 0.5–1% kam', color: '#0d9488' },
    { icon: '🍽️', label: 'Khane ke 15 min baad walk', impact: 70, unit: 'Post-meal spike dramatically kam', color: '#0891b2' },
    { icon: '🏋️', label: 'Weight training (3x/week)', impact: 80, unit: 'Muscle glucose uptake badhta hai', color: '#7c3aed' },
    { icon: '🧘', label: 'Yoga / Pranayama roz', impact: 60, unit: 'Insulin sensitivity improve', color: '#ec4899' },
  ]
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {exercises.map((ex, i) => (
        <div key={i} style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(16px)',
          transition: `all 0.4s ease ${i * 0.1}s`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{ex.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ex.label}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{ex.unit}</div>
            </div>
          </div>
          <div style={{ height: 10, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10, background: ex.color,
              width: visible ? `${ex.impact}%` : '0%',
              transition: `width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.15 + 0.2}s`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Warning Signs ── */
function WarningCards() {
  const [ref, visible] = useReveal()
  const urgent = [
    'Fasting sugar 200+ mg/dL',
    'Bahut zyada pyaas + chakkar ek saath',
    'Severe numbness ya burning in feet',
    'Ghav bilkul theek nahi ho raha',
    'Achanak vision change',
    'Chest pain ya breathlessness',
    'Urine mein jhag ya badbu',
  ]
  return (
    <div ref={ref} style={{
      background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '2px solid #fecdd3', borderRadius: 18, padding: '20px 18px',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 26 }}>🚨</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#991b1b' }}>Turant Doctor Ke Paas Jao</div>
          <div style={{ fontSize: 12, color: '#dc2626' }}>Yeh signs ignore mat karo</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {urgent.map((w, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'white', borderRadius: 10, padding: '8px 12px', border: '1px solid #fecdd3',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateX(-12px)',
            transition: `all 0.35s ease ${0.1 + i * 0.07}s`,
          }}>
            <span style={{ color: '#ef4444', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>!</span>
            <span style={{ fontSize: 13, color: '#7f1d1d', fontWeight: 500 }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Cause Column (used in pairs — each needs its own hook calls) ── */
function CauseColumn({ title, color, border, text, icon, items }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      background: color, border: `1.5px solid ${border}`, borderRadius: 16, padding: '16px 14px',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: text }}>{title}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ color: text, fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</span>
          <span style={{ fontSize: 12, color: '#374151' }}>{item}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Section wrapper ── */
function Section({ emoji, title, children, accent = '#0d9488' }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      marginBottom: 40,
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
      transition: 'all 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${accent}22` }}>
        <span style={{ fontSize: 26 }}>{emoji}</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: accent, margin: 0, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ══ MAIN COMPONENT ══ */
export default function DiabetesBlog() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .db-page { font-family:'Plus Jakarta Sans',sans-serif; background:#f8fafc; min-height:100vh; }
        .db-stat { animation: fadeUp 0.6s ease both; }
        .db-stat:nth-child(1){animation-delay:.1s}
        .db-stat:nth-child(2){animation-delay:.2s}
        .db-stat:nth-child(3){animation-delay:.3s}
        @media(max-width:640px){
          .db-hero-h1{font-size:22px!important}
          .db-hero-pad{padding:28px 16px 24px!important}
          .db-body{padding:16px 12px 80px!important}
          .db-card{padding:20px 16px!important}
        }
      `}</style>

      <div className="db-page">
        {/* ── HEADER ── */}
        <div className="db-hero-pad" style={{ background:'linear-gradient(135deg,#f0fdfa,#ecfdf5,#eff6ff)', borderBottom:'1px solid #e2e8f0', padding:'40px 24px 32px' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <Link href="/blog" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#0d9488', textDecoration:'none', fontSize:13, fontWeight:600, marginBottom:16 }}>
              ← Blog
            </Link>

            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(13,148,136,0.1)', border:'1px solid rgba(13,148,136,0.3)', borderRadius:20, padding:'4px 12px', marginBottom:14 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'#0d9488', letterSpacing:'.06em' }}>HEALTH GUIDE — DIABETES</span>
            </div>

            <h1 className="db-hero-h1" style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, fontWeight:400, color:'#0f172a', lineHeight:1.3, marginBottom:14 }}>
              Diabetes Kya Hoti Hai<br />
              <span style={{ background:'linear-gradient(90deg,#0d9488,#0891b2,#0d9488)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 4s linear infinite' }}>
                — Sugar Ki Bimari Ko Samjho
              </span>
            </h1>

            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
              <span style={{ fontSize:13, color:'#64748b' }}>🗓 28 May 2026</span>
              <span style={{ fontSize:13, color:'#64748b' }}>⏱ 7 min</span>
            </div>

            {/* Live stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { num: 10, suffix: 'cr+', label: 'Diabetics India mein', color: '#ef4444', bg: '#fff1f2', border: '#fecdd3' },
                { num: 70,  suffix: '%',   label: 'Log diagnosis se anjaan', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                { num: 46,  suffix: '%',   label: 'Cases reversible hain', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
              ].map((s, i) => (
                <div key={i} className="db-stat" style={{ background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:14, padding:'12px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>
                    <Counter to={s.num} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize:10, color:'#64748b', marginTop:4, fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="db-body" style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px 80px' }}>

          {/* Insulin explainer */}
          <Section emoji="💡" title="Diabetes Kya Hoti Hai — Simple Explanation">
            <div className="db-card" style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', padding:'24px 20px', marginBottom:16 }}>
              <p style={{ fontSize:14, color:'#334155', lineHeight:1.8, marginBottom:16 }}>
                Imagine karo tumhara ghar ek <strong>factory</strong> hai. Glucose (sugar) ek kaccha maal hai jo blood se factory mein jaata hai energy banane ke liye. <strong>Insulin</strong> woh guard hai jo darwaaza kholta hai.
              </p>
              <p style={{ fontSize:14, color:'#334155', lineHeight:1.8, marginBottom:16 }}>
                <strong style={{ color:'#dc2626' }}>Diabetes tab hoti hai jab yeh guard fail ho jaata hai</strong> — insulin ya toh banta hi nahi (Type 1) ya body use sunti nahi (Type 2). Result: Blood mein sugar jam jaati hai, cells bhookhe rehte hain.
              </p>
            </div>
            <BodyAnimation />
          </Section>

          {/* Types */}
          <Section emoji="📊" title="Kitne Types Hoti Hai Diabetes?" accent="#7c3aed">
            <TypeCards />
            <div style={{ marginTop:14, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'12px 16px' }}>
              <p style={{ fontSize:13, color:'#92400e', margin:0 }}>
                💡 <strong>India mein Type 2 sabse common hai</strong> — aur yeh lifestyle se aati hai, isliye lifestyle se hi bahut had tak control bhi hoti hai.
              </p>
            </div>
          </Section>

          {/* Sugar gauge */}
          <Section emoji="🩸" title="Normal Blood Sugar Range Kya Hai?" accent="#0891b2">
            <div className="db-card" style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', padding:'24px 20px' }}>
              <SugarGauge />
              <div style={{ marginTop:16, background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:12, padding:'12px 16px' }}>
                <p style={{ fontSize:13, color:'#0369a1', margin:0 }}>
                  ⚠️ <strong>Yaad rakho:</strong> Sirf ek test se diagnosis nahi hoti — doctor do alag din tests karke confirm karte hain.
                </p>
              </div>
            </div>
          </Section>

          {/* Symptoms */}
          <Section emoji="🤒" title="Diabetes Ke Symptoms Kya Hain?" accent="#dc2626">
            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
              <p style={{ fontSize:13, color:'#9a3412', margin:0 }}>
                ⚠️ <strong>Prediabetes mein koi symptoms nahi hote</strong> — isliye zyada khatarnak hai. Yeh symptoms tab aate hain jab diabetes already ho chuki hai.
              </p>
            </div>
            <SymptomsGrid />
          </Section>

          {/* Causes */}
          <Section emoji="🔍" title="Diabetes Kyun Hoti Hai?" accent="#0d9488">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <CauseColumn title="Lifestyle Wajahein" color="#fff7ed" border="#fed7aa" text="#9a3412" icon="🍔" items={['Zyada meetha aur maida','Zero physical activity','Belly fat — tond','Chronic stress','Neend ki kami','Packaged khaana']} />
              <CauseColumn title="Medical / Genetic" color="#faf5ff" border="#e9d5ff" text="#5b21b6" icon="🧬" items={['Family history — 2-3x risk','PCOS mahilaon mein','Thyroid disorders','High blood pressure','Steroid medicines','Pancreas ki bimari']} />
            </div>
          </Section>

          {/* Remedies */}
          <Section emoji="🌿" title="Ghar Ke Nuskhe — Jo Genuinely Kaam Karte Hain" accent="#16a34a">
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
              <p style={{ fontSize:13, color:'#14532d', margin:0 }}>
                💊 Yeh nuskhe <strong>medicine ke saath kaam karte hain</strong> — medicine ki jagah nahi. Pehle doctor se poochho.
              </p>
            </div>
            <RemedyCards />
          </Section>

          {/* Food */}
          <Section emoji="🍽️" title="Kya Khayein, Kya Na Khayein" accent="#0d9488">
            <FoodCards />
            <div style={{ marginTop:14, background:'#f0fdfa', border:'1px solid #99f6e4', borderRadius:12, padding:'12px 16px' }}>
              <p style={{ fontSize:13, color:'#134e4a', margin:0 }}>
                🥗 <strong>Golden Rule:</strong> Plate ka half hissa sabziyan, quarter protein, quarter carbs — consistently karo.
              </p>
            </div>
          </Section>

          {/* Exercise */}
          <Section emoji="🏃" title="Exercise — Diabetes Ka Sabse Sasta Ilaaj" accent="#0891b2">
            <div className="db-card" style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', padding:'24px 20px', marginBottom:16 }}>
              <p style={{ fontSize:14, color:'#334155', lineHeight:1.8, marginBottom:20 }}>
                Jab muscles kaam karti hain, woh <strong>insulin ke bina bhi</strong> glucose absorb kar leti hain. Exercise ek <strong>natural insulin</strong> hai — aur bilkul free hai.
              </p>
              <ExerciseBars />
            </div>
            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'12px 16px' }}>
              <p style={{ fontSize:13, color:'#9a3412', margin:0 }}>
                ⚠️ Agar sugar 300+ mg/dL hai toh heavy exercise avoid karo — pehle stabilize karo.
              </p>
            </div>
          </Section>

          {/* Ayurvedic */}
          <Section emoji="🕉️" title="Ayurvedic Help — Madhumeha Ka Ilaaj" accent="#7c3aed">
            <div style={{ background:'linear-gradient(135deg,#faf5ff,#ede9fe)', border:'1.5px solid #c4b5fd', borderRadius:18, padding:'20px 18px' }}>
              <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, marginBottom:14 }}>
                Ayurveda mein diabetes ko <strong>"Madhumeha"</strong> kehte hain — yeh Charaka Samhita mein hazar saal se likha hai.
              </p>
              {[
                ['🌱', 'Gurmar', '"Sugar destroyer" — taste receptors pe meethe ka ahsas kam karta hai'],
                ['🌳', 'Vijaysar', 'Wood se bana paani — glucose metabolism improve karta hai'],
                ['🍃', 'Neem', 'Antidiabetic + anti-inflammatory — dono ek saath'],
                ['🍊', 'Amla', 'Vitamin C — pancreatic cells protect karta hai, HbA1c improve karta hai'],
              ].map(([e, name, desc], i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10, padding:'10px 12px', background:'rgba(255,255,255,0.7)', borderRadius:12 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{e}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:'#5b21b6' }}>{name}</div>
                    <div style={{ fontSize:12, color:'#374151' }}>{desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ background:'rgba(239,68,68,0.08)', borderRadius:10, padding:'10px 12px', marginTop:4 }}>
                <p style={{ fontSize:12, color:'#991b1b', margin:0 }}>⚠️ Koi bhi Ayurvedic supplement apni medicine ke saath bina doctor guidance ke mat shuru karo.</p>
              </div>
            </div>
          </Section>

          {/* Warning */}
          <Section emoji="🚨" title="Doctor Kab Milein — Warning Signs" accent="#dc2626">
            <WarningCards />
            <div style={{ marginTop:14, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 16px' }}>
              <p style={{ fontSize:13, color:'#14532d', marginBottom:6, fontWeight:700 }}>Regular check karo agar risk hai:</p>
              {['45 saal ke upar — har saal fasting sugar', 'Overweight ya family history — 30 saal se hi testing', 'PCOS — gynecologist se milke', 'Pregnancy mein — gestational diabetes screening zaroor'].map((r, i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'#166534', marginBottom:4 }}>
                  <span>✅</span><span>{r}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Summary */}
          <Section emoji="📋" title="Summary — Key Points" accent="#0d9488">
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['1️⃣', 'Fasting sugar 126+ ya HbA1c 6.5%+ = diabetes confirmed'],
                ['2️⃣', 'Type 2 lifestyle se aati hai — lifestyle se hi control hoti hai'],
                ['3️⃣', 'Karela, methi, jamun, dalchini genuinely help karte hain — medicine ke saath'],
                ['4️⃣', 'Roz 30 min walk = sabse sasta aur powerful treatment'],
                ['5️⃣', 'Prediabetes mein koi symptoms nahi — regular testing zaroori'],
                ['6️⃣', 'Doctor + nutritionist dono ki guidance lo'],
              ].map(([num, text], i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'white', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 14px' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{num}</span>
                  <span style={{ fontSize:14, color:'#334155', fontWeight:500 }}>{text}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Disclaimer */}
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:14, padding:'16px 18px', marginBottom:28 }}>
            <p style={{ fontSize:13, color:'#dc2626', margin:0, lineHeight:1.6 }}>
              <strong>Disclaimer:</strong> Yeh article sirf education ke liye hai. Diabetes diagnosis aur treatment ke liye apne doctor se zaroor milein. Koi bhi ghar ka nuskha ya Ayurvedic supplement apni prescribed medicines ki jagah mat lein.
            </p>
          </div>

          {/* CTA */}
          <div style={{ background:'linear-gradient(135deg,#0d9488,#0891b2)', borderRadius:20, padding:'28px 24px', textAlign:'center' }}>
            <p style={{ fontSize:20, fontWeight:800, color:'white', marginBottom:8 }}>Apni Report Free Mein Analyze Karo</p>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.85)', marginBottom:22, lineHeight:1.6 }}>
              HbA1c, fasting sugar, CBC — koi bhi report upload karo. AI turant Hindi mein explain karega.
            </p>
            <Link href="/upload" style={{ display:'inline-block', background:'white', color:'#0d9488', padding:'14px 32px', borderRadius:12, textDecoration:'none', fontSize:15, fontWeight:800 }}>
              Free Mein Upload Karo →
            </Link>
          </div>

          <div style={{ marginTop:16, textAlign:'center' }}>
            <Link href="/blog" style={{ color:'#0d9488', fontSize:14, fontWeight:600, textDecoration:'none' }}>← Saare Articles Dekho</Link>
          </div>
        </div>
      </div>
    </>
  )
}
