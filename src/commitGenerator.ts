import * as path from 'path';

export class CommitGenerator {

    public static generate(files: string[], diff: string): string {
        if (files.length === 0) {
            return "chore(auto): backup current work";
        }

        const type = this.determineType(files);
        const scope = this.determineScope(files);
        const summary = this.determineSummary(files, type);
        const details = this.generateDetails(files, diff);

        let message = `${type}(${scope}): ${summary}`;
        if (message.length > 72) {
             // Truncate summary if too long to fit in 72 chars including type/scope
             const prefix = `${type}(${scope}): `;
             const available = 72 - prefix.length;
             message = `${prefix}${summary.substring(0, available - 3)}...`;
        }

        if (details.length > 0) {
            message += `\n\n${details.join('\n')}`;
        }

        return message;
    }

    private static determineType(files: string[]): string {
        const extensions = new Set(files.map(f => path.extname(f)));
        const fileNames = new Set(files.map(f => path.basename(f)));

        if (fileNames.has('package.json') || fileNames.has('tsconfig.json') || fileNames.has('.gitignore')) {
            return 'chore';
        }
        if ([...extensions].every(ext => ['.md', '.txt'].includes(ext))) {
            return 'docs';
        }
        if ([...extensions].some(ext => ['.test.ts', '.spec.ts'].includes(ext))) {
            return 'test';
        }
        if ([...extensions].some(ext => ['.ts', '.js', '.jsx', '.tsx', '.py', '.java'].includes(ext))) {
            return 'feat'; // Default to feat for code, hard to distinguish fix vs feat without semantic analysis
        }
        return 'chore';
    }

    private static determineScope(files: string[]): string {
        if (files.length === 1) {
            const name = path.basename(files[0], path.extname(files[0]));
            return name === 'package' ? 'deps' : name;
        }

        // Find common parent directory
        const parts = files.map(f => f.split(path.sep));
        if (parts.length === 0) return 'global';
        
        let commonDepth = 0;
        const first = parts[0];
        
        while (commonDepth < first.length) {
            const currentPart = first[commonDepth];
            if (parts.every(p => p[commonDepth] === currentPart)) {
                commonDepth++;
            } else {
                break;
            }
        }

        if (commonDepth > 0) {
            return first[commonDepth - 1]; // Use the last common folder
        }
        
        return 'workspace';
    }

    private static determineSummary(files: string[], type: string): string {
        const count = files.length;
        if (count === 1) {
            return `update ${path.basename(files[0])}`;
        }
        return `update ${count} files`;
    }

    private static generateDetails(files: string[], diff: string): string[] {
        const details: string[] = [];
        
        // Add file list
        files.slice(0, 5).forEach(f => {
            details.push(`- ${path.basename(f)}`);
        });
        if (files.length > 5) {
            details.push(`- ...and ${files.length - 5} more`);
        }

        // Try to extract function names from diff (naive regex)
        // Matches "@@ ... @@ ... functionName" or similar patterns in some languages
        // Or simply "function foo" / "class Bar" in added lines
        const functionMatches = diff.match(/^[+](?:\s*)(?:export\s+)?(?:async\s+)?(?:function|class|interface)\s+([a-zA-Z0-9_]+)/gm);
        
        if (functionMatches) {
            const uniqueNames = new Set<string>();
            functionMatches.forEach(m => {
                const name = m.replace(/^[+](?:\s*)(?:export\s+)?(?:async\s+)?(?:function|class|interface)\s+/, '').trim();
                uniqueNames.add(name);
            });

            if (uniqueNames.size > 0) {
                details.push(''); // Spacer
                details.push('Modified components:');
                [...uniqueNames].slice(0, 5).forEach(name => details.push(`- ${name}`));
            }
        }

        return details;
    }
}
