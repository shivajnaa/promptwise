# PromptWise — Token & Planet Saver

> Does your AI agent task need to be an AI agent task?

Many tasks given to AI agents can be done with a single shell command, SQL query, or one-liner — using **100x fewer tokens** and measurably less water and energy. PromptWise analyzes your prompt and finds out.

![PromptWise screenshot](./public/screenshot.png)

## What it does

Paste any task you'd give an AI agent. PromptWise returns one of three honest results:

- ✅ **Efficient alternative found** — shows you the exact command (shell, git, SQL, regex, OS tool, etc.), explains it in plain English, and estimates tokens + water saved
- ⚠️ **Partial optimization** — the overall task needs AI, but a sub-step can be done more efficiently
- 🤖 **AI agent is the right tool** — no alternative is forced; your prompt is appropriate as-is

It never hallucinates commands. If it isn't confident, it says so.

## Why this matters

A multi-step AI agent loop can consume 50,000–500,000 tokens for file operations that a shell one-liner handles in milliseconds with zero tokens beyond the suggestion itself.

At scale:
- ~11.5 mL of water is consumed per million tokens (on-site cooling + US grid average)
- [Anthropic's own research](https://medium.com/@unicodeveloper/10-must-have-clis-for-your-ai-agents-in-2026-51ba0d0881df) found shell scripts cut token usage by 98.7% vs MCP tool calls
- Total AI water consumption reached an estimated 312–764 billion liters in 2025

## Tech stack

- **Frontend**: React + Vite
- **Backend**: Vercel Edge Function (secure API proxy — key never exposed to browser)
- **AI**: Claude Sonnet via Anthropic API
- **Deploy**: Vercel (free tier works fine)

## Deploy in 5 minutes

### Prerequisites
- [Vercel account](https://vercel.com) (free)
- [Anthropic API key](https://console.anthropic.com)
- Node.js 18+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/promptwise
cd promptwise

# 2. Install dependencies
npm install

# 3. Install Vercel CLI
npm install -g vercel

# 4. Deploy
vercel

# 5. Add your API key as an environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your key when prompted, select all environments

# 6. Redeploy to pick up the env var
vercel --prod
```

Your app is now live at `https://your-project.vercel.app`

### Local development

```bash
# Create .env.local
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# Run dev server (Vercel CLI handles the edge function locally)
vercel dev
```

## Project structure

```
promptwise/
├── api/
│   └── analyze.js        # Vercel Edge Function — secure Anthropic API proxy
├── src/
│   ├── App.jsx           # Main React app
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── vercel.json           # Routing config
└── package.json
```

## How the analysis works

The edge function sends your prompt to Claude with a strict system prompt that:

1. Checks across 8 categories: shell/CLI, git, SQL, regex, language built-ins, package managers, cloud CLI, OS tools
2. Only suggests an alternative when **highly confident** it is correct and complete
3. Returns `state: "none"` when the task genuinely needs AI — never forces an alternative
4. Never hallucinates commands; if uncertain, it says so

## Water math

```
tokens saved → kWh saved → mL of water saved

mL = tokens_saved × (11.5 mL / 1,000,000 tokens)

Where 11.5 mL/million tokens comes from:
  - On-site cooling: ~1.8 L/kWh × ~0.00000034 kWh/token ≈ 0.6 mL/million tokens
  - Power generation: ~7.6 L/kWh (US grid avg) × same energy ≈ 2.6 mL/million tokens  
  - Rounded to ~11.5 mL/million tokens combined (scope-1 + scope-2 estimate)

All figures are estimates. Actual savings vary by data center location,
cooling method, and grid energy mix.
```

## Contributing

PRs welcome. Key areas for improvement:

- More command categories (PowerShell, fish shell, Windows-native)
- Better token savings estimation methodology  
- Multilingual support
- VS Code extension / Claude Code hook

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT — use it, fork it, build on it.

---

*Built on the insight that [CLI beats agentic loops by 10–100x on token efficiency](https://jannikreinhard.com/2026/02/22/why-cli-tools-are-beating-mcp-for-ai-agents/). Made public to help people use AI more thoughtfully.*
