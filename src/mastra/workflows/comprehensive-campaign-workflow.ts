import { createWorkflow } from '@mastra/core/workflows';
import { realtimeResearcherAgent } from '../agents/realtime-researcher-agent';
import { dataScientistAgent } from '../agents/data-scientist-agent';
import { marketAnalystAgent } from '../agents/market-analyst-agent';
import { contentCreatorAgent } from '../agents/content-creator-agent';
import { visualDesignerAgent } from '../agents/visual-designer-agent';
import { optimizationSpecialistAgent } from '../agents/optimization-specialist-agent';
import { affiliateAgent } from '../agents/affiliate-agent';

/**
 * 包括的キャンペーンワークフロー
 * 
 * 市場調査からコンテンツ制作、最適化まで全工程を自動化
 * 8つのエージェントが連携して高品質なアフィリエイトキャンペーンを構築
 */
export const comprehensiveCampaignWorkflow = createWorkflow({
  id: 'comprehensive-campaign',
  name: '包括的キャンペーンワークフロー',
  description: '市場調査から最適化まで完全自動化されたアフィリエイトキャンペーン構築',
  
  steps: [
    // Phase 1: リサーチ・分析フェーズ
    {
      id: 'market-research',
      name: 'リアルタイム市場調査',
      agent: realtimeResearcherAgent,
      description: '最新の市場トレンドと競合状況を調査',
      input: {
        product: '{{input.product}}',
        targetMarket: '{{input.targetMarket}}',
        researchDepth: 'comprehensive'
      },
      outputSchema: {
        marketTrends: 'array',
        competitorAnalysis: 'object',
        opportunities: 'array',
        threats: 'array'
      }
    },
    
    {
      id: 'historical-analysis',
      name: '過去データ分析',
      agent: dataScientistAgent,
      description: '過去の成功パターンと予測モデル構築',
      input: {
        marketData: '{{market-research.output}}',
        timeframe: '12_months',
        analysisType: 'predictive_modeling'
      },
      outputSchema: {
        successPatterns: 'array',
        predictiveModel: 'object',
        recommendations: 'array'
      }
    },
    
    {
      id: 'strategic-positioning',
      name: '戦略的ポジショニング',
      agent: marketAnalystAgent,
      description: '市場での最適なポジショニング戦略を策定',
      input: {
        marketResearch: '{{market-research.output}}',
        dataAnalysis: '{{historical-analysis.output}}',
        businessGoals: '{{input.businessGoals}}'
      },
      outputSchema: {
        positioningStrategy: 'object',
        targetSegments: 'array',
        messagingFramework: 'object'
      }
    },
    
    // Phase 2: コンテンツ制作フェーズ
    {
      id: 'content-planning',
      name: 'コンテンツ戦略立案',
      agent: contentCreatorAgent,
      description: '統合コンテンツ戦略とカレンダー作成',
      input: {
        positioning: '{{strategic-positioning.output}}',
        channels: ['blog', 'email', 'social', 'youtube'],
        duration: '30_days'
      },
      outputSchema: {
        contentStrategy: 'object',
        contentCalendar: 'array',
        keyMessages: 'array'
      }
    },
    
    {
      id: 'visual-concept',
      name: 'ビジュアルコンセプト開発',
      agent: visualDesignerAgent,
      description: 'ブランド統一されたビジュアルコンセプト設計',
      input: {
        contentPlan: '{{content-planning.output}}',
        brandGuidelines: '{{input.brandGuidelines}}',
        visualStyle: 'professional_modern'
      },
      outputSchema: {
        visualConcept: 'object',
        colorPalette: 'object',
        designTemplates: 'array'
      }
    },
    
    {
      id: 'content-creation',
      name: 'マルチチャネルコンテンツ制作',
      agent: contentCreatorAgent,
      description: '各チャネル向けコンテンツの一括制作',
      input: {
        contentStrategy: '{{content-planning.output}}',
        visualConcept: '{{visual-concept.output}}',
        batchSize: 10
      },
      outputSchema: {
        blogPosts: 'array',
        emailSequences: 'array',
        socialPosts: 'array',
        youtubeScripts: 'array'
      }
    },
    
    {
      id: 'visual-assets',
      name: 'ビジュアルアセット制作',
      agent: visualDesignerAgent,
      description: 'コンテンツに対応したビジュアル素材制作',
      input: {
        content: '{{content-creation.output}}',
        visualConcept: '{{visual-concept.output}}',
        formats: ['banner', 'thumbnail', 'social_image', 'infographic']
      },
      outputSchema: {
        banners: 'array',
        thumbnails: 'array',
        socialImages: 'array',
        infographics: 'array'
      }
    },
    
    // Phase 3: 最適化・監視フェーズ
    {
      id: 'ab-test-setup',
      name: 'A/Bテスト設計',
      agent: optimizationSpecialistAgent,
      description: 'コンバージョン最適化のためのA/Bテスト設計',
      input: {
        content: '{{content-creation.output}}',
        visuals: '{{visual-assets.output}}',
        testHypotheses: ['headline_variations', 'cta_placement', 'visual_style']
      },
      outputSchema: {
        testPlans: 'array',
        variations: 'object',
        successMetrics: 'array'
      }
    },
    
    {
      id: 'performance-baseline',
      name: 'パフォーマンスベースライン設定',
      agent: dataScientistAgent,
      description: '成果測定のためのベースライン設定',
      input: {
        historicalData: '{{historical-analysis.output}}',
        campaignGoals: '{{input.businessGoals}}',
        testPlans: '{{ab-test-setup.output}}'
      },
      outputSchema: {
        baselineMetrics: 'object',
        targetKPIs: 'object',
        alertThresholds: 'object'
      }
    },
    
    {
      id: 'launch-strategy',
      name: 'ローンチ戦略策定',
      agent: affiliateAgent,
      description: '最適なタイミングとチャネルでのローンチ計画',
      input: {
        content: '{{content-creation.output}}',
        visuals: '{{visual-assets.output}}',
        abTests: '{{ab-test-setup.output}}',
        baseline: '{{performance-baseline.output}}'
      },
      outputSchema: {
        launchTimeline: 'object',
        channelSequence: 'array',
        riskMitigation: 'array'
      }
    },
    
    // Phase 4: 継続監視フェーズ
    {
      id: 'real-time-monitoring',
      name: 'リアルタイム監視設定',
      agent: realtimeResearcherAgent,
      description: 'キャンペーン期間中の継続監視システム',
      input: {
        launchStrategy: '{{launch-strategy.output}}',
        monitoringTargets: ['competitor_response', 'market_sentiment', 'trend_changes'],
        alertFrequency: 'hourly'
      },
      outputSchema: {
        monitoringPlan: 'object',
        alertSystem: 'object',
        reportingSchedule: 'array'
      }
    }
  ],
  
  // ワークフロー設定
  config: {
    maxConcurrentSteps: 3,
    retryAttempts: 2,
    timeoutMinutes: 60,
    
    // 条件分岐設定
    conditionalLogic: {
      // 市場調査で重大な脅威が発見された場合
      threatDetected: {
        condition: '{{market-research.output.threats.length}} > 2',
        action: 'pause_and_alert',
        message: '市場に重大な脅威が検出されました。戦略見直しが必要です。'
      },
      
      // 予測モデルの精度が低い場合
      lowAccuracy: {
        condition: '{{historical-analysis.output.predictiveModel.accuracy}} < 0.75',
        action: 'additional_data_collection',
        message: '予測精度向上のため追加データ収集を実行します。'
      }
    },
    
    // 品質ゲート
    qualityGates: {
      contentQuality: {
        stage: 'content-creation',
        threshold: 80,
        metric: 'overall_quality_score'
      },
      
      visualConsistency: {
        stage: 'visual-assets', 
        threshold: 90,
        metric: 'brand_consistency_score'
      }
    },
    
    // 自動承認設定
    autoApproval: {
      enabled: true,
      thresholds: {
        qualityScore: 85,
        riskLevel: 'low',
        budgetImpact: 'within_limits'
      }
    }
  },
  
  // 成果物テンプレート
  deliverables: {
    campaignSummary: {
      template: `
# {{input.product}} キャンペーン実行計画

## 市場分析サマリー
- 市場機会: {{market-research.output.opportunities}}
- 競合状況: {{market-research.output.competitorAnalysis.summary}}
- 推奨戦略: {{strategic-positioning.output.positioningStrategy}}

## 制作物
- ブログ記事: {{content-creation.output.blogPosts.length}}件
- メールシーケンス: {{content-creation.output.emailSequences.length}}件  
- ビジュアル素材: {{visual-assets.output.totalAssets}}点

## 予測成果
- 予想CTR: {{historical-analysis.output.predictiveModel.estimatedCTR}}%
- 予想CV率: {{historical-analysis.output.predictiveModel.estimatedConversion}}%
- 収益予測: {{historical-analysis.output.predictiveModel.revenueProjection}}万円

## A/Bテスト計画
{{ab-test-setup.output.testPlans}}

## 監視・最適化
- 監視項目: {{real-time-monitoring.output.monitoringPlan.targets}}
- レポート頻度: {{real-time-monitoring.output.reportingSchedule}}
      `
    }
  }
});

/**
 * 使用例:
 * 
 * // 包括的キャンペーン実行
 * const campaign = await comprehensiveCampaignWorkflow.execute({
 *   product: "七里信一ChatGPTセミナー",
 *   targetMarket: "jp_ai_education",
 *   businessGoals: {
 *     revenue: 5000000,
 *     leads: 1000,
 *     timeframe: "30_days"
 *   },
 *   brandGuidelines: {
 *     colors: ["#0066CC", "#FF6600"],
 *     tone: "professional_approachable"
 *   }
 * });
 * 
 * console.log(campaign.campaignSummary);
 */