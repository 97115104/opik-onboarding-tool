---
name: bun-adversarial-loop
description: >-
  Runs the Bun-style implement → two independent adversarial reviews → fix →
  close → smoke loop for feature work, UX passes, and bug fixes. Use when
  shipping changes in this repo or similar agent workflows, when the user
  mentions adversarial review, Bun-in-Rust method, implement-review-loop, or
  AGENT_KICKOFF engineering method.
---

# Bun adversarial loop

Encode the [Bun-in-Rust](https://bun.com/blog/bun-in-rust) engineering method so agents ship with independent review, not self-approval.

## When to use

- Feature work, UX passes, bug fixes in this repo (or similar multi-agent workflows)
- Any change that should not merge on implementer confidence alone
- When `AGENT_KICKOFF.md` protocol applies: task → implement → 2 reviews → fix → close → smoke

## The loop

```
task → implement → 2 adversarial reviews → fix → close → smoke
```

1. **Implement** — own the task; change only needed paths; match existing style.
2. **Two independent adversarial reviewers** — separate context windows; read-only; find bugs.
3. **Fix** — address clear/high findings; do not argue away blockers without evidence.
4. **Close** — mark work done only after both review passes are addressed.
5. **Smoke** — run focused verification (typecheck/build, Playwright, or deploy smoke as available).

### Parallel reviews (required when available)

When Multitask Mode or the Task tool is available, launch **two** background/subagent reviewers in parallel:

- `readonly: true` (or equivalent read-only mode)
- Separate prompts / no shared implementer reasoning
- Each returns concrete findings with severity

Do **not** self-review as a substitute for the two reviewers.

## Reviewer rules

Reviewers are **adversarial**, not cheerleaders.

- Assume the implementation is wrong until proven otherwise
- Context: diff + `CONTRACTS.md` + task/plan — **not** the implementer's private rationale
- **Do not** edit product code
- Report findings with severity: `blocker` | `major` | `minor`
- Prefer concrete file/line or behavior repros over vague taste notes

### Finding format

```markdown
- severity: blocker|major|minor
- where: path or UI surface
- problem: what breaks or drifts
- evidence: why (contract, missing test, UX regression)
```

## Repo checklist (opik-onboarding-tool)

Reviewers and fixers must check:

- [ ] **CONTRACTS.md** — API shapes, step labels/testids, env vars stay in sync
- [ ] **e2e Playwright** — wizard flows and new `data-testid`s covered or updated
- [ ] **deploy-locally** — one-command path still coherent (note if full deploy skipped)
- [ ] **No secrets** — no tokens, `.env` contents, or credentials in code/commits
- [ ] **Path ownership** — respect workstream owned paths; no silent shared-file edits
- [ ] **Plain-language UI** — non-technical copy; no em dashes in UI-facing text
- [ ] **No paragraph-long workarounds** — if you need a long comment to justify it, fix the code

## Implementer rules

- No destructive git (`stash`, `reset --hard`, broad resets) unless the user explicitly asks
- Do not commit or push unless the user asks
- When a failure class repeats, fix the **process** (skill / CONTRACTS / kickoff), not only the symptom
- After reviews: fix all `blocker` and clear `major` items before claiming done

## Smoke (minimum)

Run what the environment allows; note gaps:

1. Typecheck / build for touched apps if available
2. Focused Playwright wizard tests when services are up
3. Full `./deploy-locally.sh` only when required or feasible

## Anti-patterns

- One reviewer, or implementer "reviewing" their own diff
- Reviewers that only praise or rubber-stamp
- Stubbing to silence errors instead of fixing behavior
- Skipping CONTRACTS/e2e updates for new surfaces
