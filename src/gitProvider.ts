import * as cp from 'child_process';

export class GitProvider {
    private workspaceRoot: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
    }

    private exec(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            cp.exec(command, { cwd: this.workspaceRoot }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }

    public async getTimeSinceLastCommitMs(): Promise<number> {
        try {
            const output = await this.exec('git log -1 --format=%ct');
            const commitTimeSeconds = parseInt(output, 10);
            const nowSeconds = Math.floor(Date.now() / 1000);
            return (nowSeconds - commitTimeSeconds) * 1000;
        } catch (error) {
            console.error('Error getting last commit time:', error);
            return 0; // Fallback
        }
    }

    public async getChangedFilesCount(): Promise<number> {
        try {
            const output = await this.exec('git status --porcelain');
            if (!output) return 0;
            return output.split('\n').length;
        } catch (error) {
            console.error('Error getting changed files:', error);
            return 0;
        }
    }

    public async getLinesChanged(): Promise<number> {
        try {
            // Get unstaged changes
            const unstagedOutput = await this.exec('git diff --shortstat');
            // Get staged changes
            const stagedOutput = await this.exec('git diff --cached --shortstat');

            const parseLines = (shortstat: string) => {
                if (!shortstat) return 0;
                // Format: " 1 file changed, 2 insertions(+), 1 deletion(-)"
                const parts = shortstat.split(',');
                let lines = 0;
                parts.forEach(part => {
                    if (part.includes('insertion')) {
                        lines += parseInt(part.trim().split(' ')[0], 10);
                    }
                    if (part.includes('deletion')) {
                        lines += parseInt(part.trim().split(' ')[0], 10);
                    }
                });
                return lines;
            };

            return parseLines(unstagedOutput) + parseLines(stagedOutput);
        } catch (error) {
            console.error('Error getting lines changed:', error);
            return 0;
        }
    }

    public async getChangedFilePaths(): Promise<string[]> {
        try {
            const output = await this.exec('git diff --name-only && git diff --cached --name-only');
            return output.split('\n').filter(line => line.trim().length > 0);
        } catch (error) {
            console.error('Error getting file paths:', error);
            return [];
        }
    }

    public async getDiffSummary(): Promise<string> {
        try {
            // Get a limited diff to extract context (function names etc)
            // -U0 for minimal context, head limit handled by maxBuffer in exec usually but we'll take raw
            return await this.exec('git diff -U0 && git diff --cached -U0');
        } catch (error) {
            console.error('Error getting diff:', error);
            return '';
        }
    }
}
