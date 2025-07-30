import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { youtubeConceptDesignerAgent } from '../agents/youtube-concept-designer.js';
import { youtubeMarketingAgent } from '../agents/youtube-marketing-agent.js';
import { youtubeScriptWriterAgent } from '../agents/youtube-script-writer.js';
import { youtubeChannelAnalysisAgent } from '../agents/youtube-channel-analysis.js';

// Step 1: チャンネル分析とトレンド調査
const analyzeChannelAndTrendsStep = createStep({
  id: 'analyze-channel-trends',
  description: 'チャンネルの現状とトレンドを分析',
  inputSchema: z.object({
    channelId: z.string().optional(),
    niche: z.string(),
    competitorChannels: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    channelInsights: z.object({
      performanceMetrics: z.any(),
      contentGaps: z.array(z.string()),
      trendingTopics: z.array(z.string()),
      competitiveAdvantages: z.array(z.string()),
    }),
  }),
  execute: async ({ getInitData }) => {
    const triggerData = getInitData();
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    const { channelId, niche, competitorChannels } = triggerData;
    
    let analysisPrompt = `以下の情報に基づいてYouTubeチャンネル分析を実行してください：
ニッチ: ${niche}`;
    
    if (channelId) {
      analysisPrompt += `\nチャンネルID: ${channelId}`;
    }
    
    if (competitorChannels?.length) {
      analysisPrompt += `\n競合チャンネル: ${competitorChannels.join(', ')}`;
    }
    
    const result = await youtubeChannelAnalysisAgent.generate([{
      role: 'user',
      content: analysisPrompt,
    }]);
    
    // モックデータ（実際はエージェントの応答を解析）
    return {
      channelInsights: {
        performanceMetrics: {
          averageViews: 10000,
          engagementRate: 5.2,
          uploadFrequency: 'weekly',
        },
        contentGaps: [
          '初心者向けチュートリアル不足',
          '最新トレンドへの対応遅れ',
          '実践的な事例紹介が少ない',
        ],
        trendingTopics: [
          'AI活用術',
          'ChatGPT実践ガイド',
          '生産性向上ツール',
        ],
        competitiveAdvantages: [
          '専門性の高さ',
          '説明の分かりやすさ',
          'コミュニティの活発さ',
        ],
      },
    };
  },
});

// Step 2: コンテンツ企画とキーワード選定
const planContentStep = createStep({
  id: 'plan-content',
  description: 'コンテンツ企画とSEOキーワード選定',
  inputSchema: z.object({
    channelInsights: z.object({
      performanceMetrics: z.any(),
      contentGaps: z.array(z.string()),
      trendingTopics: z.array(z.string()),
      competitiveAdvantages: z.array(z.string()),
    }),
    contentGoals: z.string(),
  }),
  outputSchema: z.object({
    contentPlan: z.object({
      videoTitle: z.string(),
      mainKeywords: z.array(z.string()),
      targetAudience: z.string(),
      uniqueAngle: z.string(),
      estimatedDuration: z.number(),
      contentType: z.enum(['educational', 'entertainment', 'how-to', 'review', 'news']),
    }),
  }),
  execute: async ({ getInitData, getStepResult }) => {
    const triggerData = getInitData();
    const insightsResult = getStepResult(analyzeChannelAndTrendsStep);
    if (!triggerData || !insightsResult) {
      throw new Error('Required data not found');
    }
    const { contentGoals } = triggerData;
    const { channelInsights } = insightsResult;
    
    const result = await youtubeConceptDesignerAgent.generate([{
      role: 'user',
      content: `以下の情報に基づいて動画企画を作成してください：
コンテンツギャップ: ${channelInsights.contentGaps.join(', ')}
トレンドトピック: ${channelInsights.trendingTopics.join(', ')}
目標: ${contentGoals}`,
    }]);
    
    return {
      contentPlan: {
        videoTitle: 'ChatGPTで業務効率10倍！実践的な活用術15選',
        mainKeywords: ['ChatGPT', '業務効率化', 'AI活用'],
        targetAudience: 'AIツールに興味があるビジネスパーソン',
        uniqueAngle: '実際の業務シーンでの具体的な活用例を15個紹介',
        estimatedDuration: 15,
        contentType: 'how-to',
      },
    };
  },
});

// Step 3: サムネイル・タイトル・説明文の生成
const generateMarketingAssetsStep = createStep({
  id: 'generate-marketing-assets',
  description: 'サムネイル、タイトル、説明文を生成',
  inputSchema: z.object({
    contentPlan: z.object({
      videoTitle: z.string(),
      mainKeywords: z.array(z.string()),
      targetAudience: z.string(),
      uniqueAngle: z.string(),
      estimatedDuration: z.number(),
      contentType: z.enum(['educational', 'entertainment', 'how-to', 'review', 'news']),
    }),
  }),
  outputSchema: z.object({
    marketingAssets: z.object({
      titles: z.array(z.object({
        title: z.string(),
        seoScore: z.number(),
      })),
      thumbnails: z.array(z.object({
        concept: z.string(),
        mainText: z.string(),
        visualElements: z.array(z.string()),
      })),
      description: z.string(),
      tags: z.array(z.string()),
    }),
  }),
  execute: async ({ getStepResult }) => {
    const planResult = getStepResult(planContentStep);
    if (!planResult) {
      throw new Error('Content plan not found');
    }
    const { contentPlan } = planResult;
    
    const result = await youtubeMarketingAgent.generate([{
      role: 'user',
      content: `以下の企画に基づいてマーケティング素材を作成してください：
タイトル: ${contentPlan.videoTitle}
キーワード: ${contentPlan.mainKeywords.join(', ')}
ターゲット: ${contentPlan.targetAudience}`,
    }]);
    
    return {
      marketingAssets: {
        titles: [
          {
            title: '【2024年最新】ChatGPTで業務効率10倍！プロが教える実践術15選',
            seoScore: 95,
          },
          {
            title: 'ChatGPT活用術15選｜仕事が10倍速くなる裏技を大公開！',
            seoScore: 92,
          },
          {
            title: '知らないと損する！ChatGPTの業務活用法TOP15【完全保存版】',
            seoScore: 90,
          },
        ],
        thumbnails: [
          {
            concept: 'プロフェッショナルスタイル',
            mainText: '業務効率10倍',
            visualElements: ['ChatGPTロゴ', '上昇グラフ', '驚きの表情'],
          },
          {
            concept: 'インパクトスタイル',
            mainText: '15の裏技公開！',
            visualElements: ['数字15を大きく', '秘密のアイコン', 'ビジネスパーソン'],
          },
        ],
        description: `ChatGPTを使って業務効率を劇的に向上させる15の実践的な方法を紹介します。

【目次】
00:00 イントロダクション
01:30 基本設定と準備
03:00 実践術1: メール作成の自動化
...

【関連リンク】
・ChatGPT公式: https://chat.openai.com
・詳細解説ブログ: [リンク]

【使用ツール】
・ChatGPT Plus
・Chrome拡張機能

#ChatGPT #業務効率化 #AI活用 #生産性向上 #仕事術`,
        tags: [
          'ChatGPT',
          '業務効率化',
          'AI活用',
          '生産性向上',
          'ビジネス',
          'チャットGPT',
          'AI',
          '仕事術',
          '時短',
          'プロンプト',
        ],
      },
    };
  },
});

// Step 4: 台本生成
const generateScriptStep = createStep({
  id: 'generate-script',
  description: '動画台本を生成',
  inputSchema: z.object({
    contentPlan: z.object({
      videoTitle: z.string(),
      mainKeywords: z.array(z.string()),
      targetAudience: z.string(),
      uniqueAngle: z.string(),
      estimatedDuration: z.number(),
      contentType: z.enum(['educational', 'entertainment', 'how-to', 'review', 'news']),
    }),
    selectedTitle: z.string(),
    scriptStyle: z.enum([
      'educational',
      'entertainment',
      'how-to',
      'news',
      'review',
      'vlog',
      'taiki',
      'roadmap',
      'osaru',
      'moezo',
      'dialogue',
    ]).optional(),
  }),
  outputSchema: z.object({
    script: z.object({
      fullScript: z.string(),
      sections: z.array(z.object({
        title: z.string(),
        duration: z.string(),
        content: z.string(),
        keyPoints: z.array(z.string()),
      })),
      totalWordCount: z.number(),
      estimatedSpeakingTime: z.number(),
    }),
  }),
  execute: async ({ getInitData, getStepResult }) => {
    const triggerData = getInitData();
    const planResult = getStepResult(planContentStep);
    const marketingResult = getStepResult(generateMarketingAssetsStep);
    if (!triggerData || !planResult || !marketingResult) {
      throw new Error('Required data not found');
    }
    const { scriptStyle } = triggerData;
    const { contentPlan } = planResult;
    const { marketingAssets } = marketingResult;
    const selectedTitle = marketingAssets.titles[0]?.title || 'デフォルトタイトル';
    
    const style = scriptStyle || contentPlan.contentType;
    
    const result = await youtubeScriptWriterAgent.generate([{
      role: 'user',
      content: `以下の情報で動画台本を作成してください：
タイトル: ${selectedTitle}
時間: ${contentPlan.estimatedDuration}分
スタイル: ${style}
ターゲット: ${contentPlan.targetAudience}
独自の切り口: ${contentPlan.uniqueAngle}`,
    }]);
    
    const fullScript = `
【オープニング】
こんにちは！今日は「ChatGPTで業務効率を10倍にする15の実践術」をご紹介します。
この動画を最後まで見れば、明日から仕事のスピードが劇的に変わること間違いなしです！

【実践術1: メール作成の自動化】
まず最初は、多くの人が時間を取られているメール作成の効率化です。
ChatGPTを使えば、ビジネスメールの下書きが30秒で完成します...

【実践術2: 議事録の要約】
次は会議の議事録です。長い会議の内容も、ChatGPTなら要点を3分でまとめられます...

（以下、15の実践術を詳しく解説）

【まとめ】
いかがでしたか？今日紹介した15の方法を実践すれば、あなたの業務効率は確実に向上します。
ぜひ一つずつ試してみてください！

チャンネル登録といいねボタンもお忘れなく！
次回は「ChatGPTの応用テクニック」をお届けします。それでは、また次の動画でお会いしましょう！`;
    
    return {
      script: {
        fullScript,
        sections: [
          {
            title: 'オープニング',
            duration: '1分',
            content: 'フック、自己紹介、動画の価値提案',
            keyPoints: ['注意を引く統計', '視聴メリット', '概要説明'],
          },
          {
            title: '実践術1-5',
            duration: '5分',
            content: '基本的な業務効率化テクニック',
            keyPoints: ['メール作成', '議事録要約', 'データ分析', 'プレゼン作成', 'リサーチ'],
          },
          {
            title: '実践術6-10',
            duration: '5分',
            content: '中級レベルの活用法',
            keyPoints: ['コード生成', '翻訳業務', 'カスタマーサポート', 'コンテンツ作成', 'スケジュール管理'],
          },
          {
            title: '実践術11-15',
            duration: '3分',
            content: '上級者向けテクニック',
            keyPoints: ['API連携', 'ワークフロー自動化', 'カスタムGPT作成', 'チーム活用', 'セキュリティ対策'],
          },
          {
            title: 'まとめとCTA',
            duration: '1分',
            content: '要点整理と行動喚起',
            keyPoints: ['重要ポイントの復習', 'チャンネル登録促進', '次回予告'],
          },
        ],
        totalWordCount: 3000,
        estimatedSpeakingTime: 15,
      },
    };
  },
});

// Step 5: 条件分岐 - スタイルに基づく追加処理
const conditionalProcessingStep = createStep({
  id: 'conditional-processing',
  description: 'スタイルに基づいて追加処理を実行',
  inputSchema: z.object({
    script: z.object({
      fullScript: z.string(),
      sections: z.array(z.object({
        title: z.string(),
        duration: z.string(),
        content: z.string(),
        keyPoints: z.array(z.string()),
      })),
      totalWordCount: z.number(),
      estimatedSpeakingTime: z.number(),
    }),
    scriptStyle: z.string().optional(),
  }),
  outputSchema: z.object({
    additionalAssets: z.object({
      visualEffects: z.array(z.string()).optional(),
      specialInstructions: z.array(z.string()).optional(),
      interactiveElements: z.array(z.string()).optional(),
    }),
  }),
  execute: async ({ getInitData, getStepResult }) => {
    const triggerData = getInitData();
    const scriptResult = getStepResult(generateScriptStep);
    if (!triggerData || !scriptResult) {
      throw new Error('Required data not found');
    }
    const { scriptStyle } = triggerData;
    const { script } = scriptResult;
    
    // 条件分岐: スタイルに基づいて異なる処理を実行
    const additionalAssets: any = {};
    
    if (scriptStyle === 'taiki' || scriptStyle === 'moezo') {
      // アニメーションスタイルの場合
      additionalAssets.visualEffects = [
        'キャラクターアニメーション',
        'ポップアップテキスト',
        'エモーショナルエフェクト',
        'BGM強調',
      ];
      additionalAssets.specialInstructions = [
        'キャラクターの表情変化を多用',
        'リアクションを大げさに',
        '効果音を頻繁に使用',
      ];
    } else if (scriptStyle === 'roadmap') {
      // ロードマップスタイルの場合
      additionalAssets.visualEffects = [
        'タイムラインアニメーション',
        'ステップバイステップ表示',
        'プログレスバー',
        'チェックマーク演出',
      ];
      additionalAssets.interactiveElements = [
        'チャプターマーカー',
        'クリッカブルリンク',
        'タイムスタンプ',
      ];
    } else if (scriptStyle === 'dialogue') {
      // 対話スタイルの場合
      additionalAssets.visualEffects = [
        '吹き出しアニメーション',
        '画面分割効果',
        'キャラクター切り替え',
      ];
      additionalAssets.specialInstructions = [
        '会話のテンポに注意',
        '間を効果的に使用',
        'リアクションカットを挿入',
      ];
    } else if (scriptStyle === 'osaru') {
      // おさるスタイルの場合
      additionalAssets.visualEffects = [
        'サル猿化演出',
        'ジャングル背景',
        'バナナトランジション',
      ];
      additionalAssets.specialInstructions = [
        'ユーモアを前面に',
        '予想外の展開を含める',
        '視聴者を巻き込む質問',
      ];
    } else {
      // デフォルトスタイル
      additionalAssets.visualEffects = [
        'スタンダードトランジション',
        'テキストオーバーレイ',
        '基本的なズーム効果',
      ];
    }
    
    // 動画の長さに基づく条件分岐
    if (script.estimatedSpeakingTime > 10) {
      additionalAssets.interactiveElements = [
        ...(additionalAssets.interactiveElements || []),
        'エンドスクリーン要素',
        'カード挿入ポイント',
        '中間CTAポイント',
      ];
    }
    
    return { additionalAssets };
  },
});

// Step 6: 制作チェックリストとスケジュール
const createProductionChecklistStep = createStep({
  id: 'create-production-checklist',
  description: '制作チェックリストとスケジュールを作成',
  inputSchema: z.object({
    contentPlan: z.any(),
    marketingAssets: z.any(),
    script: z.any(),
  }),
  outputSchema: z.object({
    productionPlan: z.object({
      checklist: z.array(z.object({
        task: z.string(),
        category: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        estimatedTime: z.string(),
      })),
      timeline: z.array(z.object({
        phase: z.string(),
        tasks: z.array(z.string()),
        duration: z.string(),
      })),
      resources: z.array(z.object({
        type: z.string(),
        items: z.array(z.string()),
      })),
      publishingStrategy: z.object({
        bestTime: z.string(),
        promotionPlan: z.array(z.string()),
        crossPlatform: z.array(z.string()),
      }),
    }),
  }),
  execute: async ({ getStepResult }) => {
    const planResult = getStepResult(planContentStep);
    const marketingResult = getStepResult(generateMarketingAssetsStep);
    const scriptResult = getStepResult(generateScriptStep);
    if (!planResult || !marketingResult || !scriptResult) {
      throw new Error('Required data not found');
    }
    const { contentPlan } = planResult;
    const { marketingAssets } = marketingResult;
    const { script } = scriptResult;
    
    return {
      productionPlan: {
        checklist: [
          {
            task: '台本の最終確認と調整',
            category: 'プリプロダクション',
            priority: 'high',
            estimatedTime: '30分',
          },
          {
            task: '撮影機材のセットアップ',
            category: 'プロダクション',
            priority: 'high',
            estimatedTime: '1時間',
          },
          {
            task: '動画撮影',
            category: 'プロダクション',
            priority: 'high',
            estimatedTime: '2時間',
          },
          {
            task: 'B-roll素材の収集',
            category: 'プロダクション',
            priority: 'medium',
            estimatedTime: '1時間',
          },
          {
            task: '動画編集',
            category: 'ポストプロダクション',
            priority: 'high',
            estimatedTime: '4時間',
          },
          {
            task: 'サムネイル作成',
            category: 'ポストプロダクション',
            priority: 'high',
            estimatedTime: '1時間',
          },
          {
            task: '字幕・テロップ追加',
            category: 'ポストプロダクション',
            priority: 'medium',
            estimatedTime: '2時間',
          },
          {
            task: 'BGM・効果音の追加',
            category: 'ポストプロダクション',
            priority: 'medium',
            estimatedTime: '30分',
          },
          {
            task: '最終確認とアップロード',
            category: '公開準備',
            priority: 'high',
            estimatedTime: '30分',
          },
        ],
        timeline: [
          {
            phase: 'Day 1: プリプロダクション',
            tasks: ['台本確認', '機材準備', '撮影場所セッティング'],
            duration: '2時間',
          },
          {
            phase: 'Day 2: 撮影',
            tasks: ['本編撮影', 'B-roll撮影', '追加撮影'],
            duration: '3時間',
          },
          {
            phase: 'Day 3-4: 編集',
            tasks: ['粗編集', '本編集', '色調補正', '音声調整'],
            duration: '6時間',
          },
          {
            phase: 'Day 5: 仕上げ',
            tasks: ['サムネイル作成', '最終確認', 'アップロード'],
            duration: '2時間',
          },
        ],
        resources: [
          {
            type: '撮影機材',
            items: ['カメラ', 'マイク', '照明', '三脚'],
          },
          {
            type: '編集ソフト',
            items: ['Premiere Pro/Final Cut', 'Photoshop', 'After Effects（必要に応じて）'],
          },
          {
            type: '素材',
            items: ['BGM（著作権フリー）', '効果音', 'ストック映像'],
          },
        ],
        publishingStrategy: {
          bestTime: '平日19:00または土日10:00',
          promotionPlan: [
            'コミュニティタブで事前告知',
            'SNSでティザー投稿',
            'メールリストに通知',
            '関連動画へのコメント',
          ],
          crossPlatform: [
            'Twitter/Xで要点をスレッド化',
            'Instagramでリール作成',
            'TikTokでショート版投稿',
            'ブログ記事として文字起こし',
          ],
        },
      },
    };
  },
});

// ワークフロー定義
export const youtubeFullProductionWorkflow = createWorkflow({
  id: 'youtube-full-production',
  inputSchema: z.object({
    channelId: z.string().optional().describe('分析対象のチャンネルID'),
    niche: z.string().describe('チャンネルのニッチ/ジャンル'),
    competitorChannels: z.array(z.string()).optional().describe('競合チャンネルID'),
    contentGoals: z.string().describe('コンテンツの目標'),
    scriptStyle: z.enum([
      'educational',
      'entertainment',
      'how-to',
      'news',
      'review',
      'vlog',
      'taiki',
      'roadmap',
      'osaru',
      'moezo',
      'dialogue',
    ]).optional().describe('台本スタイル'),
  }),
  outputSchema: z.object({
    channelInsights: z.any(),
    contentPlan: z.any(),
    marketingAssets: z.any(),
    script: z.any(),
    additionalAssets: z.any(),
    productionPlan: z.any(),
  }),
})
  .then(analyzeChannelAndTrendsStep)
  .then(planContentStep)
  .then(generateMarketingAssetsStep)
  .then(generateScriptStep)
  .then(conditionalProcessingStep)
  .then(createProductionChecklistStep);

youtubeFullProductionWorkflow.commit();