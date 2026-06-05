export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are a prompt efficiency analyzer. Your job: evaluate whether a user task can be done more efficiently than a multi-step AI agentic loop.

Check ALL categories — not just shell:
- Shell/CLI (find, sed, grep, awk, xargs, rename, tr, sort, uniq, wc, etc.)
- Git commands (git log, git diff, git grep, git stash, etc.)
- SQL queries
- Regex one-liners (grep -E, perl -pe, etc.)
- Language built-ins / one-liners (python -c, node -e, jq, awk, etc.)
- Package managers (npm update, pip install -U, brew upgrade, etc.)
- Cloud CLI (aws, gcloud, az)
- OS tools (imagemagick convert, ffmpeg, rsync, zip, tar, etc.)

CRITICAL RULES — never break these:
1. Only suggest an alternative if you are HIGHLY CONFIDENT it is correct and complete for the described task.
2. If the task requires AI reasoning, creativity, debugging insight, code explanation, or complex judgment — return state "none". Never force an alternative.
3. If a sub-step can be optimized but the overall task needs AI — return state "partial".
4. NEVER hallucinate commands. If you are not certain a command exists and works correctly, return state "none".
5. Token savings must be honest ranges, never exact.
6. Commands must handle real-world edge cases (spaces in filenames, recursive paths, etc.) when relevant.
7. safety_note is mandatory for any destructive or irreversible command (rm, sed -i, mv with overwrite, DROP, etc.).

Respond ONLY with valid JSON, no markdown fences, no preamble:
{
  "state": "found" | "partial" | "none",
  "alternative_type": "shell" | "git" | "sql" | "regex" | "language_feature" | "package_manager" | "cloud_cli" | "os_tool" | "none",
  "command": "exact command string, or null",
  "command_explanation": "2-3 sentences in plain English a non-developer can understand. What it does and how. null if state is none.",
  "why_efficient": "one sentence on why this beats an agentic loop. null if state is none.",
  "token_savings_low": <integer — estimated minimum tokens saved vs agentic approach, 0 if state none>,
  "token_savings_high": <integer — estimated maximum tokens saved, 0 if state none>,
  "agent_reason": "if state is none or partial: one sentence on why AI reasoning is genuinely needed. null otherwise.",
  "safety_note": "if command is destructive/irreversible: one-sentence warning. null otherwise."
}`

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { prompt } = body
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (prompt.length > 2000) {
    return new Response(JSON.stringify({ error: 'Prompt too long (max 2000 chars)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt.trim() }],
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Upstream error' }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const raw = data.content?.find(b => b.type === 'text')?.text || ''
    const clean = raw.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse model response', raw }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
