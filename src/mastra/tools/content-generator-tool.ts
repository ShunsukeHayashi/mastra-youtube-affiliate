import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const contentGeneratorTool = createTool({
  id: 'generate-affiliate-content',
  description: 'AIアフィリエイトマーケティング用のコンテンツを生成する',
  inputSchema: z.object({
    contentType: z.enum(['blog', 'twitter', 'email', 'youtube_script', 'comparison']).describe('生成するコンテンツのタイプ'),
    productName: z.string().describe('推薦する商品・サービス名'),
    keyPoints: z.array(z.string()).describe('強調したいポイント'),
    targetAudience: z.string().optional().describe('ターゲットオーディエンス'),
    tone: z.enum(['professional', 'friendly', 'educational', 'persuasive']).default('professional').describe('文章のトーン'),
  }),
  outputSchema: z.object({
    content: z.string(),
    title: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    const { contentType, productName, keyPoints, targetAudience, tone } = context;
    
    // コンテンツタイプに応じた生成ロジック
    let content = '';
    let title = '';
    let hashtags: string[] = [];
    let cta = '';
    let seoKeywords: string[] = [];

    switch (contentType) {
      case 'blog':
        title = `プロンプト専門家が推薦する${productName}の真価`;
        content = generateBlogPost(productName, keyPoints, tone);
        seoKeywords = [`${productName} レビュー`, `${productName} 評判`, 'AI教育', 'ChatGPT活用'];
        cta = `${productName}の詳細を確認して、AI活用スキルを次のレベルへ`;
        break;
        
      case 'twitter':
        content = generateTwitterThread(productName, keyPoints);
        hashtags = ['#AI活用', '#ChatGPT', '#プロンプトエンジニアリング', '#スキルアップ'];
        break;
        
      case 'email':
        title = `【重要】${productName}があなたのAI活用を変える理由`;
        content = generateEmailContent(productName, keyPoints, targetAudience || 'AI学習者');
        cta = '今すぐ詳細を確認する →';
        break;
        
      case 'youtube_script':
        title = `【徹底解説】${productName}を技術者視点で分析してみた`;
        content = generateYouTubeScript(productName, keyPoints);
        break;
        
      case 'comparison':
        title = `${productName} vs 競合サービス：専門家による徹底比較`;
        content = generateComparisonContent(productName, keyPoints);
        seoKeywords = [`${productName} 比較`, 'AI教育 おすすめ', 'ChatGPT講座'];
        break;
    }

    return {
      content,
      title,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      cta: cta || undefined,
      seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
    };
  },
});

function generateBlogPost(product: string, keyPoints: string[], tone: string): string {
  const intro = `
## はじめに

AI時代において、適切な学習リソースを選ぶことは成功への第一歩です。
今回は、プロンプト専門家の視点から${product}について詳しく分析します。

## なぜ${product}なのか

`;

  const mainContent = keyPoints.map((point, index) => `
### ${index + 1}. ${point}

${product}の特筆すべき点として、${point}が挙げられます。
これは他のサービスと比較して明確な差別化要因となっています。
`).join('\n');

  const conclusion = `
## まとめ

${product}は、AI活用スキルを本気で向上させたい方にとって、
投資価値の高い選択肢といえるでしょう。

技術的な観点から見ても、カリキュラムの構成と実践的なアプローチは
他のサービスと一線を画しています。
`;

  return intro + mainContent + conclusion;
}

function generateTwitterThread(product: string, keyPoints: string[]): string {
  const thread = [
    `🚀 ${product}を実際に検証してみた結果をシェアします。\n\nプロンプト専門家として、技術的な観点から分析しました。`,
    ...keyPoints.map((point, index) => `${index + 1}/ ${point}\n\nこれは本当に重要なポイントです。`),
    `結論：${product}は、AI時代のスキルアップに真剣な方にとって、非常に価値のある投資です。\n\n詳細な分析レポートはプロフィールのリンクから。`,
  ];

  return thread.join('\n\n---\n\n');
}

function generateEmailContent(product: string, keyPoints: string[], audience: string): string {
  return `
${audience}の皆様へ

いつもご購読ありがとうございます。
ハヤシシュンスケです。

本日は、私が技術的に検証し、自信を持って推薦できる
${product}についてお伝えしたいと思います。

【推薦する${keyPoints.length}つの理由】
${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

私自身、多くのAI教育サービスを分析してきましたが、
${product}は技術的な正確性と実践的な価値の両面で
突出していると断言できます。

もし、あなたが本気でAI活用スキルを身につけたいなら、
この機会を逃すべきではありません。

詳細はこちらから確認できます。
[CTAボタン]

質問があれば、いつでもお気軽にご連絡ください。

ハヤシシュンスケ
プロンプト専門家
`;
}

function generateYouTubeScript(product: string, keyPoints: string[]): string {
  return `
[オープニング]
こんにちは、ハヤシシュンスケです。
今回は${product}について、技術者の視点から徹底的に分析していきます。

[導入 - 0:30]
最近、多くの方から「どのAI教育サービスがおすすめですか？」という質問をいただきます。
今日は、その答えの一つとして${product}を詳しく見ていきましょう。

[メインコンテンツ - 1:00]
${keyPoints.map((point, index) => `
[セクション${index + 1} - ${2 + index * 3}:00]
${index + 1}つ目のポイントは「${point}」です。
これについて、実際のデモを交えながら説明していきます。
[画面共有でデモンストレーション]
`).join('\n')}

[まとめ - 15:00]
今回は${product}について技術的な観点から分析しました。
結論として、本気でAIスキルを身につけたい方には
強く推薦できるサービスだと言えます。

[エンディング]
詳細なレポートは概要欄のリンクから確認できます。
チャンネル登録と高評価、よろしくお願いします。
`;
}

function generateComparisonContent(product: string, keyPoints: string[]): string {
  return `
## ${product} vs 競合サービス：詳細比較分析

### 評価基準
- 技術的正確性
- カリキュラムの実践性
- サポート体制
- 投資対効果
- 長期的な学習価値

### 比較結果

${keyPoints.map((point) => `
#### ${point}
${product}の優位性：★★★★★
他社平均：★★★☆☆

${product}は${point}において、明確な優位性を持っています。
`).join('\n')}

### 総合評価

技術専門家の視点から見て、${product}は
現在利用可能なAI教育サービスの中で
最もバランスが取れた選択肢の一つです。

特に、実践的なスキル習得を重視する方には
強く推薦できるサービスといえるでしょう。
`;
}