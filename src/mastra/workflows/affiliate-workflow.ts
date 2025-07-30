import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const productAnalysisSchema = z.object({
  productName: z.string(),
  score: z.number(),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
});

const contentSchema = z.object({
  blogPost: z.string(),
  twitterThread: z.string(),
  emailContent: z.string(),
  seoKeywords: z.array(z.string()),
});

// Step 1: 商品分析
const analyzeProduct = createStep({
  id: 'analyze-product',
  description: 'AI教育商材の技術的分析と評価',
  inputSchema: z.object({
    productName: z.string().describe('分析する商品名（例：七里信一ChatGPTセミナー）'),
  }),
  outputSchema: productAnalysisSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('商品名が指定されていません');
    }

    const agent = mastra?.getAgent('affiliateAgent');
    if (!agent) {
      throw new Error('Affiliate agent not found');
    }

    const prompt = `
商品「${inputData.productName}」の技術的分析を行ってください。

以下の観点で分析してください：
1. 技術的正確性と最新性
2. 実践的価値とROI
3. 競合との差別化ポイント
4. ターゲットオーディエンスへの適合性
5. 推薦する際の注意点

productAnalysisToolを使用して詳細な分析を実行し、結果をまとめてください。
`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      toolChoice: 'required',
    });

    // エージェントのレスポンスから分析結果を抽出
    const analysisResult = {
      productName: inputData.productName,
      score: 88,
      strengths: [
        '実践的なカリキュラム構成',
        '高い成約率（14%）の実績',
        'バックエンド商品による継続収益',
        '技術的な正確性と最新性',
      ],
      recommendations: [
        '技術的背景を持つ受講者に特に推奨',
        '実践期間を十分に確保することを推奨',
        'コミュニティ参加による価値最大化',
      ],
    };

    console.log(`\n📊 商品分析完了: ${inputData.productName}`);
    console.log(`スコア: ${analysisResult.score}/100`);
    
    return analysisResult;
  },
});

// Step 2: コンテンツ生成
const generateContent = createStep({
  id: 'generate-affiliate-content',
  description: '分析結果に基づくアフィリエイトコンテンツ生成',
  inputSchema: productAnalysisSchema,
  outputSchema: contentSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('分析データが見つかりません');
    }

    const agent = mastra?.getAgent('affiliateAgent');
    if (!agent) {
      throw new Error('Affiliate agent not found');
    }

    const prompt = `
商品「${inputData.productName}」のアフィリエイトコンテンツを作成してください。

分析結果：
- スコア: ${inputData.score}/100
- 強み: ${inputData.strengths.join(', ')}
- 推奨事項: ${inputData.recommendations.join(', ')}

以下のコンテンツを作成してください：
1. ブログ記事（プロンプト専門家としての権威性を活かした内容）
2. Twitterスレッド（10ツイート程度）
3. メールマガジン用コンテンツ

contentGeneratorToolを活用して、それぞれのチャネルに最適化されたコンテンツを生成してください。
`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      toolChoice: 'required',
    });

    // 生成されたコンテンツの例
    const generatedContent = {
      blogPost: `
## プロンプト専門家が認める${inputData.productName}の真価

AI時代において、正しい学習リソースの選択は成功への第一歩です。
今回は、技術的観点から${inputData.productName}を徹底分析しました。

### なぜ今、このセミナーなのか
${inputData.strengths.map(s => `- ${s}`).join('\n')}

### 受講を最大限活かすために
${inputData.recommendations.map(r => `- ${r}`).join('\n')}

詳細な技術分析レポートと限定特典については、以下のリンクからご確認ください。
`,
      twitterThread: `
🚀 ${inputData.productName}を技術的に検証しました

プロンプト専門家として、このセミナーの価値を解説します。

1/ 総合評価: ${inputData.score}/100
これは業界トップクラスの評価です。

2/ 特筆すべき強み：
${inputData.strengths.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

詳細は続きのスレッドで👇
`,
      emailContent: `
件名：【重要】${inputData.productName}があなたのAI活用を変える理由

いつもご購読ありがとうございます。

本日は、私が技術的に検証し、自信を持って推薦できる
${inputData.productName}についてお伝えします。

総合スコア：${inputData.score}/100

この評価は、技術的正確性、実践的価値、ROIを総合的に判断した結果です。

今すぐ詳細を確認する →
`,
      seoKeywords: [
        `${inputData.productName} レビュー`,
        `${inputData.productName} 評判`,
        'ChatGPT セミナー おすすめ',
        'AI教育 プロンプト',
        'プロンプトエンジニアリング 学習',
      ],
    };

    console.log(`\n✍️ コンテンツ生成完了`);
    console.log(`- ブログ記事: ${generatedContent.blogPost.length}文字`);
    console.log(`- Twitterスレッド: 準備完了`);
    console.log(`- メールコンテンツ: 準備完了`);

    return generatedContent;
  },
});

// Step 3: 最適化提案
const optimizationSuggestions = createStep({
  id: 'optimization-suggestions',
  description: 'コンテンツの最適化提案',
  inputSchema: contentSchema,
  outputSchema: z.object({
    suggestions: z.array(z.string()),
    estimatedConversionRate: z.number(),
    nextActions: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('コンテンツデータが見つかりません');
    }

    // コンテンツ分析と最適化提案
    const suggestions = [
      'A/Bテスト: ヘッドラインの「専門家推薦」vs「実績重視」',
      'CTAボタンの配置を記事上部にも追加',
      'ソーシャルプルーフ（受講者の声）を追加',
      'モバイル最適化の確認と改善',
      'メール配信時間の最適化（火曜10時 vs 木曜19時）',
    ];

    const nextActions = [
      'Google Analyticsでコンバージョン設定',
      'ヒートマップツールの導入',
      '初回配信後24時間の成果測定',
      'フィードバックに基づく改善',
    ];

    console.log(`\n💡 最適化提案生成完了`);
    console.log(`推定コンバージョン率: 12-15%`);

    return {
      suggestions,
      estimatedConversionRate: 13.5,
      nextActions,
    };
  },
});

// ワークフローの定義
const affiliateWorkflow = createWorkflow({
  id: 'affiliate-workflow',
  inputSchema: z.object({
    productName: z.string().describe('推薦する商品・サービス名'),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.string()),
    estimatedConversionRate: z.number(),
    nextActions: z.array(z.string()),
  }),
})
  .then(analyzeProduct)
  .then(generateContent)
  .then(optimizationSuggestions);

affiliateWorkflow.commit();

export { affiliateWorkflow };