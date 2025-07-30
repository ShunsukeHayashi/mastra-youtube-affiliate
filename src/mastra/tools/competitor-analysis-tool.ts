import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface CompetitorData {
  name: string;
  price: number;
  affiliateCommission?: number;
  features: string[];
  targetAudience: string;
  marketShare?: number;
  customerSatisfaction?: number;
  uniqueSellingPoints: string[];
}

// 主要な競合サービスのデータベース
const competitorDatabase: CompetitorData[] = [
  {
    name: '七里信一ChatGPTセミナー',
    price: 298000,
    affiliateCommission: 80000,
    features: [
      '実践的なChatGPT活用法',
      'ビジネス応用に特化',
      'バックエンド商品「飛翔」',
      '成約率14%の実績',
      '継続的なサポート',
    ],
    targetAudience: 'ビジネスパーソン・起業家',
    marketShare: 15,
    customerSatisfaction: 92,
    uniqueSellingPoints: [
      '高額報酬のアフィリエイトプログラム',
      '実績のある講師陣',
      'ビジネス成果に直結する内容',
    ],
  },
  {
    name: 'Aidemy Premium',
    price: 528000,
    affiliateCommission: 30000,
    features: [
      'AI/機械学習の体系的学習',
      'Python実装スキル',
      'データサイエンス特化',
      '転職サポート付き',
      'マンツーマン指導',
    ],
    targetAudience: 'エンジニア・データサイエンティスト志望者',
    marketShare: 20,
    customerSatisfaction: 88,
    uniqueSellingPoints: [
      '技術的深さ',
      '転職保証',
      '個別メンタリング',
    ],
  },
  {
    name: 'キカガク長期コース',
    price: 792000,
    affiliateCommission: 50000,
    features: [
      'AI・機械学習の基礎から応用',
      'DX人材育成',
      '6ヶ月の長期プログラム',
      'プロジェクト実践',
      '修了証発行',
    ],
    targetAudience: '企業のDX推進担当者',
    marketShare: 12,
    customerSatisfaction: 85,
    uniqueSellingPoints: [
      '企業研修実績',
      '体系的カリキュラム',
      '長期サポート',
    ],
  },
  {
    name: 'Udemy AI関連コース',
    price: 27000,
    affiliateCommission: 2000,
    features: [
      '豊富なコース選択肢',
      'オンデマンド学習',
      '30日返金保証',
      '修了証明書',
      'モバイル対応',
    ],
    targetAudience: '初心者・独学者',
    marketShare: 35,
    customerSatisfaction: 80,
    uniqueSellingPoints: [
      '手軽な価格',
      '多様なコース',
      '自分のペースで学習',
    ],
  },
];

export const competitorAnalysisTool = createTool({
  id: 'analyze-competitors',
  description: 'AI教育市場の競合分析と戦略的ポジショニング提案',
  inputSchema: z.object({
    targetProduct: z.string().describe('分析対象の商品名'),
    analysisDepth: z.enum(['basic', 'detailed', 'strategic']).default('detailed'),
    comparisonCriteria: z.array(z.string()).optional().describe('比較基準'),
    includeRecommendations: z.boolean().default(true),
  }),
  outputSchema: z.object({
    marketOverview: z.object({
      totalMarketSize: z.string(),
      growthRate: z.string(),
      keyTrends: z.array(z.string()),
    }),
    competitorComparison: z.array(z.object({
      name: z.string(),
      score: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      affiliateOpportunity: z.string(),
    })),
    positioningStrategy: z.object({
      recommendation: z.string(),
      differentiators: z.array(z.string()),
      targetSegment: z.string(),
      pricingStrategy: z.string(),
    }),
    affiliateStrategy: z.object({
      priorityProducts: z.array(z.string()),
      estimatedMonthlyRevenue: z.string(),
      conversionOptimization: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const { targetProduct, analysisDepth, includeRecommendations } = context;
    
    // 市場概要の分析
    const marketOverview = {
      totalMarketSize: '年間2,500億円（AI教育市場）',
      growthRate: '年率35%成長',
      keyTrends: [
        'ChatGPT/生成AIへの需要急増',
        'ビジネス応用重視への shift',
        '実践的スキル習得の重要性向上',
        '高単価・高品質プログラムの需要増',
        'オンライン完結型の主流化',
      ],
    };

    // 競合比較分析
    const targetData = competitorDatabase.find(c => 
      c.name.includes(targetProduct) || targetProduct.includes(c.name)
    );
    
    const competitorComparison = competitorDatabase.map(competitor => {
      const score = calculateCompetitorScore(competitor, targetData);
      return {
        name: competitor.name,
        score,
        strengths: competitor.uniqueSellingPoints,
        weaknesses: identifyWeaknesses(competitor),
        affiliateOpportunity: evaluateAffiliateOpportunity(competitor),
      };
    }).sort((a, b) => b.score - a.score);

    // ポジショニング戦略
    const positioningStrategy = {
      recommendation: '「プロンプト専門家が認める実践的AI教育」としてのポジショニング',
      differentiators: [
        'ハヤシシュンスケの権威性を最大活用',
        '技術的正確性と実践的価値の両立',
        '成果にコミットする姿勢',
        '受講後の継続サポート体制',
      ],
      targetSegment: 'AI活用で年収アップを目指すビジネスパーソン',
      pricingStrategy: '価値訴求型（ROI重視）',
    };

    // アフィリエイト戦略
    const affiliateStrategy = generateAffiliateStrategy(competitorComparison);

    return {
      marketOverview,
      competitorComparison: competitorComparison.slice(0, 5),
      positioningStrategy,
      affiliateStrategy,
    };
  },
});

function calculateCompetitorScore(
  competitor: CompetitorData,
  target?: CompetitorData
): number {
  let score = 0;
  
  // アフィリエイト報酬の魅力度（40%）
  if (competitor.affiliateCommission) {
    score += (competitor.affiliateCommission / 100000) * 40;
  }
  
  // 市場シェア（20%）
  if (competitor.marketShare) {
    score += (competitor.marketShare / 50) * 20;
  }
  
  // 顧客満足度（20%）
  if (competitor.customerSatisfaction) {
    score += (competitor.customerSatisfaction / 100) * 20;
  }
  
  // 価格帯の適正さ（20%）
  const priceScore = competitor.price > 100000 ? 20 : (competitor.price / 100000) * 20;
  score += priceScore;
  
  return Math.round(score);
}

function identifyWeaknesses(competitor: CompetitorData): string[] {
  const weaknesses: string[] = [];
  
  if (competitor.price > 500000) {
    weaknesses.push('初期投資額が高額');
  }
  
  if (competitor.price < 50000) {
    weaknesses.push('低単価による収益性の課題');
  }
  
  if (!competitor.features.some(f => f.includes('サポート'))) {
    weaknesses.push('継続サポート体制の不足');
  }
  
  if (!competitor.features.some(f => f.includes('実践') || f.includes('実装'))) {
    weaknesses.push('理論偏重で実践性に欠ける');
  }
  
  return weaknesses.length > 0 ? weaknesses : ['特筆すべき弱点なし'];
}

function evaluateAffiliateOpportunity(competitor: CompetitorData): string {
  const commission = competitor.affiliateCommission || 0;
  const conversionPotential = competitor.customerSatisfaction || 80;
  
  if (commission >= 50000 && conversionPotential >= 85) {
    return '最優先推薦商材（高報酬・高成約率）';
  } else if (commission >= 30000 || conversionPotential >= 90) {
    return '優先推薦商材（バランス良好）';
  } else if (commission >= 10000) {
    return 'サブ商材として活用可能';
  } else {
    return 'ボリューム戦略での活用検討';
  }
}

function generateAffiliateStrategy(
  competitors: Array<{name: string; score: number; affiliateOpportunity: string}>
): any {
  const priorityProducts = competitors
    .filter(c => c.affiliateOpportunity.includes('優先'))
    .map(c => c.name)
    .slice(0, 3);
    
  // 収益シミュレーション
  const monthlyRevenue = calculateMonthlyRevenue(priorityProducts);
  
  return {
    priorityProducts,
    estimatedMonthlyRevenue: `${monthlyRevenue.toLocaleString()}円`,
    conversionOptimization: [
      '権威性を活かした信頼構築',
      '技術的な深掘りレビュー',
      '成果事例の具体的紹介',
      '限定特典の付与',
      '個別相談の実施',
    ],
  };
}

function calculateMonthlyRevenue(products: string[]): number {
  let totalRevenue = 0;
  
  products.forEach(productName => {
    const product = competitorDatabase.find(c => c.name === productName);
    if (product && product.affiliateCommission) {
      // 想定成約数の計算
      const estimatedConversions = product.name.includes('七里') ? 15 : 
                                   product.price > 500000 ? 5 : 
                                   product.price > 100000 ? 10 : 50;
      
      totalRevenue += product.affiliateCommission * estimatedConversions;
    }
  });
  
  return totalRevenue;
}