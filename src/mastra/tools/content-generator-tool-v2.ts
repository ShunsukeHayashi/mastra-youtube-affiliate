import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Runtime Context型定義
export type ContentRuntimeContext = {
  'target-market': 'jp' | 'us' | 'global';
  'content-style': 'formal' | 'casual' | 'technical';
  'revenue-target': 'beginner' | 'intermediate' | 'advanced';
  'compliance-mode': 'strict' | 'standard';
  'language': 'ja' | 'en';
};

export const contentGeneratorToolV2 = createTool({
  id: 'generate-affiliate-content-v2',
  description: 'ランタイムコンテキストに対応したアフィリエイトコンテンツ生成',
  inputSchema: z.object({
    contentType: z.enum(['blog', 'twitter', 'email', 'youtube_script', 'comparison']).describe('生成するコンテンツのタイプ'),
    productName: z.string().describe('推薦する商品・サービス名'),
    keyPoints: z.array(z.string()).describe('強調したいポイント'),
  }),
  outputSchema: z.object({
    content: z.string(),
    title: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    contextInfo: z.object({
      market: z.string(),
      style: z.string(),
      language: z.string(),
    }),
  }),
  execute: async ({ context, runtimeContext }) => {
    const { contentType, productName, keyPoints } = context;
    
    // ランタイムコンテキストから設定を取得
    const targetMarket = runtimeContext.get('target-market') || 'jp';
    const contentStyle = runtimeContext.get('content-style') || 'formal';
    const revenueTarget = runtimeContext.get('revenue-target') || 'intermediate';
    const complianceMode = runtimeContext.get('compliance-mode') || 'standard';
    const language = runtimeContext.get('language') || 'ja';
    
    // 市場に応じたコンテンツカスタマイズ
    const marketSpecificContent = getMarketSpecificContent(targetMarket, productName, language);
    const styleAdjustedContent = adjustContentStyle(marketSpecificContent, contentStyle);
    const complianceCheckedContent = applyComplianceRules(styleAdjustedContent, complianceMode);
    
    let content = '';
    let title = '';
    let hashtags: string[] = [];
    let cta = '';
    let seoKeywords: string[] = [];

    switch (contentType) {
      case 'blog':
        ({ content, title, seoKeywords, cta } = generateBlogPost(
          productName, 
          keyPoints, 
          language, 
          contentStyle,
          revenueTarget
        ));
        break;
        
      case 'twitter':
        ({ content, hashtags } = generateTwitterContent(
          productName, 
          keyPoints,
          language,
          targetMarket
        ));
        break;
        
      case 'email':
        ({ content, title, cta } = generateEmailContent(
          productName, 
          keyPoints,
          language,
          contentStyle,
          revenueTarget
        ));
        break;
    }

    return {
      content: complianceCheckedContent || content,
      title,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      cta,
      seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
      contextInfo: {
        market: targetMarket,
        style: contentStyle,
        language,
      },
    };
  },
});

function getMarketSpecificContent(market: string, product: string, language: string): string {
  const marketContent = {
    jp: {
      greeting: language === 'ja' ? 'いつもありがとうございます。' : 'Thank you for your continued support.',
      trustSignals: language === 'ja' ? '日本国内での実績多数' : 'Proven track record in Japan',
    },
    us: {
      greeting: 'Hey there!',
      trustSignals: 'Trusted by thousands of US professionals',
    },
    global: {
      greeting: language === 'ja' ? 'こんにちは！' : 'Hello!',
      trustSignals: language === 'ja' ? '世界中で愛用されています' : 'Used by professionals worldwide',
    },
  };
  
  return marketContent[market]?.greeting || '';
}

function adjustContentStyle(content: string, style: string): string {
  // スタイルに応じた調整
  switch (style) {
    case 'formal':
      return content.replace(/！/g, '。').replace(/Hey/g, 'Greetings');
    case 'casual':
      return content.replace(/。/g, '！').replace(/Greetings/g, 'Hey');
    case 'technical':
      return content + '\n\n【技術的詳細】\n';
    default:
      return content;
  }
}

function applyComplianceRules(content: string, mode: string): string {
  if (mode === 'strict') {
    // 厳格なコンプライアンスモード
    content += '\n\n【重要】本記事にはアフィリエイトリンクが含まれています。';
    content = content.replace(/必ず/g, '');
    content = content.replace(/絶対/g, '');
    content = content.replace(/保証/g, '');
  }
  return content;
}

function generateBlogPost(
  product: string, 
  keyPoints: string[], 
  language: string,
  style: string,
  revenueTarget: string
): any {
  const titleTemplates = {
    ja: {
      beginner: `初心者でも分かる${product}の魅力`,
      intermediate: `${product}で次のレベルへ：実践ガイド`,
      advanced: `プロが語る${product}の真価と活用術`,
    },
    en: {
      beginner: `${product}: A Beginner's Complete Guide`,
      intermediate: `Level Up with ${product}: Practical Strategies`,
      advanced: `Expert Analysis: Maximizing ${product} ROI`,
    },
  };
  
  const title = titleTemplates[language]?.[revenueTarget] || `${product}レビュー`;
  
  const intro = language === 'ja' 
    ? `AI時代において、適切な学習リソースを選ぶことは成功への第一歩です。`
    : `In the AI era, choosing the right learning resources is the first step to success.`;
  
  const content = `
${intro}

${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}
`;
  
  const seoKeywords = language === 'ja'
    ? [`${product} レビュー`, `${product} 評判`, 'AI教育']
    : [`${product} review`, `${product} testimonials`, 'AI education'];
    
  const cta = language === 'ja'
    ? '詳細を確認して次のステップへ'
    : 'Check details and take the next step';
  
  return { content, title, seoKeywords, cta };
}

function generateTwitterContent(
  product: string,
  keyPoints: string[],
  language: string,
  market: string
): any {
  const marketHashtags = {
    jp: ['#AI活用', '#ChatGPT', '#プロンプト'],
    us: ['#AIEducation', '#ChatGPT', '#PromptEngineering'],
    global: ['#AI', '#ChatGPT', '#Learning'],
  };
  
  const content = language === 'ja'
    ? `🚀 ${product}を実際に検証しました！\n\n${keyPoints[0]}`
    : `🚀 Just reviewed ${product}!\n\n${keyPoints[0]}`;
    
  return {
    content,
    hashtags: marketHashtags[market] || marketHashtags.global,
  };
}

function generateEmailContent(
  product: string,
  keyPoints: string[],
  language: string,
  style: string,
  revenueTarget: string
): any {
  const subjectLines = {
    ja: {
      beginner: `【初心者向け】${product}で始めるAI活用`,
      intermediate: `【実践】${product}で収益を2倍にする方法`,
      advanced: `【上級者向け】${product}の隠れた活用術`,
    },
    en: {
      beginner: `Getting Started with ${product}`,
      intermediate: `Double Your ROI with ${product}`,
      advanced: `Advanced ${product} Strategies`,
    },
  };
  
  const title = subjectLines[language]?.[revenueTarget] || product;
  
  const content = language === 'ja'
    ? `本日は、私が実際に検証した${product}についてお伝えします。`
    : `Today, I want to share my analysis of ${product}.`;
    
  const cta = language === 'ja'
    ? '今すぐ詳細を確認する →'
    : 'Check Details Now →';
  
  return { content, title, cta };
}