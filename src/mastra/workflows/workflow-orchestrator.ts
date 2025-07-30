import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { workflows, WorkflowName } from './index';
import { affiliateNetwork } from '../networks/affiliate-network';

/**
 * ワークフローオーケストレーター
 * 複数のワークフローを組み合わせて実行する高レベルワークフロー
 */
export const workflowOrchestrator = createWorkflow({
  name: 'workflow-orchestrator',
  description: '月次キャンペーンの完全自動化オーケストレーション',
  inputSchema: z.object({
    campaignName: z.string(),
    campaignGoals: z.object({
      revenueTarget: z.number(),
      leadTarget: z.number(),
      timeframe: z.number(), // days
    }),
    focusProducts: z.array(z.string()),
    budget: z.object({
      total: z.number(),
      advertising: z.number().optional(),
      content: z.number().optional(),
      tools: z.number().optional(),
    }),
  }),
  outputSchema: z.object({
    campaignId: z.string(),
    executedWorkflows: z.array(z.string()),
    projectedResults: z.object({
      revenue: z.number(),
      leads: z.number(),
      roi: z.number(),
    }),
    timeline: z.array(z.object({
      week: z.number(),
      activities: z.array(z.string()),
      milestones: z.array(z.string()),
    })),
    nextSteps: z.array(z.string()),
  }),
  steps: [
    {
      id: 'campaign-planning',
      name: 'キャンペーン計画',
      agent: affiliateNetwork,
      input: ({ input }) => ({
        query: 'plan_monthly_campaign',
        context: {
          name: input.campaignName,
          goals: input.campaignGoals,
          products: input.focusProducts,
          budget: input.budget,
        },
      }),
    },
    {
      id: 'revenue-optimization',
      name: '収益最適化分析',
      workflow: workflows['revenue-optimization'],
      input: ({ input }) => ({
        currentRevenue: 2700000, // Current baseline
        targetRevenue: input.campaignGoals.revenueTarget,
        timeframe: Math.ceil(input.campaignGoals.timeframe / 30),
      }),
    },
    {
      id: 'content-creation-batch',
      name: 'コンテンツ一括作成',
      workflow: workflows['content-creation'],
      input: ({ input, previousSteps }) => ({
        topic: input.focusProducts[0],
        targetKeyword: `${input.focusProducts[0]} レビュー`,
        contentType: 'blog',
        targetAudience: 'all',
      }),
      // Note: In real implementation, this would loop through multiple content pieces
    },
    {
      id: 'lead-nurturing-setup',
      name: 'リードナーチャリング設定',
      workflow: workflows['lead-nurturing'],
      input: ({ input }) => ({
        topic: `${input.focusProducts[0]}完全ガイド`,
        productToPromote: input.focusProducts[0],
        targetAudience: 'all',
        campaignGoal: `${input.campaignGoals.leadTarget}リード獲得`,
        budget: input.budget.content,
      }),
    },
    {
      id: 'social-media-campaign',
      name: 'ソーシャルメディアキャンペーン',
      workflow: workflows['social-media-campaign'],
      input: ({ input }) => ({
        campaignName: input.campaignName,
        campaignGoal: '認知度向上とトラフィック誘導',
        duration: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + input.campaignGoals.timeframe * 24 * 60 * 60 * 1000).toISOString(),
        },
        platforms: ['twitter', 'linkedin', 'facebook'],
        primaryMessage: `${input.focusProducts[0]}で成果を出す方法`,
        productFocus: input.focusProducts[0],
      }),
    },
    {
      id: 'partner-outreach',
      name: 'パートナーアウトリーチ',
      workflow: workflows['partner-outreach'],
      input: ({ input }) => ({
        targetPartner: '七里信一',
        partnerType: 'product_owner',
        outreachGoal: `${input.campaignName}での特別提携`,
        personalInfo: {
          commonInterests: ['AI教育', 'ChatGPT活用'],
          specificAchievements: ['ChatGPTセミナー主催', 'AI教育の第一人者'],
        },
      }),
    },
    {
      id: 'compliance-check-all',
      name: '全コンテンツコンプライアンスチェック',
      workflow: workflows['compliance-check'],
      input: ({ previousSteps }) => ({
        content: previousSteps['content-creation-batch'].output.content,
        contentType: 'blog',
        targetMarket: 'jp',
        autoFix: true,
      }),
    },
    {
      id: 'campaign-coordination',
      name: 'キャンペーン調整',
      agent: affiliateNetwork,
      input: ({ previousSteps }) => ({
        query: 'coordinate_campaign_execution',
        context: {
          optimizationPlan: previousSteps['revenue-optimization'].output,
          contentReady: previousSteps['content-creation-batch'].output,
          leadMagnet: previousSteps['lead-nurturing-setup'].output,
          socialSchedule: previousSteps['social-media-campaign'].output,
          partnerStatus: previousSteps['partner-outreach'].output,
          complianceStatus: previousSteps['compliance-check-all'].output,
        },
      }),
    },
  ],
  output: ({ steps, input }) => {
    const campaignId = `campaign_${Date.now()}`;
    const executedWorkflows = [
      'revenue-optimization',
      'content-creation',
      'lead-nurturing',
      'social-media-campaign',
      'partner-outreach',
      'compliance-check',
    ];
    
    // 各ワークフローの結果を統合
    const projectedResults = {
      revenue: steps['revenue-optimization'].output.projectedRevenue,
      leads: steps['lead-nurturing-setup'].output.estimatedConversions.leads,
      roi: Math.round(
        ((steps['revenue-optimization'].output.projectedRevenue * input.campaignGoals.timeframe / 30) - 
         input.budget.total) / input.budget.total * 100
      ),
    };
    
    // タイムライン生成
    const weeksCount = Math.ceil(input.campaignGoals.timeframe / 7);
    const timeline = Array.from({ length: weeksCount }, (_, i) => ({
      week: i + 1,
      activities: getWeeklyActivities(i + 1, weeksCount),
      milestones: getWeeklyMilestones(i + 1, weeksCount, input.campaignGoals),
    }));
    
    const nextSteps = [
      'ダッシュボードでリアルタイムモニタリング開始',
      'A/Bテスト結果に基づく最適化',
      'パートナーからの返信に応じた調整',
      '週次レポートの確認と戦略調整',
      'ROI目標達成に向けた追加施策の検討',
    ];
    
    return {
      campaignId,
      executedWorkflows,
      projectedResults,
      timeline,
      nextSteps,
    };
  },
});

// ヘルパー関数
function getWeeklyActivities(week: number, totalWeeks: number): string[] {
  const activities: Record<number, string[]> = {
    1: [
      'コンテンツ公開開始',
      'ソーシャルメディア投稿開始',
      'リードマグネット配布開始',
      'パートナーへの初回アウトリーチ',
    ],
    2: [
      'A/Bテスト開始',
      'メールシーケンス配信',
      'エンゲージメント分析',
      'パートナーフォローアップ',
    ],
    3: [
      'コンテンツ最適化',
      'ソーシャル戦略調整',
      'リード分析とセグメント',
      '中間成果レビュー',
    ],
  };
  
  if (week === totalWeeks) {
    return [
      '最終成果分析',
      '次期キャンペーン計画',
      'レポート作成',
      '学習事項のまとめ',
    ];
  }
  
  return activities[week] || [
    '継続的な最適化',
    'パフォーマンスモニタリング',
    'エンゲージメント向上施策',
    'コンバージョン改善',
  ];
}

function getWeeklyMilestones(
  week: number, 
  totalWeeks: number, 
  goals: any
): string[] {
  const weeklyLeadTarget = Math.round(goals.leadTarget / totalWeeks);
  const weeklyRevenueTarget = Math.round(goals.revenueTarget / totalWeeks);
  
  const milestones = [
    `週間リード目標: ${weeklyLeadTarget}件`,
    `週間収益目標: ¥${weeklyRevenueTarget.toLocaleString()}`,
  ];
  
  if (week === 1) {
    milestones.push('キャンペーンキックオフ完了');
  } else if (week === Math.ceil(totalWeeks / 2)) {
    milestones.push('中間目標達成チェック');
  } else if (week === totalWeeks) {
    milestones.push('最終目標達成評価');
  }
  
  return milestones;
}