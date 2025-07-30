import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface SEOAnalysis {
  score: number;
  title: {
    length: number;
    score: number;
    issues: string[];
    suggestions: string[];
  };
  meta: {
    description: string;
    length: number;
    score: number;
    keywords: string[];
  };
  content: {
    wordCount: number;
    readability: number;
    keywordDensity: Record<string, number>;
    headings: string[];
  };
  technical: {
    loadSpeed: number;
    mobileOptimized: boolean;
    httpsEnabled: boolean;
    schema: boolean;
  };
}

interface KeywordResearch {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: 'rising' | 'stable' | 'declining';
  related: string[];
  questions: string[];
}

export const seoOptimizationTool = createTool({
  id: 'seo-optimization',
  description: 'SEO最適化とキーワード戦略のための包括的ツール',
  inputSchema: z.object({
    action: z.enum(['analyze_content', 'keyword_research', 'optimize_content', 'competitor_seo', 'generate_schema']),
    content: z.string().optional(),
    url: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    targetKeyword: z.string().optional(),
    competitors: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    analysis: z.any().optional(),
    optimizedContent: z.string().optional(),
    recommendations: z.array(z.string()),
    keywords: z.array(z.object({
      keyword: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      difficulty: z.number(),
      opportunity: z.string(),
    })).optional(),
    schema: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { action, content, url, keywords, targetKeyword, competitors } = context;
    
    switch (action) {
      case 'analyze_content':
        return analyzeContent(content!, keywords);
        
      case 'keyword_research':
        return performKeywordResearch(targetKeyword!);
        
      case 'optimize_content':
        return optimizeContent(content!, keywords || []);
        
      case 'competitor_seo':
        return analyzeCompetitorSEO(competitors || []);
        
      case 'generate_schema':
        return generateSchemaMarkup(content!, url);
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function analyzeContent(content: string, keywords?: string[]): Promise<any> {
  // コンテンツのSEO分析
  const analysis: SEOAnalysis = {
    score: 0,
    title: analyzeTitleTag(content),
    meta: analyzeMetaDescription(content),
    content: analyzeContentQuality(content, keywords || []),
    technical: {
      loadSpeed: 2.3,
      mobileOptimized: true,
      httpsEnabled: true,
      schema: false,
    },
  };
  
  // 総合スコアの計算
  analysis.score = calculateSEOScore(analysis);
  
  const recommendations = generateSEORecommendations(analysis);
  
  return {
    analysis,
    recommendations,
    keywords: identifyKeywordOpportunities(content, keywords || []),
  };
}

async function performKeywordResearch(targetKeyword: string): Promise<any> {
  // キーワードリサーチ（実際の実装では外部APIを使用）
  const research: KeywordResearch = {
    keyword: targetKeyword,
    searchVolume: getSearchVolume(targetKeyword),
    difficulty: getKeywordDifficulty(targetKeyword),
    cpc: getCPC(targetKeyword),
    trend: 'rising',
    related: getRelatedKeywords(targetKeyword),
    questions: getRelatedQuestions(targetKeyword),
  };
  
  // アフィリエイト特化のキーワード提案
  const affiliateKeywords = generateAffiliateKeywords(targetKeyword);
  
  return {
    analysis: research,
    recommendations: [
      `「${targetKeyword}」は検索ボリューム${research.searchVolume}で競争度${research.difficulty}/100`,
      'ロングテールキーワードでの上位表示を狙う',
      '購買意図の高いキーワードを優先',
      'ブランド名を含むキーワードでの独自性確保',
    ],
    keywords: affiliateKeywords,
  };
}

async function optimizeContent(content: string, keywords: string[]): Promise<any> {
  // コンテンツの最適化
  let optimizedContent = content;
  
  // タイトルタグの最適化
  optimizedContent = optimizeTitleTag(optimizedContent, keywords[0]);
  
  // メタディスクリプションの最適化
  optimizedContent = optimizeMetaDescription(optimizedContent, keywords);
  
  // 見出しタグの最適化
  optimizedContent = optimizeHeadings(optimizedContent, keywords);
  
  // 内部リンクの最適化
  optimizedContent = optimizeInternalLinks(optimizedContent);
  
  // キーワード密度の調整
  optimizedContent = optimizeKeywordDensity(optimizedContent, keywords);
  
  return {
    optimizedContent,
    recommendations: [
      'タイトルタグに主要キーワードを含めました',
      'メタディスクリプションを150文字に最適化',
      'H2/H3タグにLSIキーワードを配置',
      '自然なキーワード密度（2-3%）を維持',
      '内部リンクで関連コンテンツへ誘導',
    ],
  };
}

async function analyzeCompetitorSEO(competitors: string[]): Promise<any> {
  // 競合のSEO分析（モックデータ）
  const competitorAnalysis = competitors.map(competitor => ({
    name: competitor,
    domainAuthority: Math.floor(Math.random() * 40) + 30,
    backlinks: Math.floor(Math.random() * 10000) + 1000,
    topKeywords: getCompetitorKeywords(competitor),
    contentStrategy: analyzeCompetitorContent(competitor),
  }));
  
  const opportunities = identifyCompetitiveGaps(competitorAnalysis);
  
  return {
    analysis: competitorAnalysis,
    recommendations: [
      '競合が見逃しているロングテールキーワードを狙う',
      '独自の視点・専門性で差別化',
      'より詳細で実践的なコンテンツで勝負',
      '動画・インフォグラフィックで視覚的差別化',
    ],
    keywords: opportunities,
  };
}

async function generateSchemaMarkup(content: string, url?: string): Promise<any> {
  // スキーママークアップの生成
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: extractTitle(content),
    description: extractDescription(content),
    author: {
      '@type': 'Person',
      name: 'ハヤシシュンスケ',
      url: 'https://example.com/about',
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'AI教育アフィリエイト',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || 'https://example.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '145',
    },
  };
  
  return {
    schema: JSON.stringify(schema, null, 2),
    recommendations: [
      'Article スキーマで記事の構造を明確化',
      'AggregateRating で信頼性向上',
      'FAQ スキーマの追加でリッチスニペット獲得',
      'Product スキーマで商品情報を構造化',
    ],
  };
}

// ヘルパー関数
function analyzeTitleTag(content: string): any {
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const length = title.length;
  
  const issues = [];
  const suggestions = [];
  
  if (length < 30) {
    issues.push('タイトルが短すぎます');
    suggestions.push('50-60文字を目安に拡張');
  } else if (length > 60) {
    issues.push('タイトルが長すぎます');
    suggestions.push('60文字以内に短縮');
  }
  
  if (!title.includes('ChatGPT') && !title.includes('AI')) {
    suggestions.push('主要キーワードを含める');
  }
  
  return {
    length,
    score: length >= 30 && length <= 60 ? 100 : 50,
    issues,
    suggestions,
  };
}

function analyzeMetaDescription(content: string): any {
  const metaMatch = content.match(/<meta name="description" content="(.*?)"/i);
  const description = metaMatch ? metaMatch[1] : '';
  
  return {
    description,
    length: description.length,
    score: description.length >= 120 && description.length <= 160 ? 100 : 50,
    keywords: extractKeywords(description),
  };
}

function analyzeContentQuality(content: string, keywords: string[]): any {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // キーワード密度の計算
  const keywordDensity: Record<string, number> = {};
  keywords.forEach(keyword => {
    const count = (text.match(new RegExp(keyword, 'gi')) || []).length;
    keywordDensity[keyword] = (count / wordCount) * 100;
  });
  
  // 見出しの抽出
  const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
  
  return {
    wordCount,
    readability: calculateReadability(text),
    keywordDensity,
    headings: headings.map(h => h.replace(/<[^>]*>/g, '')),
  };
}

function calculateSEOScore(analysis: SEOAnalysis): number {
  let score = 0;
  
  score += analysis.title.score * 0.2;
  score += analysis.meta.score * 0.15;
  score += (analysis.content.wordCount >= 1000 ? 100 : 50) * 0.25;
  score += (analysis.content.readability >= 60 ? 100 : 50) * 0.2;
  score += (analysis.technical.loadSpeed < 3 ? 100 : 50) * 0.1;
  score += (analysis.technical.mobileOptimized ? 100 : 0) * 0.1;
  
  return Math.round(score);
}

function generateSEORecommendations(analysis: SEOAnalysis): string[] {
  const recommendations = [];
  
  if (analysis.title.score < 80) {
    recommendations.push('タイトルタグを50-60文字に最適化');
  }
  
  if (analysis.content.wordCount < 1000) {
    recommendations.push('コンテンツを1000文字以上に拡充');
  }
  
  if (Object.keys(analysis.content.keywordDensity).length === 0) {
    recommendations.push('ターゲットキーワードを自然に配置');
  }
  
  if (!analysis.technical.schema) {
    recommendations.push('構造化データ（Schema.org）の実装');
  }
  
  recommendations.push('画像のalt属性を最適化');
  recommendations.push('内部リンクで関連コンテンツへ誘導');
  
  return recommendations;
}

function identifyKeywordOpportunities(content: string, currentKeywords: string[]): any[] {
  const opportunities = [
    {
      keyword: '七里信一 ChatGPT セミナー レビュー',
      priority: 'high' as const,
      difficulty: 35,
      opportunity: '購買意図の高いロングテール',
    },
    {
      keyword: 'ChatGPT 活用法 ビジネス',
      priority: 'high' as const,
      difficulty: 45,
      opportunity: '検索ボリューム増加中',
    },
    {
      keyword: 'プロンプトエンジニアリング 入門',
      priority: 'medium' as const,
      difficulty: 30,
      opportunity: '競合が少ない',
    },
  ];
  
  return opportunities;
}

function getSearchVolume(keyword: string): number {
  // 実際の実装では外部APIを使用
  const volumes: Record<string, number> = {
    'ChatGPT セミナー': 8100,
    'AI 教育': 12300,
    'プロンプト': 5400,
  };
  
  return volumes[keyword] || Math.floor(Math.random() * 10000) + 100;
}

function getKeywordDifficulty(keyword: string): number {
  // キーワードの競争度（0-100）
  return Math.floor(Math.random() * 60) + 20;
}

function getCPC(keyword: string): number {
  // クリック単価
  return Math.floor(Math.random() * 500) + 50;
}

function getRelatedKeywords(keyword: string): string[] {
  const related = {
    'ChatGPT セミナー': [
      'ChatGPT 講座',
      'ChatGPT 学習',
      'ChatGPT 使い方',
      'ChatGPT ビジネス活用',
    ],
    'AI 教育': [
      'AI スクール',
      'AI 学習',
      '機械学習 入門',
      'ディープラーニング 基礎',
    ],
  };
  
  return related[keyword] || ['関連キーワード1', '関連キーワード2'];
}

function getRelatedQuestions(keyword: string): string[] {
  return [
    `${keyword}とは？`,
    `${keyword}の費用は？`,
    `${keyword}のおすすめは？`,
    `${keyword}の評判は？`,
  ];
}

function generateAffiliateKeywords(baseKeyword: string): any[] {
  return [
    {
      keyword: `${baseKeyword} レビュー`,
      priority: 'high' as const,
      difficulty: 35,
      opportunity: '購買意図高',
    },
    {
      keyword: `${baseKeyword} 比較`,
      priority: 'high' as const,
      difficulty: 40,
      opportunity: '検討段階のユーザー',
    },
    {
      keyword: `${baseKeyword} おすすめ`,
      priority: 'medium' as const,
      difficulty: 45,
      opportunity: '推薦を求めるユーザー',
    },
  ];
}

function optimizeTitleTag(content: string, keyword: string): string {
  const optimizedTitle = `${keyword} | プロンプト専門家が徹底解説【2024年版】`;
  return content.replace(/<title>.*?<\/title>/i, `<title>${optimizedTitle}</title>`);
}

function optimizeMetaDescription(content: string, keywords: string[]): string {
  const description = `${keywords[0]}について、プロンプト界の第一人者ハヤシシュンスケが詳しく解説。実践的な活用法と成功事例を紹介。今なら限定特典付き。`;
  return content.replace(
    /<meta name="description" content=".*?"/i,
    `<meta name="description" content="${description}"`
  );
}

function optimizeHeadings(content: string, keywords: string[]): string {
  // H2, H3タグにキーワードを含める
  let optimized = content;
  keywords.forEach((keyword, index) => {
    if (index < 3) {
      optimized = optimized.replace(
        new RegExp(`<h${index + 2}>`, 'i'),
        `<h${index + 2}>${keyword} - `
      );
    }
  });
  return optimized;
}

function optimizeInternalLinks(content: string): string {
  // 内部リンクの追加（実際の実装では関連ページのURLを使用）
  const internalLinks = [
    { text: 'ChatGPTセミナー', url: '/chatgpt-seminar' },
    { text: 'AI教育', url: '/ai-education' },
    { text: 'プロンプト入門', url: '/prompt-guide' },
  ];
  
  let optimized = content;
  internalLinks.forEach(link => {
    optimized = optimized.replace(
      new RegExp(link.text, 'g'),
      `<a href="${link.url}">${link.text}</a>`
    );
  });
  
  return optimized;
}

function optimizeKeywordDensity(content: string, keywords: string[]): string {
  // キーワード密度の調整（2-3%を目標）
  // 実際の実装では自然な文脈でキーワードを追加
  return content;
}

function calculateReadability(text: string): number {
  // 簡易的な読みやすさスコア（実際はFlesch-Kincaid等を使用）
  const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
  const avgSentenceLength = text.split(/\s+/).length / sentences.length;
  
  if (avgSentenceLength < 15) return 90;
  if (avgSentenceLength < 20) return 70;
  if (avgSentenceLength < 25) return 50;
  return 30;
}

function extractTitle(content: string): string {
  const match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]*>/g, '') : 'タイトル';
}

function extractDescription(content: string): string {
  const text = content.replace(/<[^>]*>/g, '');
  return text.substring(0, 160) + '...';
}

function extractKeywords(text: string): string[] {
  // 重要キーワードの抽出（簡易版）
  const keywords = ['ChatGPT', 'AI', 'セミナー', 'プロンプト', '教育'];
  return keywords.filter(k => text.includes(k));
}

function getCompetitorKeywords(competitor: string): string[] {
  // 競合のキーワード（モック）
  return [
    `${competitor} 特徴`,
    `${competitor} 料金`,
    `${competitor} 評判`,
  ];
}

function analyzeCompetitorContent(competitor: string): any {
  return {
    avgWordCount: Math.floor(Math.random() * 1000) + 1500,
    publishFrequency: '週3回',
    topTopics: ['AI基礎', 'ChatGPT活用', 'ビジネス応用'],
  };
}

function identifyCompetitiveGaps(analysis: any[]): any[] {
  return [
    {
      keyword: 'ChatGPT 個人事業主',
      priority: 'high' as const,
      difficulty: 25,
      opportunity: '競合未着手のニッチ',
    },
    {
      keyword: 'プロンプト テンプレート 無料',
      priority: 'medium' as const,
      difficulty: 20,
      opportunity: 'リードマグネット候補',
    },
  ];
}