# Contributing to PromptWise

Thanks for wanting to help. This project is small and intentional — contributions that make it more accurate, more honest, or more useful are very welcome.

## Principles

1. **Honesty over cleverness** — the app's value comes from being trustworthy. Never loosen the anti-hallucination rules in `api/analyze.js` to make the tool "find" more alternatives. A correct "no alternative" is better than a wrong suggestion.

2. **Non-technical users matter** — `command_explanation` must always be readable by someone who doesn't know what `sed` is. Don't assume terminal fluency.

3. **Environmental framing is the soul** — the water/energy angle is what makes this different from every other "prompt to shell" tool. Keep it honest and human-scale.

## What to work on

### High value
- **More command categories**: PowerShell equivalents, fish shell, Windows-native tools, `deno`, `bun`
- **Better token savings ranges**: current estimates are heuristic; data-backed ranges with sources would be more credible
- **Multilingual support**: translate the UI and `command_explanation` output for non-English speakers
- **Edge cases in commands**: improve handling of filenames with spaces, Unicode, symlinks, etc.

### Medium value
- **VS Code extension**: intercept prompts before they reach Copilot/Claude in the editor
- **Claude Code hook**: a `PreToolUse` hook that checks PromptWise before executing multi-step loops
- **Dark/light theme toggle**: currently dark-only

### Low priority (please discuss first)
- Changing the visual design significantly
- Adding user accounts or history
- Backend caching of results

## Getting started

```bash
git clone https://github.com/your-username/promptwise
cd promptwise
npm install
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
vercel dev
```

## Pull request checklist

- [ ] The `api/analyze.js` system prompt anti-hallucination rules are unchanged or strengthened
- [ ] `command_explanation` is readable by a non-developer
- [ ] No new external dependencies without discussion
- [ ] Tested with at least 5 prompts including ones that should return `state: "none"`

## Reporting issues

If PromptWise suggests a wrong or dangerous command, that's a serious bug. Please open an issue with:
- The prompt you entered
- The command it suggested
- What's wrong with it

These get highest priority.
