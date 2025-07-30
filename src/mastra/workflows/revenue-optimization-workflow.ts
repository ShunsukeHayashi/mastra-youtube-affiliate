import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { analyticsToolDashboard } from '../tools/analytics-dashboard-tool';
import { roiCalculatorTool } from '../tools/roi-calculator-tool';
import { abTestingTool } from '../tools/ab-testing-tool';
import { competitorAnalysisTool } from '../tools/competitor-analysis-tool';
import { affiliateNetwork } from '../networks/affiliate-network';

/**
 * 収益最適化ワークフロー
 * 現状分析 → 競合比較 → 最適化提案 → 実行計画 → 予測
 */
export const revenueOptimizationWorkflow = createWorkflow({
  name: 'revenue-optimization-workflow',
  description: '収益を最大化するための包括的な分析と最適化ワークフロー',
  inputSchema: z.object({
    currentRevenue: z.number(),
    targetRevenue: z.number(),
    timeframe: z.number(), // months
    currentMetrics: z.object({
      traffic: z.number(),
      conversionRate: z.number(),
      averageOrderValue: z.number(),
    }).optional(),
  }),
  outputSchema: z.object({
    optimizationPlan: z.array(z.object({
      action: z.string(),
      priority: z.string(),
      expectedImpact: z.string(),
      implementation: z.string(),
    })),
    projectedRevenue: z.number(),
    confidenceLevel: z.number(),
    keyMetrics: z.object({
      requiredTraffic: z.number(),
      requiredConversionRate: z.number(),
      requiredAOV: z.number(),
    }),
  }),
  steps: [
    {
      id: 'analyze-current-performance',
      name: '現在のパフォーマンス分析',
      tool: analyticsToolDashboard,
      input: ({ input }) => ({
        action: 'analyze_kpis',
        metrics: ['revenue', 'conversion_rate', 'traffic', 'sources'],
        period: 'last_30_days',
      }),
    },
    {
      id: 'competitor-benchmarking',
      name: '競合ベンチマーキング',
      tool: competitorAnalysisTool,
      input: () => ({
        action: 'benchmark',
        competitors: ['七里信一ChatGPTセミナー', 'ChatGPT Plus', 'Claude Pro'],
        metrics: ['pricing', 'conversion', 'traffic'],
      }),
    },
    {
      id: 'identify-optimization-opportunities',
      name: '最適化機会の特定',
      agent: affiliateNetwork,
      input: ({ input, previousSteps }) => ({
        query: 'analyze_optimization_opportunities',
        context: {
          currentPerformance: previousSteps['analyze-current-performance'].output,
          competitorData: previousSteps['competitor-benchmarking'].output,
          targetRevenue: input.targetRevenue,
          timeframe: input.timeframe,
        },
      }),
    },
    {
      id: 'calculate-scenarios',
      name: 'シナリオ計算',
      tool: roiCalculatorTool,
      input: ({ input }) => ({
        action: 'compare_scenarios',
        scenarios: [
          {
            name: '現状維持',
            investment: 0,
            expectedReturn: input.currentRevenue * 12,
          },
          {
            name: 'トラフィック2倍',
            investment: 100000,
            expectedReturn: input.currentRevenue * 2 * 12,
          },
          {
            name: 'コンバージョン率改善',
            investment: 50000,
            expectedReturn: input.currentRevenue * 1.5 * 12,
          },
          {
            name: '高単価商品フォーカス',
            investment: 30000,
            expectedReturn: input.currentRevenue * 1.8 * 12,
          },
        ],
      }),
    },
    {
      id: 'ab-test-planning',
      name: 'A/Bテスト計画',
      tool: abTestingTool,
      input: ({ previousSteps }) => ({
        action: 'plan_tests',
        optimizationAreas: previousSteps['identify-optimization-opportunities'].output?.areas || [
          'landing_page',
          'email_subject',
          'cta_button',
        ],
        priority: 'high_impact',
      }),
    },
    {
      id: 'sensitivity-analysis',
      name: '感度分析',
      tool: roiCalculatorTool,
      input: ({ input }) => ({
        action: 'sensitivity_analysis',
        investment: {
          monthly: 50000,
        },
        revenue: {
          currentMonthly: input.currentRevenue,
          conversionRate: input.currentMetrics?.conversionRate || 0.12,
          averageCommission: input.currentMetrics?.averageOrderValue || 60000,
        },
      }),
    },
    {
      id: 'create-action-plan',
      name: 'アクションプラン作成',
      agent: affiliateNetwork,
      input: ({ previousSteps, input }) => ({
        query: 'create_optimization_plan',
        context: {
          scenarios: previousSteps['calculate-scenarios'].output,
          sensitivityAnalysis: previousSteps['sensitivity-analysis'].output,
          abTests: previousSteps['ab-test-planning'].output,
          targetRevenue: input.targetRevenue,
          timeframe: input.timeframe,
        },
      }),
    },
  ],
  output: ({ steps, input }) => {
    const scenarios = steps['calculate-scenarios'].output.calculation.scenarios;
    const bestScenario = scenarios[0]; // Already sorted by score
    const sensitivityFactors = steps['sensitivity-analysis'].output.calculation.criticalFactors;
    
    // 必要な指標の計算
    const growthMultiplier = input.targetRevenue / input.currentRevenue;
    const currentMetrics = input.currentMetrics || {
      traffic: 10000,
      conversionRate: 0.12,
      averageOrderValue: 60000,
    };
    
    return {
      optimizationPlan: [
        {
          action: `${sensitivityFactors[0].variable}の改善`,
          priority: 'critical',
          expectedImpact: '+40% revenue',
          implementation: '次の2週間で実施',
        },
        {
          action: bestScenario.name,
          priority: 'high',
          expectedImpact: `ROI ${bestScenario.roi.toFixed(0)}%`,
          implementation: '1ヶ月以内に開始',
        },
        {
          action: 'A/Bテスト実施',
          priority: 'medium',
          expectedImpact: '+15-25% conversion',
          implementation: '継続的に実施',
        },
        {
          action: '高単価商品比率の増加',
          priority: 'medium',
          expectedImpact: '+30% AOV',
          implementation: '段階的に調整',
        },
      ],
      projectedRevenue: Math.round(bestScenario.expectedReturn / 12),
      confidenceLevel: 75, // Based on analysis quality
      keyMetrics: {
        requiredTraffic: Math.round(currentMetrics.traffic * growthMultiplier),
        requiredConversionRate: Math.min(0.25, currentMetrics.conversionRate * 1.5),
        requiredAOV: Math.round(currentMetrics.averageOrderValue * 1.3),
      },
    };
  },
});