import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { complianceCheckerTool } from '../tools/compliance-checker-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';
import { seoOptimizationTool } from '../tools/seo-optimization-tool';

/**
 * コンプライアンスチェックワークフロー
 * コンテンツチェック → 修正提案 → 自動修正 → 最終確認
 */
export const complianceCheckWorkflow = createWorkflow({
  name: 'compliance-check-workflow',
  description: '法的コンプライアンスを確保するための包括的チェックワークフロー',
  inputSchema: z.object({
    content: z.string(),
    contentType: z.enum(['blog', 'email', 'social', 'landing_page', 'video']),
    productClaims: z.array(z.string()).optional(),
    targetMarket: z.enum(['jp', 'us', 'global']),
    autoFix: z.boolean().default(true),
  }),
  outputSchema: z.object({
    complianceScore: z.number(),
    status: z.enum(['compliant', 'needs_attention', 'non_compliant']),
    fixedContent: z.string().optional(),
    issues: z.array(z.object({
      severity: z.string(),
      category: z.string(),
      issue: z.string(),
      fixed: z.boolean(),
    })),
    disclaimer: z.string(),
  }),
  steps: [
    {
      id: 'initial-check',
      name: '初期コンプライアンスチェック',
      tool: complianceCheckerTool,
      input: ({ input }) => ({
        action: 'check_content',
        content: input.content,
        contentType: input.contentType,
        targetMarket: input.targetMarket,
      }),
    },
    {
      id: 'check-disclosure',
      name: 'アフィリエイト表示チェック',
      tool: complianceCheckerTool,
      input: ({ input }) => ({
        action: 'check_disclosure',
        content: input.content,
        contentType: input.contentType,
      }),
    },
    {
      id: 'check-claims',
      name: '商品表現チェック',
      tool: complianceCheckerTool,
      input: ({ input }) => ({
        action: 'check_claims',
        productClaims: input.productClaims || extractClaims(input.content),
        targetMarket: input.targetMarket,
      }),
      condition: ({ input }) => input.productClaims && input.productClaims.length > 0,
    },
    {
      id: 'generate-disclaimer',
      name: '免責事項生成',
      tool: complianceCheckerTool,
      input: ({ input }) => ({
        action: 'generate_disclaimer',
        contentType: input.contentType,
        targetMarket: input.targetMarket,
      }),
    },
    {
      id: 'auto-fix-content',
      name: 'コンテンツ自動修正',
      tool: contentGeneratorToolV2,
      input: ({ input, previousSteps }) => ({
        action: 'fix_compliance',
        content: input.content,
        issues: previousSteps['initial-check'].output.issues,
        context: {
          market: input.targetMarket,
          language: input.targetMarket === 'jp' ? 'ja' : 'en',
          compliance: true,
          style: 'compliant',
        },
      }),
      condition: ({ input, previousSteps }) => 
        input.autoFix && previousSteps['initial-check'].output.issues.length > 0,
    },
    {
      id: 'final-check',
      name: '最終コンプライアンスチェック',
      tool: complianceCheckerTool,
      input: ({ input, previousSteps }) => ({
        action: 'audit_campaign',
        campaignContent: previousSteps['auto-fix-content']?.output?.content || input.content,
      }),
    },
    {
      id: 'optimize-for-seo',
      name: 'SEO最適化（コンプライアンス維持）',
      tool: seoOptimizationTool,
      input: ({ input, previousSteps }) => ({
        action: 'optimize_content',
        content: previousSteps['auto-fix-content']?.output?.content || input.content,
        keywords: ['アフィリエイト', '広告'],
      }),
      condition: ({ previousSteps }) => 
        previousSteps['final-check'].output.report.status === 'compliant',
    },
  ],
  output: ({ steps, input }) => {
    const initialIssues = steps['initial-check'].output.issues || [];
    const finalReport = steps['final-check'].output.report;
    const wasFixed = steps['auto-fix-content']?.output ? true : false;
    
    return {
      complianceScore: finalReport.overallScore || finalReport.score,
      status: finalReport.status,
      fixedContent: wasFixed ? steps['auto-fix-content'].output.content : undefined,
      issues: initialIssues.map((issue: any) => ({
        ...issue,
        fixed: wasFixed && !steps['final-check'].output.issues.some(
          (finalIssue: any) => finalIssue.issue === issue.issue
        ),
      })),
      disclaimer: steps['generate-disclaimer'].output.disclaimer,
    };
  },
});

// ヘルパー関数
function extractClaims(content: string): string[] {
  const claims: string[] = [];
  
  // 数値を含む主張を抽出
  const numericClaims = content.match(/[^。！\n]*\d+[%％倍円万億][^。！\n]*/g) || [];
  claims.push(...numericClaims);
  
  // 比較表現を抽出
  const comparativeClaims = content.match(/[^。！\n]*(より|最も|No\.1|第一|トップ)[^。！\n]*/g) || [];
  claims.push(...comparativeClaims);
  
  // 効果・効能に関する表現を抽出
  const effectClaims = content.match(/[^。！\n]*(効果|改善|解決|成功|達成)[^。！\n]*/g) || [];
  claims.push(...effectClaims);
  
  return [...new Set(claims)]; // 重複を除去
}