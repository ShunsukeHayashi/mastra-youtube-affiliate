import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { leadMagnetGeneratorTool } from '../tools/lead-magnet-generator-tool';
import { emailAutomationTool } from '../tools/email-automation-tool';
import { analyticsToolDashboard } from '../tools/analytics-dashboard-tool';
import { roiCalculatorTool } from '../tools/roi-calculator-tool';

/**
 * リード育成ワークフロー
 * リードマグネット作成 → メールシーケンス設定 → パフォーマンス追跡 → ROI分析
 */
export const leadNurturingWorkflow = createWorkflow({
  name: 'lead-nurturing-workflow',
  description: 'リード獲得から顧客化まで、自動化されたナーチャリングプロセス',
  inputSchema: z.object({
    topic: z.string(),
    productToPromote: z.string(),
    targetAudience: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
    campaignGoal: z.string(),
    budget: z.number().optional(),
  }),
  outputSchema: z.object({
    leadMagnetId: z.string(),
    emailSequenceId: z.string(),
    projectedROI: z.number(),
    estimatedConversions: z.object({
      leads: z.number(),
      customers: z.number(),
      revenue: z.number(),
    }),
  }),
  steps: [
    {
      id: 'create-lead-magnet',
      name: 'リードマグネット作成',
      tool: leadMagnetGeneratorTool,
      input: ({ input }) => ({
        action: 'create_magnet',
        magnetType: 'ebook',
        topic: input.topic,
        targetAudience: input.targetAudience,
        productToPromote: input.productToPromote,
      }),
    },
    {
      id: 'generate-landing-page',
      name: 'ランディングページ生成',
      tool: leadMagnetGeneratorTool,
      input: ({ previousSteps }) => ({
        action: 'generate_landing',
        existingMagnetId: previousSteps['create-lead-magnet'].output.leadMagnet.id,
      }),
    },
    {
      id: 'create-email-sequence',
      name: 'メールシーケンス作成',
      tool: emailAutomationTool,
      input: ({ input, previousSteps }) => ({
        action: 'create_campaign',
        campaignName: `${input.topic} ナーチャリングキャンペーン`,
        sequences: [
          {
            name: 'ウェルカムシリーズ',
            emails: previousSteps['create-lead-magnet'].output.emailSequence || [],
          },
        ],
        targetProduct: input.productToPromote,
      }),
    },
    {
      id: 'setup-tracking',
      name: 'トラッキング設定',
      tool: analyticsToolDashboard,
      input: ({ input, previousSteps }) => ({
        action: 'create_dashboard',
        dashboardType: 'campaign',
        metrics: ['lead_acquisition', 'email_engagement', 'conversion_rate', 'revenue'],
        campaignId: previousSteps['create-email-sequence'].output.campaignId,
      }),
    },
    {
      id: 'calculate-roi',
      name: 'ROI予測',
      tool: roiCalculatorTool,
      input: ({ input, previousSteps }) => ({
        action: 'project_revenue',
        investment: {
          initial: input.budget || 50000,
          monthly: 20000,
        },
        revenue: {
          currentMonthly: 0,
          growthRate: 0.3,
          conversionRate: previousSteps['create-lead-magnet'].output.estimatedConversions.salesConversionRate / 100,
          averageCommission: 60000,
        },
        timeframe: 12,
      }),
    },
  ],
  output: ({ steps }) => {
    const leadConversions = steps['create-lead-magnet'].output.estimatedConversions;
    const emailPerformance = steps['create-email-sequence'].output.performance || {};
    const projections = steps['calculate-roi'].output.projections || [];
    
    return {
      leadMagnetId: steps['create-lead-magnet'].output.leadMagnet.id,
      emailSequenceId: steps['create-email-sequence'].output.campaignId,
      projectedROI: projections[11]?.roi || 0,
      estimatedConversions: {
        leads: Math.round((leadConversions.optinRate / 100) * 1000), // 1000 visitors assumption
        customers: Math.round((leadConversions.salesConversionRate / 100) * 100), // 100 leads assumption
        revenue: projections[11]?.revenue || 0,
      },
    };
  },
});