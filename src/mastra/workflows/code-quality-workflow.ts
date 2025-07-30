import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { ideDiagnosticsTool } from '../tools/mcp-tools/ide-diagnostics-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';
import { complianceCheckerTool } from '../tools/compliance-checker-tool';

/**
 * コード品質保証ワークフロー
 * IDE診断 → 問題分析 → 自動修正 → 品質確認
 */
export const codeQualityWorkflow = createWorkflow({
  name: 'code-quality-workflow',
  description: 'MCPを活用したコード品質の自動チェックと改善',
  inputSchema: z.object({
    targetFiles: z.array(z.string()).optional(),
    autoFix: z.boolean().default(true),
    checkTypes: z.array(z.enum(['syntax', 'style', 'security', 'performance'])).default(['syntax', 'style']),
  }),
  outputSchema: z.object({
    qualityScore: z.number(),
    issuesFound: z.number(),
    issuesFixed: z.number(),
    diagnosticReport: z.object({
      errors: z.number(),
      warnings: z.number(),
      info: z.number(),
    }),
    recommendations: z.array(z.string()),
  }),
  steps: [
    {
      id: 'get-diagnostics',
      name: 'IDE診断情報取得',
      tool: ideDiagnosticsTool,
      input: ({ input }) => ({
        action: input.targetFiles ? 'get_file_diagnostics' : 'get_all_diagnostics',
        uri: input.targetFiles?.[0],
      }),
    },
    {
      id: 'analyze-issues',
      name: '問題分析',
      tool: ideDiagnosticsTool,
      input: ({ previousSteps }) => ({
        action: 'analyze_errors',
        diagnostics: previousSteps['get-diagnostics'].output.diagnostics,
      }),
    },
    {
      id: 'generate-fixes',
      name: '修正コード生成',
      tool: contentGeneratorToolV2,
      input: ({ previousSteps }) => ({
        action: 'fix_code_issues',
        issues: previousSteps['get-diagnostics'].output.diagnostics,
        context: {
          language: 'typescript',
          style: 'clean-code',
          fixTypes: ['syntax', 'unused-imports', 'type-errors'],
        },
      }),
      condition: ({ input, previousSteps }) => 
        input.autoFix && previousSteps['get-diagnostics'].output.summary.totalErrors > 0,
    },
    {
      id: 'verify-compliance',
      name: 'セキュリティ・コンプライアンス確認',
      tool: complianceCheckerTool,
      input: ({ input }) => ({
        action: 'audit_code_security',
        checkTypes: input.checkTypes,
      }),
      condition: ({ input }) => input.checkTypes.includes('security'),
    },
    {
      id: 'final-diagnostics',
      name: '最終診断',
      tool: ideDiagnosticsTool,
      input: ({ input }) => ({
        action: 'get_all_diagnostics',
      }),
    },
  ],
  output: ({ steps, previousSteps }) => {
    const initialDiagnostics = steps['get-diagnostics'].output.summary;
    const finalDiagnostics = steps['final-diagnostics'].output.summary;
    
    const issuesFixed = initialDiagnostics.totalErrors - finalDiagnostics.totalErrors;
    const totalIssues = initialDiagnostics.totalErrors + initialDiagnostics.totalWarnings;
    const remainingIssues = finalDiagnostics.totalErrors + finalDiagnostics.totalWarnings;
    
    const qualityScore = totalIssues === 0 ? 100 : 
      Math.round((1 - remainingIssues / totalIssues) * 100);
    
    return {
      qualityScore,
      issuesFound: totalIssues,
      issuesFixed,
      diagnosticReport: {
        errors: finalDiagnostics.totalErrors,
        warnings: finalDiagnostics.totalWarnings,
        info: finalDiagnostics.totalInfo,
      },
      recommendations: [
        ...steps['analyze-issues'].output.recommendations,
        '定期的なコード品質チェックの実施',
        'pre-commitフックでの自動チェック設定',
        'チーム全体でのコーディング規約の統一',
      ],
    };
  },
});