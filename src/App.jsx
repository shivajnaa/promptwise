import { useState, useRef, useEffect } from 'react'

const EXAMPLES = [
  { label: 'find TODO files',     prompt: 'Find all Python files in my project that contain the word TODO and list them' },
  { label: 'batch rename',        prompt: 'Rename all .jpeg files in a folder to .jpg' },
  { label: 'bulk replace',        prompt: 'Replace all occurrences of http:// with https:// across every file in my project' },
  { label: 'delete node_modules', prompt: 'Delete all node_modules folders recursively in my workspace' },
  { label: 'debug re-renders',    prompt: 'Help me understand why my React component re-renders too often and fix it' },
  { label: 'compress images',     prompt: 'Compress all PNG images in a folder to reduce file size' },
  { label: 'count lines',         prompt: 'Count the total number of lines across all JavaScript files in my repo' },
  { label: 'write auth logic',    prompt: 'Write JWT authentication middleware for my Express app with refresh token support' },
]

const TYPE_LABELS = {
  shell: 'Shell / CLI', git: 'Git', sql: 'SQL', regex: 'Regex',
  language_feature: 'Language one-liner', package_manager: 'Package manager',
  cloud_cli: 'Cloud CLI', os_tool: 'OS tool', none: '',
}

const ML_PER_M_TOKENS = 11.5

function fmtWater(ml) {
  if (ml < 0.1)  return `${(ml * 1000).toFixed(0)} µL`
  if (ml < 1000) return `${ml.toFixed(1)} mL`
  return `${(ml / 1000).toFixed(2)} L`
}

function waterComparison(ml) {
  if (ml < 0.5)  return 'less than one faucet drip'
  if (ml < 2)    return 'about one faucet drip'
  if (ml < 15)   return 'roughly a teaspoon of water'
  if (ml < 50)   return 'about a tablespoon of water'
  if (ml < 250)  return 'close to a small glass of water'
  if (ml < 500)  return 'about half a water bottle'
  return 'over a full water bottle'
}

/* ── Animated water drop ── */
function WaterDrop({ ml, visible }) {
  const fillRef = useRef(null)
  const pct = Math.min(ml / 20, 1)
  const fillH = Math.max(5, Math.round(pct * 54))
  const fillY  = 66 - fillH

  useEffect(() => {
    if (!visible || !fillRef.current) return
    const el = fillRef.current
    el.setAttribute('height', 0)
    el.setAttribute('y', 66)
    const t = setTimeout(() => {
      el.style.transition = 'height 1.8s cubic-bezier(0.4,0,0.2,1), y 1.8s cubic-bezier(0.4,0,0.2,1)'
      el.setAttribute('height', fillH)
      el.setAttribute('y', fillY)
    }, 200)
    return () => clearTimeout(t)
  }, [visible, ml])

  return (
    <svg width="56" height="74" viewBox="0 0 56 74" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id="dc2">
          <path d="M28 3C28 3 5 32 5 48C5 61 15 70 28 70C41 70 51 61 51 48C51 32 28 3 28 3Z"/>
        </clipPath>
      </defs>
      <path d="M28 3C28 3 5 32 5 48C5 61 15 70 28 70C41 70 51 61 51 48C51 32 28 3 28 3Z"
        fill="#e8f0dc" stroke="#8fad6a" strokeWidth="1.5"/>
      <rect ref={fillRef} x="5" y="70" width="46" height="0"
        fill="#4a7c2a" clipPath="url(#dc2)" opacity="0.75"/>
      {visible && ml > 0.5 && (
        <ellipse cx="28" cy={fillY + 5} rx="9" ry="2.5" fill="#7ab84a" opacity="0.25">
          <animate attributeName="opacity" values="0.25;0.55;0.25" dur="2.5s" repeatCount="indefinite"/>
        </ellipse>
      )}
    </svg>
  )
}

/* ── Copy button ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }) }}
      style={{
        position: 'absolute', top: 10, right: 10,
        fontSize: 11, padding: '3px 10px',
        background: copied ? '#e8f0dc' : 'var(--paper2)',
        color: copied ? '#2d5016' : 'var(--ink3)',
        border: `1px solid ${copied ? '#8fad6a' : 'var(--border)'}`,
        borderRadius: 2, fontFamily: 'var(--mono)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >{copied ? 'copied ✓' : 'copy'}</button>
  )
}

/* ── Divider with label ── */
function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.75rem 0 1.5rem' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
      {label && <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
    </div>
  )
}

/* ── Result ── */
function ResultCard({ data }) {
  const avgTok = ((data.token_savings_low || 0) + (data.token_savings_high || 0)) / 2
  const waterMl = (avgTok * ML_PER_M_TOKENS) / 1_000_000

  /* NO ALTERNATIVE */
  if (data.state === 'none') {
    return (
      <div style={{ animation: 'fadeUp 0.35s ease' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--blue-bg)', border: '1px solid #a8c0d8',
          borderRadius: 2, padding: '5px 14px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 13, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
            ai agent is the right tool here
          </span>
        </div>

        <div style={{
          background: 'var(--paper2)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '1.5rem',
          borderLeft: '4px solid #a8c0d8',
        }}>
          <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: data.agent_reason ? 12 : 0 }}>
            "Your prompt is appropriate for an AI agent — go ahead with Claude Code or your preferred tool."
          </p>
          {data.agent_reason && (
            <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {data.agent_reason}
            </p>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--ink4)', marginTop: 14, fontFamily: 'var(--mono)' }}>
          No token waste here — this task genuinely needs AI reasoning.
        </p>
      </div>
    )
  }

  const isPartial = data.state === 'partial'
  const accent      = isPartial ? '#8b5e00' : '#2d5016'
  const accentLight = isPartial ? 'var(--amber-bg)' : 'var(--green-bg)'
  const accentBorder = isPartial ? '#d4a850' : '#8fad6a'

  return (
    <div style={{ animation: 'fadeUp 0.35s ease' }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: accentLight, border: `1px solid ${accentBorder}`,
        borderRadius: 2, padding: '5px 14px', marginBottom: 18,
      }}>
        <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: accent }}>
          {isPartial ? 'partial optimisation found' : 'efficient alternative found'}
          {data.alternative_type && data.alternative_type !== 'none' &&
            ` · ${TYPE_LABELS[data.alternative_type]}`}
        </span>
      </div>

      {/* Command */}
      {data.command && (
        <div style={{
          background: 'var(--paper2)',
          border: `1px solid ${accentBorder}`,
          borderRadius: 4,
          padding: '1.25rem',
          marginBottom: '1.25rem',
          position: 'relative',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)', marginBottom: 10, letterSpacing: '0.06em' }}>
            {isPartial ? '— optimise this sub-step —' : '— use this instead —'}
          </div>
          <div style={{ position: 'relative' }}>
            <pre style={{
              fontFamily: 'var(--mono)', fontSize: 13,
              color: accent, lineHeight: 1.9,
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              paddingRight: 64,
            }}>
              {data.command}
            </pre>
            <CopyButton text={data.command} />
          </div>

          {data.command_explanation && (
            <p style={{
              fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8,
              marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12,
              fontStyle: 'italic',
            }}>
              {data.command_explanation}
            </p>
          )}

          {data.why_efficient && (
            <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8, fontFamily: 'var(--mono)' }}>
              ↳ {data.why_efficient}
            </p>
          )}

          {isPartial && data.agent_reason && (
            <p style={{
              fontSize: 13, color: 'var(--blue)', marginTop: 12,
              padding: '8px 12px', background: 'var(--blue-bg)',
              borderRadius: 3, borderLeft: '3px solid #a8c0d8',
            }}>
              The rest still needs an AI: {data.agent_reason}
            </p>
          )}

          {data.safety_note && (
            <div style={{
              marginTop: 12, padding: '8px 12px',
              background: 'var(--red-bg)', border: '1px solid #d4a0a0',
              borderRadius: 3,
            }}>
              <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--mono)' }}>
                ⚠  {data.safety_note}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {[
          { label: 'Tokens saved', value: `~${(data.token_savings_low||0).toLocaleString()}–${(data.token_savings_high||0).toLocaleString()}`, sub: isPartial ? 'for sub-step only' : 'vs agentic loop' },
          { label: 'Energy saved', value: `~${(avgTok * 0.00000034).toFixed(4)} kWh`, sub: 'on-site compute' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'var(--paper3)', border: '1px solid var(--border)',
            borderRadius: 3, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)', marginBottom: 5, letterSpacing: '0.05em' }}>
              {m.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 18, fontFamily: 'var(--mono)', fontWeight: 500, color: accent }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink4)', marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Water */}
      {waterMl > 0 && (
        <div style={{
          background: 'var(--green-bg)',
          border: '1px solid #b8d090',
          borderRadius: 4,
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 11, color: '#4a7c2a', fontFamily: 'var(--mono)', marginBottom: 14, letterSpacing: '0.07em' }}>
            WATER PRESERVED BY THIS CHOICE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <WaterDrop ml={waterMl} visible />
            <div>
              <div style={{
                fontSize: 32, fontFamily: 'var(--serif)',
                fontWeight: 700, color: '#2d5016',
                lineHeight: 1.1, marginBottom: 6,
              }}>
                {fmtWater(waterMl)}
              </div>
              <p style={{ fontSize: 14, color: '#4a5c35', lineHeight: 1.7, marginBottom: 4 }}>
                That's {waterComparison(waterMl)} preserved.
              </p>
              <p style={{ fontSize: 13, color: '#4a7c2a', fontStyle: 'italic' }}>
                {waterMl < 1
                  ? 'Tiny — but millions of people are making this choice every day.'
                  : waterMl < 10
                  ? 'Small in isolation. Enormous at the scale AI operates.'
                  : 'Meaningful. At global scale, choices like this genuinely matter.'}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#7a9a5a', fontFamily: 'var(--mono)', marginTop: 14, lineHeight: 1.7 }}>
            est. ~11.5 mL / million tokens · on-site cooling + US grid generation average<br/>
            actual savings vary by data center location, cooling method &amp; grid mix
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
        token savings are estimated ranges based on typical agentic loop behavior
      </p>
    </div>
  )
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{
      width: 15, height: 15, flexShrink: 0,
      border: '2px solid var(--border2)',
      borderTopColor: '#4a7c2a',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}/>
  )
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [loadMsg, setLoadMsg] = useState('Analyzing…')
  const timerRef  = useRef(null)
  const resultRef = useRef(null)
  const MSGS = ['Analyzing intent…', 'Checking for efficient alternatives…', 'Estimating savings…']

  const analyze = async () => {
    const p = prompt.trim()
    if (!p || loading) return
    setLoading(true); setResult(null); setError(null)
    let i = 0; setLoadMsg(MSGS[0])
    timerRef.current = setInterval(() => { i = (i+1)%MSGS.length; setLoadMsg(MSGS[i]) }, 1800)

    try {
      const res  = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    } catch (e) {
      setError(e.message)
    } finally {
      clearInterval(timerRef.current)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top rule ── */}
      <div style={{ height: 4, background: 'var(--ink)' }}/>

      {/* ── Masthead ── */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Kicker */}
          <div style={{
            fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink3)',
            letterSpacing: '0.14em', marginBottom: 8, textTransform: 'uppercase',
          }}>
            A tool for thoughtful developers &amp; curious humans
          </div>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--serif)', fontWeight: 900,
                fontSize: 'clamp(28px, 6vw, 52px)',
                color: 'var(--ink)', lineHeight: 0.95,
                letterSpacing: '-0.02em',
              }}>
                Prompt<span style={{ fontStyle: 'italic' }}>Wise</span>
              </h1>
              <p style={{
                fontSize: 13, color: 'var(--ink3)', marginTop: 6,
                fontFamily: 'var(--mono)', letterSpacing: '0.02em',
              }}>
                Does this task need an AI agent — or just one good command?
              </p>
            </div>
            <a
              href="https://github.com/your-username/promptwise"
              target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink3)',
                textDecoration: 'none', border: '1px solid var(--border)',
                padding: '5px 12px', borderRadius: 2,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background='var(--ink)'; e.target.style.color='var(--paper)' }}
              onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='var(--ink3)' }}
            >
              GitHub →
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '2.5rem 2rem 5rem' }}>

        {/* Intro note — handwritten feel */}
        <div style={{
          background: 'var(--amber-bg)',
          border: '1px solid #d4c090',
          borderRadius: 3,
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          borderLeft: '4px solid #c8a840',
        }}>
          <p style={{ fontSize: 14, color: 'var(--amber)', lineHeight: 1.8 }}>
            <strong style={{ fontFamily: 'var(--serif)', fontWeight: 700 }}>Why this exists:</strong>{' '}
            AI agents can consume 50,000–500,000 tokens on file tasks that a one-line shell command handles instantly.
            That's real electricity. Real water. This tool finds the simpler path — and if there isn't one, it says so honestly.
          </p>
        </div>

        {/* Input section */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{
            display: 'block', fontSize: 12, fontFamily: 'var(--mono)',
            color: 'var(--ink3)', letterSpacing: '0.06em', marginBottom: 8,
          }}>
            DESCRIBE YOUR TASK
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze() }}
            placeholder="e.g. find all files containing TODO and list them…"
            rows={4}
            style={{
              width: '100%',
              background: '#faf7f0',
              border: '1px solid var(--border2)',
              borderRadius: 3,
              color: 'var(--ink)',
              fontSize: 14,
              padding: '14px 16px',
              lineHeight: 1.8,
              resize: 'vertical',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: 'inset 1px 2px 6px rgba(28,26,20,0.04)',
            }}
            onFocus={e => { e.target.style.borderColor='#8fad6a'; e.target.style.boxShadow='inset 1px 2px 6px rgba(28,26,20,0.04), 0 0 0 3px rgba(143,173,106,0.15)' }}
            onBlur={e  => { e.target.style.borderColor='var(--border2)'; e.target.style.boxShadow='inset 1px 2px 6px rgba(28,26,20,0.04)' }}
          />
        </div>

        {/* Examples */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--mono)', marginRight: 4 }}>try an example →</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => setPrompt(ex.prompt)}
              style={{
                fontSize: 12, fontFamily: 'var(--mono)',
                padding: '3px 10px',
                background: 'transparent',
                color: 'var(--ink3)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background='var(--ink)'; e.target.style.color='var(--paper)'; e.target.style.borderColor='var(--ink)' }}
              onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='var(--ink3)'; e.target.style.borderColor='var(--border)' }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Analyze button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={analyze}
            disabled={loading || !prompt.trim()}
            style={{
              background: loading || !prompt.trim() ? 'var(--paper3)' : 'var(--ink)',
              color: loading || !prompt.trim() ? 'var(--ink4)' : 'var(--paper)',
              border: '1px solid var(--ink)',
              borderRadius: 3,
              padding: '11px 28px',
              fontSize: 14,
              fontFamily: 'var(--body)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'all 0.15s',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading && prompt.trim()) e.target.style.background='#2d5016'; e.target.style.borderColor='#2d5016' }}
            onMouseLeave={e => { if (!loading && prompt.trim()) e.target.style.background='var(--ink)'; e.target.style.borderColor='var(--ink)' }}
          >
            {loading ? 'Analyzing…' : 'Analyze this prompt →'}
          </button>
          <span style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--mono)' }}>
            {prompt.length > 0 ? `${prompt.length} chars · ⌘↵ to analyze` : '⌘↵ to analyze'}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1.5rem 0', color: 'var(--ink2)', fontSize: 13, fontFamily: 'var(--mono)' }}>
            <Spinner /> {loadMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid #d4a0a0',
            borderRadius: 3, padding: '1rem 1.25rem', marginTop: '1.25rem',
            borderLeft: '4px solid #c07070',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--red)', marginBottom: 4, letterSpacing: '0.06em' }}>ERROR</div>
            <p style={{ fontSize: 13, color: 'var(--ink2)' }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div ref={resultRef}>
            <div style={{ height: 1, background: 'var(--border)', margin: '2rem 0 1.75rem' }}/>
            <ResultCard data={result} />
          </div>
        )}

        {/* How it works — bottom of page */}
        {!result && !loading && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '3rem 0 2rem' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { num: '01', title: 'Paste any task', body: "Anything you'd type into Claude Code, Cursor, or another AI agent." },
                { num: '02', title: 'Get an honest answer', body: 'A shell command, SQL, regex, or OS tool — or "this genuinely needs AI." Never a forced alternative.' },
                { num: '03', title: 'See the planet impact', body: 'Token savings translate to real water and energy numbers, shown in human terms.' },
              ].map(s => (
                <div key={s.num}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink4)', marginBottom: 8 }}>{s.num}</div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
            open source · MIT · no tracking · no ads<br/>
            built on the insight that CLI beats agentic loops by 10–100×
          </p>
          <p style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'var(--mono)' }}>
            water math: ~11.5 mL / million tokens
          </p>
        </div>
      </footer>
      <div style={{ height: 4, background: 'var(--ink)' }}/>
    </div>
  )
}
