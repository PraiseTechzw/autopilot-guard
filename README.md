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

## Release & Deployment

This project includes automated workflows for CI/CD.

### 1. Continuous Integration
On every push to `main` or Pull Request, the **CI** workflow runs to:
- Install dependencies
- Compile TypeScript
- Run Tests

### 2. Automated Release & Publishing
To cut a new release (tag, GitHub Release, and VS Code Marketplace Publish):

1. Go to the **Actions** tab in GitHub.
2. Select **Release & Publish**.
3. Click **Run workflow**.
4. Choose the version bump type: `patch`, `minor`, or `major`.
5. Click **Run workflow**.

The automation will:
- Bump the version in `package.json`.
- Create a git tag (e.g., `v0.0.2`).
- Create a GitHub Release with auto-generated notes.
- Publish the extension to the VS Code Marketplace.

**Prerequisites:**
You must add the following **Secret** to your GitHub Repository:
- `VSCE_PAT`: Your Personal Access Token from Azure DevOps (with Marketplace `manage` scope).

---
*Minimizing lost work. Avoiding interruptions. Preferring action over nagging.*
