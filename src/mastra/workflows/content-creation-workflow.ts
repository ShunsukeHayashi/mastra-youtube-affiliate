import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { competitorAnalysisTool } from '../tools/competitor-analysis-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';
import { seoOptimizationTool } from '../tools/seo-optimization-tool';
import { abTestingTool } from '../tools/ab-testing-tool';
import { affiliateAgent } from '../agents/affiliate-agent';

/**
 * コンテンツ作成ワークフロー
 * 競合分析 → コンテンツ生成 → SEO最適化 → A/Bテスト設定
 */
export const contentCreationWorkflow = createWorkflow({
  name: 'content-creation-workflow',
  description: '競合分析から最適化まで、コンテンツ作成の全プロセスを自動化',
  inputSchema: z.object({
    topic: z.string(),
    targetKeyword: z.string(),
    contentType: z.enum(['blog', 'landing_page', 'email']),
    targetAudience: z.enum(['beginner', 'intermediate', 'advanced']),
    competitors: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    content: z.string(),
    seoScore: z.number(),
    abTestId: z.string(),
    recommendations: z.array(z.string()),
  }),
  steps: [
    {
      id: 'analyze-competitors',
      name: '競合分析',
      tool: competitorAnalysisTool,
      input: ({ input }) => ({
        action: 'analyze_content',
        competitors: input.competitors || ['七里信一ChatGPTセミナー', 'ChatGPT Plus', 'Claude Pro'],
        metrics: ['content', 'keywords', 'engagement'],
      }),
    },
    {
      id: 'generate-content',
      name: 'コンテンツ生成',
      agent: affiliateAgent,
      input: ({ input, previousSteps }) => ({
        task: 'create_content',
        topic: input.topic,
        contentType: input.contentType,
        targetAudience: input.targetAudience,
        competitorInsights: previousSteps['analyze-competitors'].output.insights,
        runtimeContext: {
          market: 'jp',
          language: 'ja',
          compliance: true,
          style: 'professional',
        },
      }),
    },
    {
      id: 'optimize-seo',
      name: 'SEO最適化',
      tool: seoOptimizationTool,
      input: ({ input, previousSteps }) => ({
        action: 'optimize_content',
        content: previousSteps['generate-content'].output.content,
        keywords: [input.targetKeyword, ...previousSteps['analyze-competitors'].output.topKeywords],
      }),
    },
    {
      id: 'setup-ab-test',
      name: 'A/Bテスト設定',
      tool: abTestingTool,
      input: ({ previousSteps }) => ({
        action: 'create_test',
        testType: 'content',
        variations: [
          {
            name: 'Original',
            content: previousSteps['optimize-seo'].output.optimizedContent,
          },
          {
            name: 'Variant A',
            content: previousSteps['optimize-seo'].output.optimizedContent.replace(
              /プロンプト専門家/g,
              'AI活用の第一人者'
            ),
          },
        ],
        metrics: ['engagement', 'conversion'],
      }),
    },
  ],
  output: ({ steps }) => ({
    content: steps['optimize-seo'].output.optimizedContent,
    seoScore: steps['optimize-seo'].output.analysis?.score || 0,
    abTestId: steps['setup-ab-test'].output.testId,
    recommendations: [
      ...steps['analyze-competitors'].output.recommendations,
      ...steps['optimize-seo'].output.recommendations,
      ...steps['setup-ab-test'].output.recommendations,
    ],
  }),
});