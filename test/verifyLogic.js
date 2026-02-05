"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const riskEvaluator_1 = require("../src/riskEvaluator");
const commitGenerator_1 = require("../src/commitGenerator");
const types_1 = require("../src/types");
const assert = require("assert");
console.log('Running Autopilot Guard Logic Verification...');
// 1. Test RiskEvaluator
console.log('\n[1] Testing RiskEvaluator...');
const highRiskContext = {
    timeSinceLastCommitMs: 70 * 60 * 1000,
    changedFilesCount: 15,
    linesChanged: 200,
    isWorkspaceClosing: false,
    autoCommitEnabled: true
};
const moderateRiskContext = {
    timeSinceLastCommitMs: 40 * 60 * 1000,
    changedFilesCount: 5,
    linesChanged: 10,
    isWorkspaceClosing: false,
    autoCommitEnabled: false
};
const closingContext = {
    timeSinceLastCommitMs: 5000,
    changedFilesCount: 1,
    linesChanged: 5,
    isWorkspaceClosing: true,
    autoCommitEnabled: true
};
try {
    const riskHigh = riskEvaluator_1.RiskEvaluator.evaluate(highRiskContext);
    assert.strictEqual(riskHigh, types_1.RiskLevel.High, 'Expected High Risk for high volume/time');
    console.log('  ✓ High Risk Detected correctly');
    const actionHigh = riskEvaluator_1.RiskEvaluator.determineAction(riskHigh, highRiskContext.autoCommitEnabled);
    assert.strictEqual(actionHigh, types_1.GuardAction.TriggerAutoCommit, 'Expected TriggerAutoCommit when enabled');
    console.log('  ✓ Auto-commit action determined correctly');
    const riskModerate = riskEvaluator_1.RiskEvaluator.evaluate(moderateRiskContext);
    assert.strictEqual(riskModerate, types_1.RiskLevel.Moderate, 'Expected Moderate Risk');
    console.log('  ✓ Moderate Risk Detected correctly');
    const riskClosing = riskEvaluator_1.RiskEvaluator.evaluate(closingContext);
    assert.strictEqual(riskClosing, types_1.RiskLevel.High, 'Expected High Risk when closing workspace');
    console.log('  ✓ Closing Workspace Risk Detected correctly');
}
catch (e) {
    console.error('  ✗ RiskEvaluator Test Failed:', e.message);
    process.exit(1);
}
// 2. Test CommitGenerator
console.log('\n[2] Testing CommitGenerator...');
const files1 = ['src/utils.ts', 'src/types.ts', 'package.json'];
const diff1 = `
diff --git a/src/utils.ts b/src/utils.ts
index ...
@@ -10,0 +11,5 @@
+export function helper() {
+    return true;
+}
`;
const files2 = ['README.md'];
const diff2 = '';
try {
    const msg1 = commitGenerator_1.CommitGenerator.generate(files1, diff1);
    console.log('  Message 1:', msg1);
    assert.ok(msg1.includes('chore'), 'Should detect chore from package.json');
    assert.ok(msg1.includes('update 3 files'), 'Summary should be update 3 files');
    assert.ok(msg1.includes('- helper'), 'Should include function name from diff');
    console.log('  ✓ Message 1 generated correctly');
    const msg2 = commitGenerator_1.CommitGenerator.generate(files2, diff2);
    console.log('  Message 2:', msg2);
    assert.ok(msg2.includes('docs'), 'Should detect docs type');
    assert.ok(msg2.includes('update README.md'), 'Summary should be specific for single file');
    console.log('  ✓ Message 2 generated correctly');
}
catch (e) {
    console.error('  ✗ CommitGenerator Test Failed:', e.message);
    process.exit(1);
}
console.log('\nVerification Passed! All systems operational.');
//# sourceMappingURL=verifyLogic.js.map