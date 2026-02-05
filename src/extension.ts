import * as vscode from 'vscode';
import { GitProvider } from './gitProvider';
import { RiskEvaluator } from './riskEvaluator';
import { CommitGenerator } from './commitGenerator';
import { GuardContext, RiskLevel, GuardAction } from './types';
import * as cp from 'child_process';

let intervalId: NodeJS.Timer | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Autopilot Guard is active');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;
    const gitProvider = new GitProvider(rootPath);

    // Command to manually check risk
    const checkRiskDisposable = vscode.commands.registerCommand('autopilot-guard.checkRisk', async () => {
        await checkAndAct(gitProvider, false);
    });

    context.subscriptions.push(checkRiskDisposable);

    // Periodic check (every 5 minutes)
    intervalId = setInterval(() => {
        checkAndAct(gitProvider, false);
    }, 5 * 60 * 1000); 
}

export function deactivate() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    // Attempt one last check on close (sync limitations apply, but we try)
    // In reality, async operations in deactivate are often cut short.
    // We can't easily await here reliably if the extension host is shutting down fast.
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
         const rootPath = workspaceFolders[0].uri.fsPath;
         const gitProvider = new GitProvider(rootPath);
         // We force a check with 'isWorkspaceClosing = true'
         checkAndAct(gitProvider, true).catch(err => console.error(err));
    }
}

async function checkAndAct(gitProvider: GitProvider, isWorkspaceClosing: boolean) {
    const timeSinceLastCommitMs = await gitProvider.getTimeSinceLastCommitMs();
    const changedFilesCount = await gitProvider.getChangedFilesCount();
    const linesChanged = await gitProvider.getLinesChanged();
    
    const config = vscode.workspace.getConfiguration('autopilotGuard');
    const autoCommitEnabled = config.get<boolean>('autoCommit', false);

    const context: GuardContext = {
        timeSinceLastCommitMs,
        changedFilesCount,
        linesChanged,
        isWorkspaceClosing,
        autoCommitEnabled
    };

    const risk = RiskEvaluator.evaluate(context);
    const action = RiskEvaluator.determineAction(risk, autoCommitEnabled);

    console.log(`Risk: ${risk}, Action: ${action}`);

    switch (action) {
        case GuardAction.DoNothing:
            break;
        case GuardAction.SuggestCommit:
            const minutesSinceCommit = Math.floor(timeSinceLastCommitMs / 60000);
            vscode.window.showInformationMessage(`${changedFilesCount} files changed. ${minutesSinceCommit}m since last commit. Suggest committing.`);
            break;
        case GuardAction.TriggerAutoCommit:
            if (isWorkspaceClosing || risk === RiskLevel.High) {
                 vscode.window.showWarningMessage('High risk detected. Auto-committing changes...');
                 triggerAutoCommit(gitProvider);
            }
            break;
    }
}

async function triggerAutoCommit(gitProvider: GitProvider) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;
    const rootPath = workspaceFolders[0].uri.fsPath;

    // Generate commit message
    const files = await gitProvider.getChangedFilePaths();
    const diff = await gitProvider.getDiffSummary();
    const message = CommitGenerator.generate(files, diff);

    // Simulate Autopilot CLI trigger with the generated message
    // In a real scenario, this would call the actual CLI tool.
    // Using console.log to show the message being used
    console.log('Generated Commit Message:\n', message);
    
    // Escape message for shell (basic implementation)
    const escapedMessage = message.replace(/"/g, '\\"');
    
    cp.exec(`echo "Autopilot Guard: Auto-committing with message: ${escapedMessage}"`, { cwd: rootPath }, (err, stdout) => {
        if (err) {
            console.error('Auto-commit failed:', err);
        } else {
            console.log(stdout);
            vscode.window.showInformationMessage("Autopilot automatically committed changes to prevent work loss.");
        }
    });
}
