import { createScorer } from '@mastra/core/scorers';
import { z } from 'zod';

/**
 * エージェントパフォーマンススコアラー
 * 
 * エージェントの出力品質を多角的に評価し、継続的な改善を支援
 */
export const agentPerformanceScorer = createScorer({
  id: 'agent-performance',
  description: 'エージェントの出力品質と効果を評価',
  inputSchema: z.object({
    agentId: z.string(),
    task: z.string(),
    output: z.string(),
    context: z.object({
      executionTime: z.number().optional(),
      toolsUsed: z.array(z.string()).optional(),
      complexity: z.enum(['low', 'medium', 'high']).optional(),
    }).optional(),
  }),
  outputSchema: z.object({
    overallScore: z.number().min(0).max(100),
    dimensions: z.object({
      accuracy: z.number().min(0).max(100),
      completeness: z.number().min(0).max(100),
      relevance: z.number().min(0).max(100),
      clarity: z.number().min(0).max(100),
      actionability: z.number().min(0).max(100),
      efficiency: z.number().min(0).max(100),
    }),
    feedback: z.array(z.string()),
    recommendations: z.array(z.string()),
    benchmarkComparison: z.object({
      aboveAverage: z.boolean(),
      percentile: z.number(),
      topPerformer: z.boolean(),
    }),
  }),
  
  score: async ({ agentId, task, output, context }) => {
    // 各次元での評価
    const dimensions = {
      accuracy: evaluateAccuracy(output, task),
      completeness: evaluateCompleteness(output, task),
      relevance: evaluateRelevance(output, task),
      clarity: evaluateClarity(output),
      actionability: evaluateActionability(output),
      efficiency: evaluateEfficiency(context),
    };

    // 総合スコア計算（重み付き平均）
    const weights = {
      accuracy: 0.25,
      completeness: 0.20,
      relevance: 0.20,
      clarity: 0.15,
      actionability: 0.15,
      efficiency: 0.05,
    };

    const overallScore = Object.entries(dimensions).reduce(
      (sum, [key, score]) => sum + score * weights[key],
      0
    );

    // フィードバック生成
    const feedback = generateFeedback(dimensions, agentId);
    const recommendations = generateRecommendations(dimensions, agentId);

    // ベンチマーク比較
    const benchmarkComparison = await compareToBenchmark(
      agentId,
      overallScore,
      dimensions
    );

    return {
      overallScore: Math.round(overallScore),
      dimensions,
      feedback,
      recommendations,
      benchmarkComparison,
    };
  },
});

/**
 * 正確性評価
 */
function evaluateAccuracy(output: string, task: string): number {
  let score = 80; // ベーススコア

  // 事実に基づく情報の確認
  if (output.includes('データに基づく') || output.includes('統計')) {
    score += 10;
  }

  // 根拠のない断言を検出
  const unsupportedClaims = [
    '必ず', '絶対に', '100%', '確実に'
  ];
  
  const hasUnsupportedClaims = unsupportedClaims.some(claim =>
    output.includes(claim)
  );
  
  if (hasUnsupportedClaims) {
    score -= 15;
  }

  // 情報源の明示
  if (output.includes('出典') || output.includes('参考')) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 完全性評価
 */
function evaluateCompleteness(output: string, task: string): number {
  let score = 70;

  // タスクキーワードのカバレッジ
  const taskKeywords = extractKeywords(task);
  const outputKeywords = extractKeywords(output);
  
  const coverage = taskKeywords.filter(keyword =>
    outputKeywords.includes(keyword)
  ).length / taskKeywords.length;

  score += coverage * 30;

  // 構造的完全性（見出し、段落構成）
  if (output.includes('#') || output.includes('##')) {
    score += 5;
  }

  // 結論の存在
  if (output.includes('まとめ') || output.includes('結論')) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 関連性評価
 */
function evaluateRelevance(output: string, task: string): number {
  let score = 75;

  // タスクとの関連度
  const taskTokens = task.toLowerCase().split(/\s+/);
  const outputTokens = output.toLowerCase().split(/\s+/);
  
  const commonTokens = taskTokens.filter(token =>
    outputTokens.includes(token) && token.length > 3
  );
  
  const relevanceScore = (commonTokens.length / taskTokens.length) * 100;
  score = (score + relevanceScore) / 2;

  // アフィリエイト関連性
  const affiliateTerms = [
    'アフィリエイト', 'マーケティング', 'コンテンツ',
    'SEO', 'コンバージョン', 'ROI'
  ];
  
  const hasAffiliateContext = affiliateTerms.some(term =>
    output.includes(term)
  );
  
  if (hasAffiliateContext) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 明確性評価
 */
function evaluateClarity(output: string): number {
  let score = 80;

  // 文章の長さチェック
  const sentences = output.split(/[。！？]/).filter(s => s.trim());
  const avgSentenceLength = sentences.reduce((sum, s) => 
    sum + s.length, 0) / sentences.length;
  
  // 適切な文章長（50-100文字）
  if (avgSentenceLength >= 50 && avgSentenceLength <= 100) {
    score += 10;
  } else if (avgSentenceLength > 150) {
    score -= 15;
  }

  // 専門用語の説明
  const technicalTerms = ['ChatGPT', 'AI', 'API', 'SEO'];
  const hasExplanations = technicalTerms.some(term =>
    output.includes(term + 'とは') || output.includes(term + 'は')
  );
  
  if (hasExplanations) {
    score += 5;
  }

  // 箇条書きや番号リストの使用
  if (output.includes('1.') || output.includes('・')) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 実行可能性評価
 */
function evaluateActionability(output: string): number {
  let score = 70;

  // 具体的なアクション項目
  const actionWords = [
    '実装', '作成', '設定', '実行', '分析',
    '最適化', '改善', '測定', '監視'
  ];
  
  const hasActionItems = actionWords.some(word =>
    output.includes(word)
  );
  
  if (hasActionItems) {
    score += 15;
  }

  // ステップバイステップの指示
  if (output.includes('ステップ') || output.includes('手順')) {
    score += 10;
  }

  // 数値目標や期限
  const hasMetrics = /\d+%|\d+円|\d+日/.test(output);
  if (hasMetrics) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 効率性評価
 */
function evaluateEfficiency(context: any): number {
  if (!context) return 75;

  let score = 75;

  // 実行時間評価
  if (context.executionTime) {
    if (context.executionTime < 5000) { // 5秒未満
      score += 15;
    } else if (context.executionTime > 30000) { // 30秒超
      score -= 10;
    }
  }

  // ツール使用効率
  if (context.toolsUsed) {
    const toolCount = context.toolsUsed.length;
    if (toolCount > 0 && toolCount <= 3) {
      score += 10;
    } else if (toolCount > 5) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * フィードバック生成
 */
function generateFeedback(dimensions: any, agentId: string): string[] {
  const feedback = [];

  if (dimensions.accuracy < 70) {
    feedback.push('情報の正確性を向上させるため、信頼できるソースの引用を増やしてください');
  }

  if (dimensions.completeness < 70) {
    feedback.push('タスクの要求事項をより包括的にカバーしてください');
  }

  if (dimensions.clarity < 70) {
    feedback.push('文章をより簡潔で理解しやすくしてください');
  }

  if (dimensions.actionability < 70) {
    feedback.push('より具体的で実行可能なアクション項目を含めてください');
  }

  // エージェント固有のフィードバック
  if (agentId === 'data-scientist' && dimensions.accuracy > 90) {
    feedback.push('優秀な統計分析能力を発揮しています');
  }

  if (agentId === 'visual-designer' && dimensions.clarity > 85) {
    feedback.push('ビジュアル説明が非常に明確です');
  }

  return feedback;
}

/**
 * 改善提案生成
 */
function generateRecommendations(dimensions: any, agentId: string): string[] {
  const recommendations = [];

  const lowestScore = Math.min(...Object.values(dimensions));
  const lowestDimension = Object.entries(dimensions).find(
    ([, score]) => score === lowestScore
  )?.[0];

  switch (lowestDimension) {
    case 'accuracy':
      recommendations.push('事実確認プロセスを強化');
      recommendations.push('参考文献の引用を標準化');
      break;
    case 'completeness':
      recommendations.push('チェックリストベースの出力レビュー');
      recommendations.push('タスク要件の詳細分析');
      break;
    case 'clarity':
      recommendations.push('文章構造の改善');
      recommendations.push('専門用語の解説追加');
      break;
  }

  return recommendations;
}

/**
 * ベンチマーク比較
 */
async function compareToBenchmark(
  agentId: string,
  score: number,
  dimensions: any
): Promise<any> {
  // 過去のパフォーマンスデータとの比較
  // 実際の実装では、データベースから履歴データを取得
  
  const avgScore = 75; // 平均スコア
  const topPerformerThreshold = 90;
  
  return {
    aboveAverage: score > avgScore,
    percentile: Math.round((score / 100) * 100),
    topPerformer: score >= topPerformerThreshold,
  };
}

/**
 * キーワード抽出
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10); // 上位10キーワード
}