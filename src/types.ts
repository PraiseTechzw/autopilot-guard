export interface GuardContext {
    timeSinceLastCommitMs: number;
    changedFilesCount: number;
    linesChanged: number;
    isWorkspaceClosing: boolean;
    autoCommitEnabled: boolean;
}

export enum RiskLevel {
    Low = 'low',
    Moderate = 'moderate',
    High = 'high'
}

export enum GuardAction {
    DoNothing = 'do_nothing',
    SuggestCommit = 'suggest_commit',
    TriggerAutoCommit = 'trigger_auto_commit'
}
