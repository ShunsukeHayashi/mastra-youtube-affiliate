import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { youtubeScriptWriterAgent } from '../agents/youtube-script-writer.js';

// Step 1: コンテンツプランニング
const planContentStep = createStep({
  id: 'plan-content',
  description: 'コンテンツの計画を立てる',
  inputSchema: z.object({
    videoTitle: z.string(),
    videoType: z.enum(['long', 'shorts']),
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
    targetAudience: z.string(),
    mainMessage: z.string(),
    callToAction: z.string(),
  }),
  outputSchema: z.object({
    contentPlan: z.object({
      topic: z.string(),
      mainPoints: z.array(z.string()),
      targetDuration: z.number(),
      tone: z.string(),
      keyTakeaways: z.array(z.string()),
    }),
  }),
  execute: async ({ getInitData }) => {
    const triggerData = getInitData();
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    const { videoTitle, videoType, scriptStyle, targetAudience, mainMessage } = triggerData;
    
    const result = await youtubeScriptWriterAgent.generate([{
      role: 'user',
      content: `以下の動画のコンテンツプランを作成してください：
タイトル: ${videoTitle}
タイプ: ${videoType}
ターゲット: ${targetAudience}
メッセージ: ${mainMessage}`,
    }]);
    
    return {
      contentPlan: {
        topic: videoTitle,
        mainPoints: [
          '問題の明確化',
          '解決策の提示',
          '実践方法の説明',
          '成功事例の紹介',
        ],
        targetDuration: videoType === 'long' ? 600 : 60, // 10分 or 60秒
        tone: 'フレンドリーで親しみやすい',
        keyTakeaways: [
          '視聴者が即実践できる内容',
          '具体的な成果が期待できる',
          '継続的な学習への動機付け',
        ],
        scriptStyle: scriptStyle || (videoType === 'long' ? 'educational' : undefined),
      },
    };
  },
});

// Step 2: フック生成
const generateHookStep = createStep({
  id: 'generate-hook',
  description: '視聴者を引き込むフックを生成',
  inputSchema: z.object({
    contentPlan: z.object({
      topic: z.string(),
      mainPoints: z.array(z.string()),
      targetDuration: z.number(),
      tone: z.string(),
      keyTakeaways: z.array(z.string()),
    }),
  }),
  outputSchema: z.object({
    hooks: z.array(z.object({
      text: z.string(),
      type: z.string(),
      strength: z.number(),
    })),
    selectedHook: z.string(),
  }),
  execute: async ({ getStepResult }) => {
    const planResult = getStepResult(planContentStep);
    if (!planResult) {
      throw new Error('Content plan not found');
    }
    const { contentPlan } = planResult;
    
    const result = await youtubeScriptWriterAgent.generate([{
      role: 'user',
      content: `${contentPlan.topic}の動画用に、強力なフックを3つ生成してください。`,
    }]);
    
    const hooks = [
      {
        text: 'もしあなたが〇〇で悩んでいるなら、この動画は人生を変えるかもしれません',
        type: 'promise',
        strength: 90,
      },
      {
        text: '実は99%の人が知らない〇〇の真実を暴露します',
        type: 'shocking_fact',
        strength: 95,
      },
      {
        text: 'なぜ〇〇で失敗する人が多いのか、その驚きの理由とは？',
        type: 'question',
        strength: 85,
      },
    ];
    
    return {
      hooks,
      selectedHook: hooks[1].text, // 最も強力なものを選択
    };
  },
});

// Step 3: 台本構成生成
const generateStructureStep = createStep({
  id: 'generate-structure',
  description: '台本の構成を生成',
  inputSchema: z.object({
    contentPlan: z.object({
      topic: z.string(),
      mainPoints: z.array(z.string()),
      targetDuration: z.number(),
      tone: z.string(),
      keyTakeaways: z.array(z.string()),
      scriptStyle: z.string().optional(),
    }),
    selectedHook: z.string(),
  }),
  outputSchema: z.object({
    scriptStructure: z.array(z.object({
      section: z.string(),
      duration: z.number(),
      content: z.string(),
      speakingNotes: z.string(),
    })),
  }),
  execute: async ({ getStepResult }) => {
    const planResult = getStepResult(planContentStep);
    const hookResult = getStepResult(generateHookStep);
    if (!planResult || !hookResult) {
      throw new Error('Required data not found');
    }
    const { contentPlan } = planResult;
    const { selectedHook } = hookResult;
    
    const styleInfo = contentPlan.scriptStyle ? `
スタイル: ${contentPlan.scriptStyle}` : '';
    
    const result = await youtubeScriptWriterAgent.generate([{
      role: 'user',
      content: `以下の情報で台本構成を作成してください：
トピック: ${contentPlan.topic}
フック: ${selectedHook}
時間: ${contentPlan.targetDuration}秒${styleInfo}`,
    }]);
    
    if (contentPlan.targetDuration > 300) {
      // 長尺動画の構成
      return {
        scriptStructure: [
          {
            section: 'オープニング',
            duration: 30,
            content: selectedHook,
            speakingNotes: '強い感情を込めて、視聴者の注意を引く',
          },
          {
            section: '問題提起',
            duration: 60,
            content: '多くの人が抱える共通の課題を明確化',
            speakingNotes: '共感を得られるよう、具体例を交える',
          },
          {
            section: 'メインコンテンツ1',
            duration: 150,
            content: contentPlan.mainPoints[0],
            speakingNotes: '理論と実践をバランスよく',
          },
          {
            section: 'メインコンテンツ2',
            duration: 150,
            content: contentPlan.mainPoints[1],
            speakingNotes: '視覚的な説明を心がける',
          },
          {
            section: 'メインコンテンツ3',
            duration: 150,
            content: contentPlan.mainPoints[2],
            speakingNotes: '実例を多く含める',
          },
          {
            section: 'まとめとCTA',
            duration: 60,
            content: '要点の復習と次のアクション',
            speakingNotes: '明確で実行可能なステップを提示',
          },
        ],
      };
    } else {
      // Shorts動画の構成
      return {
        scriptStructure: [
          {
            section: 'フック',
            duration: 3,
            content: selectedHook,
            speakingNotes: 'インパクト重視、一瞬で掴む',
          },
          {
            section: 'メイン',
            duration: 45,
            content: contentPlan.mainPoints.slice(0, 3).join(' → '),
            speakingNotes: '高速で情報を伝える、視覚効果を活用',
          },
          {
            section: 'CTA',
            duration: 12,
            content: 'フォロー＆詳細は概要欄',
            speakingNotes: '行動を促す明確な指示',
          },
        ],
      };
    }
  },
});

// Step 4: 完全な台本生成
const generateFullScriptStep = createStep({
  id: 'generate-full-script',
  description: '完全な台本を生成',
  inputSchema: z.object({
    contentPlan: z.object({
      topic: z.string(),
      mainPoints: z.array(z.string()),
      targetDuration: z.number(),
      tone: z.string(),
      keyTakeaways: z.array(z.string()),
    }),
    scriptStructure: z.array(z.object({
      section: z.string(),
      duration: z.number(),
      content: z.string(),
      speakingNotes: z.string(),
    })),
    callToAction: z.string(),
  }),
  outputSchema: z.object({
    fullScript: z.object({
      title: z.string(),
      totalDuration: z.number(),
      sections: z.array(z.object({
        sectionName: z.string(),
        duration: z.number(),
        script: z.string(),
        visualCues: z.array(z.string()),
        transitions: z.string(),
      })),
      keywords: z.array(z.string()),
      hashtags: z.array(z.string()),
    }),
  }),
  execute: async ({ getInitData, getStepResult }) => {
    const triggerData = getInitData();
    const planResult = getStepResult(planContentStep);
    const structureResult = getStepResult(generateStructureStep);
    if (!triggerData || !planResult || !structureResult) {
      throw new Error('Required data not found');
    }
    const { callToAction } = triggerData;
    const { contentPlan } = planResult;
    const { scriptStructure } = structureResult;
    
    const result = await youtubeScriptWriterAgent.generate([{
      role: 'user',
      content: `以下の構成で完全な台本を作成してください：
${scriptStructure.map(s => `${s.section}: ${s.content}`).join('\n')}
CTA: ${callToAction}`,
    }]);
    
    const sections = scriptStructure.map(structure => ({
      sectionName: structure.section,
      duration: structure.duration,
      script: `[${structure.section}]\n\n${structure.content}\n\n[話し方: ${structure.speakingNotes}]`,
      visualCues: ['テロップ表示', 'BGM調整', '画面切り替え'],
      transitions: '自然なトランジション',
    }));
    
    return {
      fullScript: {
        title: contentPlan.topic,
        totalDuration: scriptStructure.reduce((sum, s) => sum + s.duration, 0),
        sections,
        keywords: ['AI', 'ChatGPT', '効率化', '自動化'],
        hashtags: ['#AI活用', '#ChatGPT', '#業務効率化', '#DX'],
      },
    };
  },
});

// ワークフロー定義
export const youtubeScriptGenerationWorkflow = createWorkflow({
  id: 'youtube-script-generation',
  inputSchema: z.object({
    videoTitle: z.string(),
    videoType: z.enum(['long', 'shorts']),
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
    ]).optional().describe('台本スタイル（長尺動画のみ）'),
    targetAudience: z.string(),
    mainMessage: z.string(),
    callToAction: z.string(),
  }),
  outputSchema: z.object({
    fullScript: z.object({
      title: z.string(),
      totalDuration: z.number(),
      sections: z.array(z.object({
        sectionName: z.string(),
        duration: z.number(),
        script: z.string(),
        visualCues: z.array(z.string()),
        transitions: z.string(),
      })),
      keywords: z.array(z.string()),
      hashtags: z.array(z.string()),
    }),
  }),
})
  .then(planContentStep)
  .then(generateHookStep)
  .then(generateStructureStep)
  .then(generateFullScriptStep);

youtubeScriptGenerationWorkflow.commit();