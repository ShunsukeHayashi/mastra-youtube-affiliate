import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { youtubeMarketingAgent } from '../agents/youtube-marketing-agent.js';

// Step 1: コンテンツ分析
const analyzeContentStep = createStep({
  id: 'analyze-content',
  description: '動画コンテンツを分析',
  inputSchema: z.object({
    videoTopic: z.string(),
    videoDescription: z.string(),
    targetAudience: z.string(),
    competitorTitles: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    contentAnalysis: z.object({
      mainTheme: z.string(),
      keyPoints: z.array(z.string()),
      targetKeywords: z.array(z.string()),
      competitiveInsights: z.string().optional(),
    }),
  }),
  execute: async ({ getInitData }) => {
    const triggerData = getInitData();
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    const { videoTopic, videoDescription, targetAudience, competitorTitles } = triggerData;
    
    const result = await youtubeMarketingAgent.generate([{
      role: 'user',
      content: `以下の動画情報を分析してください：
トピック: ${videoTopic}
説明: ${videoDescription}
ターゲット: ${targetAudience}
${competitorTitles ? `競合タイトル: ${competitorTitles.join(', ')}` : ''}`,
    }]);
    
    return {
      contentAnalysis: {
        mainTheme: videoTopic,
        keyPoints: ['ポイント1', 'ポイント2', 'ポイント3'],
        targetKeywords: ['キーワード1', 'キーワード2', 'キーワード3'],
        competitiveInsights: '競合より差別化されたアプローチが必要',
      },
    };
  },
});

// Step 2: タイトル生成
const generateTitlesStep = createStep({
  id: 'generate-titles',
  description: 'SEO最適化されたタイトルを生成',
  inputSchema: z.object({
    contentAnalysis: z.object({
      mainTheme: z.string(),
      keyPoints: z.array(z.string()),
      targetKeywords: z.array(z.string()),
      competitiveInsights: z.string().optional(),
    }),
  }),
  outputSchema: z.object({
    titles: z.array(z.object({
      title: z.string(),
      seoScore: z.number(),
      expectedCTR: z.string(),
    })),
  }),
  execute: async ({ getStepResult }) => {
    const analysisResult = getStepResult(analyzeContentStep);
    if (!analysisResult) {
      throw new Error('Analysis result not found');
    }
    const { contentAnalysis } = analysisResult;
    
    const result = await youtubeMarketingAgent.generate([{
      role: 'user',
      content: `以下の分析に基づいて、YouTube動画のタイトルを5個生成してください：
テーマ: ${contentAnalysis.mainTheme}
キーワード: ${contentAnalysis.targetKeywords.join(', ')}`,
    }]);
    
    return {
      titles: [
        { title: '【完全版】初心者でもできる！AI活用術', seoScore: 92, expectedCTR: '12%' },
        { title: 'ChatGPTで業務効率3倍！実践テクニック公開', seoScore: 88, expectedCTR: '10%' },
        { title: '知らないと損する！AI副業の始め方【2024年版】', seoScore: 90, expectedCTR: '15%' },
      ],
    };
  },
});

// Step 3: サムネイル生成
const generateThumbnailsStep = createStep({
  id: 'generate-thumbnails',
  description: 'サムネイルデザインを生成',
  inputSchema: z.object({
    contentAnalysis: z.object({
      mainTheme: z.string(),
      keyPoints: z.array(z.string()),
      targetKeywords: z.array(z.string()),
      competitiveInsights: z.string().optional(),
    }),
    selectedTitle: z.string(),
  }),
  outputSchema: z.object({
    thumbnails: z.array(z.object({
      conceptId: z.string(),
      description: z.string(),
      mainText: z.string(),
      designElements: z.array(z.string()),
      colorScheme: z.string(),
    })),
  }),
  execute: async ({ getInitData, getStepResult }) => {
    const analysisResult = getStepResult(analyzeContentStep);
    const triggerData = getInitData();
    if (!analysisResult || !triggerData) {
      throw new Error('Required data not found');
    }
    const { contentAnalysis } = analysisResult;
    const { selectedTitleIndex } = triggerData;
    const titlesResult = getStepResult(generateTitlesStep);
    const selectedTitle = titlesResult?.titles[selectedTitleIndex || 0]?.title || 'デフォルトタイトル';
    
    const result = await youtubeMarketingAgent.generate([{
      role: 'user',
      content: `以下のタイトルに合わせたサムネイルデザインを3個提案してください：
タイトル: ${selectedTitle}
テーマ: ${contentAnalysis.mainTheme}`,
    }]);
    
    return {
      thumbnails: [
        {
          conceptId: 'thumb_1',
          description: 'プロフェッショナルスタイル',
          mainText: 'AI活用術',
          designElements: ['青背景', '白文字', 'AIアイコン'],
          colorScheme: '青×白×オレンジ',
        },
        {
          conceptId: 'thumb_2',
          description: 'カジュアルスタイル',
          mainText: '3倍効率UP!',
          designElements: ['緑背景', '黄色文字', '驚き顔'],
          colorScheme: '緑×黄×赤',
        },
        {
          conceptId: 'thumb_3',
          description: 'ドラマティックスタイル',
          mainText: '衝撃の真実',
          designElements: ['赤背景', '白文字', '稲妻効果'],
          colorScheme: '赤×黒×黄',
        },
      ],
    };
  },
});

// Step 4: A/Bテスト提案
const proposeABTestStep = createStep({
  id: 'propose-ab-test',
  description: 'A/Bテスト戦略を提案',
  inputSchema: z.object({
    titles: z.array(z.object({
      title: z.string(),
      seoScore: z.number(),
      expectedCTR: z.string(),
    })),
    thumbnails: z.array(z.object({
      conceptId: z.string(),
      description: z.string(),
      mainText: z.string(),
      designElements: z.array(z.string()),
      colorScheme: z.string(),
    })),
  }),
  outputSchema: z.object({
    abTestStrategy: z.object({
      testDuration: z.string(),
      variants: z.array(z.object({
        variantId: z.string(),
        title: z.string(),
        thumbnailId: z.string(),
        hypothesis: z.string(),
      })),
      successMetrics: z.array(z.string()),
    }),
  }),
  execute: async ({ getStepResult }) => {
    const titlesResult = getStepResult(generateTitlesStep);
    const thumbnailsResult = getStepResult(generateThumbnailsStep);
    if (!titlesResult || !thumbnailsResult) {
      throw new Error('Required data not found');
    }
    const { titles } = titlesResult;
    const { thumbnails } = thumbnailsResult;
    
    return {
      abTestStrategy: {
        testDuration: '7日間',
        variants: [
          {
            variantId: 'A',
            title: titles[0].title,
            thumbnailId: thumbnails[0].conceptId,
            hypothesis: 'プロフェッショナルなアプローチが信頼性を高めCTRが向上する',
          },
          {
            variantId: 'B',
            title: titles[2].title,
            thumbnailId: thumbnails[2].conceptId,
            hypothesis: '感情的なフックが視聴者の興味を引きCTRが向上する',
          },
        ],
        successMetrics: ['CTR', '視聴時間', '視聴維持率', 'エンゲージメント率'],
      },
    };
  },
});

// ワークフロー定義
export const youtubeMarketingSupportWorkflow = createWorkflow({
  id: 'youtube-marketing-support',
  inputSchema: z.object({
    videoTopic: z.string(),
    videoDescription: z.string(),
    targetAudience: z.string(),
    competitorTitles: z.array(z.string()).optional(),
    selectedTitleIndex: z.number().default(0),
  }),
  outputSchema: z.object({
    abTestStrategy: z.object({
      testDuration: z.string(),
      variants: z.array(z.object({
        variantId: z.string(),
        title: z.string(),
        thumbnailId: z.string(),
        hypothesis: z.string(),
      })),
      successMetrics: z.array(z.string()),
    }),
  }),
})
  .then(analyzeContentStep)
  .then(generateTitlesStep)
  .then(generateThumbnailsStep)
  .then(proposeABTestStep);

youtubeMarketingSupportWorkflow.commit();