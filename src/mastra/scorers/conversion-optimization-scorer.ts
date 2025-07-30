import { createScorer } from '@mastra/core/scorers';
import { z } from 'zod';

/**
 * コンバージョン最適化スコアラー
 * 
 * アフィリエイトコンテンツのコンバージョン効果を予測・評価
 */
export const conversionOptimizationScorer = createScorer({
  id: 'conversion-optimization',
  description: 'アフィリエイトコンテンツのコンバージョン効果を評価',
  inputSchema: z.object({
    content: z.string(),
    contentType: z.enum(['blog', 'email', 'social', 'landing_page', 'youtube']),
    targetAudience: z.string().optional(),
    product: z.string().optional(),
  }),
  outputSchema: z.object({
    conversionScore: z.number().min(0).max(100),
    factors: z.object({
      emotionalAppeal: z.number().min(0).max(100),
      urgency: z.number().min(0).max(100),
      socialProof: z.number().min(0).max(100),
      valueProposition: z.number().min(0).max(100),
      callToAction: z.number().min(0).max(100),
      trustBuilding: z.number().min(0).max(100),
    }),
    predictions: z.object({
      estimatedCTR: z.number(),
      estimatedConversionRate: z.number(),
      revenueProjection: z.number(),
    }),
    optimizationSuggestions: z.array(z.string()),
  }),

  score: async ({ content, contentType, targetAudience, product }) => {
    // 各要素の評価
    const factors = {
      emotionalAppeal: evaluateEmotionalAppeal(content),
      urgency: evaluateUrgency(content),
      socialProof: evaluateSocialProof(content),
      valueProposition: evaluateValueProposition(content, product),
      callToAction: evaluateCallToAction(content, contentType),
      trustBuilding: evaluateTrustBuilding(content),
    };

    // 重み付きスコア計算
    const weights = getWeightsByContentType(contentType);
    const conversionScore = calculateWeightedScore(factors, weights);

    // 予測計算
    const predictions = calculatePredictions(conversionScore, contentType);

    // 最適化提案
    const optimizationSuggestions = generateOptimizationSuggestions(
      factors, 
      contentType, 
      content
    );

    return {
      conversionScore: Math.round(conversionScore),
      factors,
      predictions,
      optimizationSuggestions,
    };
  },
});

/**
 * 感情的訴求力評価
 */
function evaluateEmotionalAppeal(content: string): number {
  let score = 50;

  // ポジティブな感情語
  const positiveWords = [
    '成功', '実現', '変革', '向上', '成長', '達成',
    '素晴らしい', '驚くべき', '画期的', '効果的'
  ];

  // ネガティブな感情語（問題提起）
  const problemWords = [
    '困っている', '悩み', '問題', '課題', '不安',
    '失敗', '損失', '機会損失'
  ];

  const positiveCount = positiveWords.filter(word => 
    content.includes(word)
  ).length;

  const problemCount = problemWords.filter(word => 
    content.includes(word)
  ).length;

  score += (positiveCount * 8) + (problemCount * 5);

  // ストーリーテリング要素
  if (content.includes('実際に') || content.includes('例えば')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * 緊急性評価
 */
function evaluateUrgency(content: string): number {
  let score = 30;

  const urgencyWords = [
    '今すぐ', '限定', '期間限定', 'わずか', '残り',
    '今だけ', '特別', '締切', '最後のチャンス'
  ];

  const urgencyCount = urgencyWords.filter(word => 
    content.includes(word)
  ).length;

  score += urgencyCount * 15;

  // 数量限定表現
  if (/\d+名様限定|\d+個限定/.test(content)) {
    score += 20;
  }

  // 時間制限
  if (/\d+日間|\d+時間/.test(content)) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * 社会的証明評価
 */
function evaluateSocialProof(content: string): number {
  let score = 40;

  // 顧客の声・証言
  if (content.includes('お客様の声') || content.includes('体験談')) {
    score += 20;
  }

  // 実績・統計
  const statsPattern = /\d+人|\d+%|\d+倍/;
  if (statsPattern.test(content)) {
    score += 15;
  }

  // 有名人・権威者の推薦
  if (content.includes('推薦') || content.includes('監修')) {
    score += 15;
  }

  // レビュー・評価
  if (content.includes('★') || content.includes('評価')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * 価値提案評価
 */
function evaluateValueProposition(content: string, product?: string): number {
  let score = 45;

  // ベネフィット表現
  const benefitWords = [
    '効果', 'メリット', '利益', '向上', '改善',
    '解決', '短縮', '節約', '増加'
  ];

  const benefitCount = benefitWords.filter(word => 
    content.includes(word)
  ).length;

  score += benefitCount * 8;

  // 具体的な数値
  if (/\d+%向上|\d+倍|\d+万円/.test(content)) {
    score += 20;
  }

  // 独自性・差別化
  if (content.includes('他にはない') || content.includes('独自の')) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * CTA評価
 */
function evaluateCallToAction(content: string, contentType: string): number {
  let score = 35;

  const ctaWords = [
    '詳細はこちら', '今すぐ申し込み', 'クリック',
    '無料で試す', 'ダウンロード', '登録する',
    '購入する', '始める'
  ];

  const ctaCount = ctaWords.filter(word => 
    content.includes(word)
  ).length;

  score += ctaCount * 20;

  // CTA配置の評価
  const contentLength = content.length;
  const ctaPosition = content.search(new RegExp(ctaWords.join('|')));
  
  if (ctaPosition > contentLength * 0.7) {
    score += 10; // 後半にCTAがある
  }

  // コンテンツタイプ別評価
  if (contentType === 'email' && ctaCount >= 2) {
    score += 10; // メールは複数CTAが効果的
  }

  return Math.min(100, score);
}

/**
 * 信頼構築評価
 */
function evaluateTrustBuilding(content: string): number {
  let score = 40;

  // 透明性
  if (content.includes('返金保証') || content.includes('サポート')) {
    score += 15;
  }

  // 実績・経験
  if (content.includes('年の経験') || content.includes('実績')) {
    score += 10;
  }

  // 連絡先・会社情報
  if (content.includes('お問い合わせ') || content.includes('会社概要')) {
    score += 10;
  }

  // 認定・資格
  if (content.includes('認定') || content.includes('資格')) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * コンテンツタイプ別重み
 */
function getWeightsByContentType(contentType: string): any {
  const weights = {
    blog: {
      emotionalAppeal: 0.2,
      urgency: 0.1,
      socialProof: 0.2,
      valueProposition: 0.25,
      callToAction: 0.15,
      trustBuilding: 0.1,
    },
    email: {
      emotionalAppeal: 0.25,
      urgency: 0.2,
      socialProof: 0.15,
      valueProposition: 0.2,
      callToAction: 0.15,
      trustBuilding: 0.05,
    },
    landing_page: {
      emotionalAppeal: 0.15,
      urgency: 0.2,
      socialProof: 0.25,
      valueProposition: 0.2,
      callToAction: 0.15,
      trustBuilding: 0.05,
    },
    social: {
      emotionalAppeal: 0.3,
      urgency: 0.25,
      socialProof: 0.2,
      valueProposition: 0.15,
      callToAction: 0.1,
      trustBuilding: 0,
    },
    youtube: {
      emotionalAppeal: 0.25,
      urgency: 0.15,
      socialProof: 0.2,
      valueProposition: 0.25,
      callToAction: 0.1,
      trustBuilding: 0.05,
    },
  };

  return weights[contentType] || weights.blog;
}

/**
 * 重み付きスコア計算
 */
function calculateWeightedScore(factors: any, weights: any): number {
  return Object.entries(factors).reduce(
    (sum, [key, score]) => sum + (score as number) * weights[key],
    0
  );
}

/**
 * 予測計算
 */
function calculatePredictions(conversionScore: number, contentType: string): any {
  // ベースライン値（コンテンツタイプ別）
  const baselines = {
    blog: { ctr: 2.5, conversion: 1.2 },
    email: { ctr: 15.0, conversion: 3.5 },
    landing_page: { ctr: 5.0, conversion: 2.8 },
    social: { ctr: 1.8, conversion: 0.8 },
    youtube: { ctr: 8.0, conversion: 2.0 },
  };

  const baseline = baselines[contentType] || baselines.blog;
  const multiplier = conversionScore / 75; // 75をベースラインとする

  return {
    estimatedCTR: Math.round(baseline.ctr * multiplier * 100) / 100,
    estimatedConversionRate: Math.round(baseline.conversion * multiplier * 100) / 100,
    revenueProjection: Math.round(baseline.conversion * multiplier * 50000), // 5万円単価想定
  };
}

/**
 * 最適化提案生成
 */
function generateOptimizationSuggestions(
  factors: any, 
  contentType: string, 
  content: string
): string[] {
  const suggestions = [];

  // 各要素のスコアに基づく提案
  if (factors.emotionalAppeal < 70) {
    suggestions.push('より強い感情的な訴求を追加してください（成功事例、変革の物語など）');
  }

  if (factors.urgency < 60) {
    suggestions.push('緊急性を高める要素を追加してください（期間限定、数量限定など）');
  }

  if (factors.socialProof < 70) {
    suggestions.push('社会的証明を強化してください（お客様の声、実績数値、評価など）');
  }

  if (factors.valueProposition < 70) {
    suggestions.push('価値提案をより明確にしてください（具体的なベネフィット、数値化された効果）');
  }

  if (factors.callToAction < 70) {
    suggestions.push('行動喚起をより強力にしてください（明確なCTA、複数のタッチポイント）');
  }

  if (factors.trustBuilding < 60) {
    suggestions.push('信頼性を高める要素を追加してください（保証、実績、透明性）');
  }

  // コンテンツタイプ別提案
  if (contentType === 'email' && !content.includes('PS:')) {
    suggestions.push('追伸（PS）を追加してもう一度訴求してください');
  }

  if (contentType === 'landing_page' && factors.socialProof < 80) {
    suggestions.push('ランディングページには必ず顧客の証言を複数配置してください');
  }

  return suggestions;
}