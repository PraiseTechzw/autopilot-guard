import { GuardContext, RiskLevel, GuardAction } from './types';

export class RiskEvaluator {
    
    // Thresholds (configurable later if needed)
    private static readonly HIGH_RISK_TIME_MS = 60 * 60 * 1000; // 1 hour
    private static readonly MODERATE_RISK_TIME_MS = 30 * 60 * 1000; // 30 mins
    
    private static readonly HIGH_RISK_FILES = 10;
    private static readonly MODERATE_RISK_FILES = 3;

    private static readonly HIGH_RISK_LINES = 100;
    private static readonly MODERATE_RISK_LINES = 50;

    public static evaluate(context: GuardContext): RiskLevel {
        // 1. Workspace Closing is inherently High Risk if there are ANY changes
        if (context.isWorkspaceClosing && (context.changedFilesCount > 0 || context.linesChanged > 0)) {
            return RiskLevel.High;
        }

        // 2. High Risk Conditions based on volume/time
        if (context.timeSinceLastCommitMs > this.HIGH_RISK_TIME_MS) {
            if (context.changedFilesCount >= this.MODERATE_RISK_FILES || context.linesChanged >= this.MODERATE_RISK_LINES) {
                return RiskLevel.High;
            }
        }
        if (context.changedFilesCount >= this.HIGH_RISK_FILES || context.linesChanged >= this.HIGH_RISK_LINES) {
             return RiskLevel.High;
        }

        // 3. Moderate Risk Conditions
        if (context.timeSinceLastCommitMs > this.MODERATE_RISK_TIME_MS) {
            if (context.changedFilesCount > 0) {
                return RiskLevel.Moderate;
            }
        }
        if (context.changedFilesCount >= this.MODERATE_RISK_FILES || context.linesChanged >= this.MODERATE_RISK_LINES) {
            return RiskLevel.Moderate;
        }

        // 4. Default Low
        return RiskLevel.Low;
    }

    public static determineAction(risk: RiskLevel, autoCommitEnabled: boolean): GuardAction {
        switch (risk) {
            case RiskLevel.Low:
                return GuardAction.DoNothing;
            case RiskLevel.Moderate:
                return GuardAction.SuggestCommit;
            case RiskLevel.High:
                if (autoCommitEnabled) {
                    return GuardAction.TriggerAutoCommit;
                } else {
                    return GuardAction.SuggestCommit; // Fallback for high risk without auto-commit
                }
            default:
                return GuardAction.DoNothing;
        }
    }
}
