# Autopilot Guard

**A reliability layer for developers.**

> "Autopilot Guard makes it hard to lose work — even when you forget."

Autopilot Guard acts as your safety net, providing awareness and prevention for uncommitted work.

## Core Philosophy

We are not building just another "AI extension". We are building a reliability layer.

*   **Autopilot CLI** = Execution
*   **Autopilot Guard** = Awareness + Prevention

This pairing ensures that your focus remains on coding, while we handle the safety of your progress.

## Features

*   **Intelligent Risk Monitoring**: Silently observes your workspace for uncommitted changes.
*   **Context-Aware Notifications**: Suggests committing only when the risk of data loss is moderate or high.
*   **Automatic Prevention**: If enabled, proactively commits your work when risk is critical (e.g., closing the workspace with many changes).
*   **Meaningful History**: Generates concise, structured commit messages automatically (`feat`, `chore`, `fix`) so your history remains readable.

## Configuration

*   `autopilotGuard.autoCommit`: Enable/Disable automatic commits for high-risk situations (Default: `false`).

---
*Minimizing lost work. Avoiding interruptions. Preferring action over nagging.*
