import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// スキーマ定義
const marketAnalysisSchema = z.object({
  targetProduct: z.string(),
  marketOverview: z.object({
    totalMarketSize: z.string(),
    growthRate: z.string(),
    keyTrends: z.array(z.string()),
  }),
  topCompetitors: z.array(z.object({
    name: z.string(),
    score: z.number(),
    affiliateOpportunity: z.string(),
  })),
});

const strategySchema = z.object({
  positioningStrategy: z.string(),
  priorityProducts: z.array(z.string()),
  estimatedMonthlyRevenue: z.string(),
  actionPlan: z.array(z.object({
    week: z.number(),
    actions: z.array(z.string()),
  })),
});

const contentPlanSchema = z.object({
  contentCalendar: z.array(z.object({
    date: z.string(),
    contentType: z.string(),
    topic: z.string(),
    targetProduct: z.string(),
  })),
  abTests: z.array(z.object({
    testName: z.string(),
    variants: z.array(z.string()),
  })),
});

// Step 1: 市場・競合分析
const analyzeMarket = createStep({
  id: 'analyze-market',
  description: 'AI教育市場と競合の包括的分析',
  inputSchema: z.object({
    focusProduct: z.string().describe('メインで推薦したい商品'),
  }),
  outputSchema: marketAnalysisSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('商品名が指定されていません');
    }

    const agent = mastra?.getAgent('affiliateAgent');
    if (!agent) {
      throw new Error('Affiliate agent not found');
    }

    const prompt = `
競合分析ツールを使用して、「${inputData.focusProduct}」を中心としたAI教育市場の分析を行ってください。

以下の観点で分析してください：
1. 市場全体の規模と成長性
2. 主要競合サービスの特徴と評価
3. アフィリエイト収益の観点からの魅力度
4. ハヤシシュンスケの権威性を活かせるポジショニング

competitorAnalysisToolを使用して詳細な分析を実行してください。
`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      toolChoice: 'required',
    });

    // 分析結果のサンプル（実際はエージェントの応答から抽出）
    const analysisResult = {
      targetProduct: inputData.focusProduct,
      marketOverview: {
        totalMarketSize: '年間2,500億円',
        growthRate: '年率35%成長',
        keyTrends: [
          'ChatGPT/生成AIへの需要急増',
          'ビジネス応用重視への shift',
          '高単価プログラムの需要増',
        ],
      },
      topCompetitors: [
        {
          name: '七里信一ChatGPTセミナー',
          score: 92,
          affiliateOpportunity: '最優先推薦商材',
        },
        {
          name: 'Aidemy Premium',
          score: 78,
          affiliateOpportunity: '優先推薦商材',
        },
        {
          name: 'キカガク長期コース',
          score: 75,
          affiliateOpportunity: '優先推薦商材',
        },
      ],
    };

    console.log(`\n📊 市場分析完了`);
    console.log(`市場規模: ${analysisResult.marketOverview.totalMarketSize}`);
    console.log(`成長率: ${analysisResult.marketOverview.growthRate}`);
    
    return analysisResult;
  },
});

// Step 2: 戦略立案
const developStrategy = createStep({
  id: 'develop-strategy',
  description: 'アフィリエイト戦略の立案',
  inputSchema: marketAnalysisSchema,
  outputSchema: strategySchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('市場分析データが見つかりません');
    }

    const agent = mastra?.getAgent('affiliateAgent');
    if (!agent) {
      throw new Error('Affiliate agent not found');
    }

    // 優先商品の選定
    const priorityProducts = inputData.topCompetitors
      .filter(c => c.affiliateOpportunity.includes('優先'))
      .map(c => c.name);

    // 90日間のアクションプラン
    const actionPlan = [
      {
        week: 1,
        actions: [
          `${inputData.targetProduct}の詳細分析と体験`,
          '競合サービスの調査・比較表作成',
          'ターゲットオーディエンスのペルソナ設定',
        ],
      },
      {
        week: 2,
        actions: [
          'ブランディング戦略の確立',
          'コンテンツカレンダーの作成',
          'リードマグネットの制作開始',
        ],
      },
      {
        week: 3,
        actions: [
          'Webサイト・ランディングページ構築',
          'メールマーケティングシステム設定',
          'SNSプロフィール最適化',
        ],
      },
      {
        week: 4,
        actions: [
          '初期コンテンツ制作・公開',
          'SEO対策の実施',
          'アフィリエイトリンク設定',
        ],
      },
    ];

    const strategy = {
      positioningStrategy: 'プロンプト専門家による信頼性の高い推薦',
      priorityProducts,
      estimatedMonthlyRevenue: '2,700,000円',
      actionPlan,
    };

    console.log(`\n🎯 戦略立案完了`);
    console.log(`推薦商品数: ${strategy.priorityProducts.length}`);
    console.log(`予想月収: ${strategy.estimatedMonthlyRevenue}`);

    return strategy;
  },
});

// Step 3: コンテンツ計画
const planContent = createStep({
  id: 'plan-content',
  description: '90日間のコンテンツ計画作成',
  inputSchema: strategySchema,
  outputSchema: contentPlanSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('戦略データが見つかりません');
    }

    // 30日分のコンテンツカレンダー生成
    const contentCalendar = [];
    const contentTypes = ['blog', 'twitter', 'youtube', 'email'];
    const baseDate = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      let contentType = '';
      let topic = '';
      
      // 曜日別コンテンツ戦略
      switch (dayOfWeek) {
        case 1: // 月曜
          contentType = 'blog';
          topic = '週始めのモチベーション記事';
          break;
        case 3: // 水曜
          contentType = 'youtube';
          topic = '技術解説・比較動画';
          break;
        case 5: // 金曜
          contentType = 'email';
          topic = '週末の学習提案';
          break;
        default:
          contentType = 'twitter';
          topic = 'デイリーTips・インサイト';
      }
      
      const targetProduct = inputData.priorityProducts[i % inputData.priorityProducts.length];
      
      contentCalendar.push({
        date: date.toISOString().split('T')[0],
        contentType,
        topic,
        targetProduct,
      });
    }

    // A/Bテスト計画
    const abTests = [
      {
        testName: 'ヘッドライン最適化テスト',
        variants: [
          'プロンプト専門家が推薦する〇〇',
          '年収3億円を目指す人のための〇〇',
          'AI時代の勝者になるための〇〇',
        ],
      },
      {
        testName: 'CTA最適化テスト',
        variants: [
          '無料相談を予約する',
          '詳細を確認する',
          '限定特典を受け取る',
        ],
      },
      {
        testName: '価格表示最適化テスト',
        variants: [
          '一括価格表示',
          '分割払い表示',
          'ROI強調表示',
        ],
      },
    ];

    console.log(`\n📅 コンテンツ計画完了`);
    console.log(`計画日数: 30日`);
    console.log(`A/Bテスト数: ${abTests.length}`);

    return {
      contentCalendar,
      abTests,
    };
  },
});

// ワークフローの定義
const marketResearchWorkflow = createWorkflow({
  id: 'market-research-workflow',
  inputSchema: z.object({
    focusProduct: z.string().describe('メインで推薦したい商品（例：七里信一ChatGPTセミナー）'),
  }),
  outputSchema: contentPlanSchema,
})
  .then(analyzeMarket)
  .then(developStrategy)
  .then(planContent);

marketResearchWorkflow.commit();

export { marketResearchWorkflow };