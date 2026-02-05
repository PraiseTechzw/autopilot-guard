Let’s lock this down cleanly: **name + positioning + the actual prompt(s)** you can ship with. No fluff.

---

## 1. Naming the VS Code extension (this matters more than people admit)

You want a name that is:

* Obvious to developers
* Closely related to Autopilot (brand gravity)
* Describes *behavior*, not AI magic

### Top 3 serious options (ranked)

### ✅ **Autopilot Guard**

**Best choice.**

Why:

* Clear relationship to Autopilot CLI
* “Guard” implies protection, not noise
* Easy sentence:

  > “Autopilot Guard stops you from losing uncommitted work.”

This name scales if you add more safeguards later.

---

### **CommitGuard**

Very strong, very clear.

Trade-off:

* More generic
* Easier to copy
* Less brand ownership

---

### **Don’tForgetGit**

Memorable, but weaker long-term.

Trade-off:

* Feels playful, not professional
* Harder to extend beyond commits

---

### 🔒 Final recommendation

**Call it: *Autopilot Guard***

Extension description (one line):

> A VS Code guardrail that prevents lost work by detecting and handling uncommitted changes automatically.

---

## 2. Mental model of the extension (important before prompts)

Autopilot Guard does **three things only**:

1. **Observe state** (time, diffs, files)
2. **Decide** (warn, suggest, or act)
3. **Execute** (trigger Autopilot CLI or guide user)

The “prompt” is not for marketing — it’s for **decision-making** and **message generation**.

---

## 3. Core decision prompt (internal logic)

This is the *system prompt* you’ll use when generating messages or decisions (Gemini / LLM).

### 🔧 System Prompt (internal)

```
You are an assistant embedded inside a VS Code extension called Autopilot Guard.
Your role is to help developers avoid losing uncommitted work.

You receive:
- Time since last commit
- Number of changed files
- Lines changed
- Workspace close intent (true/false)
- User preferences (auto-commit enabled or disabled)

Your goal:
- Minimize lost work
- Avoid annoying or interrupting the developer
- Prefer action over nagging

Rules:
- If risk is low, do nothing.
- If risk is moderate, suggest committing.
- If risk is high and auto-commit is enabled, trigger Autopilot CLI.
- Messages must be short, direct, and technical.
- Never use emojis.
- Never use marketing language.
```

This keeps behavior sane.

---

## 4. User-facing prompt (warning / suggestion text)

These are generated dynamically, but you should constrain them tightly.

### Prompt for **suggestion message**

```
Generate a short VS Code notification message (max 12 words)
that warns a developer about uncommitted changes.

Context:
- {file_count} files changed
- {minutes_since_commit} minutes since last commit

Tone:
- Direct
- Calm
- Professional
- No guilt, no humor

Example style:
"You have 8 uncommitted files. Consider committing now."
```

---

### Prompt for **high-risk auto action explanation**

When Autopilot Guard *acts*, it must explain itself clearly.

```
Generate a one-line explanation shown after an automatic commit.

Context:
- Autopilot CLI was triggered automatically
- The user enabled auto-commit
- Risk of data loss was high

Tone:
- Informational
- Neutral
- Transparent

Example style:
"Autopilot committed your changes to prevent uncommitted work loss."
```

---

## 5. Commit message prompt (optional but powerful)

If you include commit message generation:

```
Generate a concise Git commit message.

Input:
- Git diff summary
- File names
- Function or component names if available

Rules:
- Use present tense
- Be specific
- No filler words
- Max 72 characters for the title
- Optional bullet list for details

Format:
<type>(<scope>): <summary>

Details:
- <detail 1>
- <detail 2>
```

This keeps messages usable in real repos.

---

## 6. How this all fits together (important framing)

You’re not building:

> “an AI VS Code extension”

You’re building:

> **a reliability layer for developers**

Autopilot CLI = execution
Autopilot Guard = awareness + prevention

That pairing is rare, coherent, and defensible.

Your next public sentence should be something like:

> “Autopilot Guard makes it hard to lose work — even when you forget.”

That’s a product people install without thinking twice.
