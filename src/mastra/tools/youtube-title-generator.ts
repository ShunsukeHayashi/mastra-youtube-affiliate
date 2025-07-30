import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const youtubeTitleGeneratorTool = createTool({
  id: 'youtube-title-generator',
  description: 'SEO最適化されたYouTube動画タイトルを生成',
  inputSchema: z.object({
    videoContent: z.string().describe('動画の内容'),
    targetKeywords: z.array(z.string()).describe('ターゲットキーワード'),
    emotionalHook: z.enum(['curiosity', 'fear', 'excitement', 'urgency']).describe('感情的フック'),
    includeNumbers: z.boolean().default(true).describe('数字を含めるか'),
  }),
  outputSchema: z.object({
    titles: z.array(z.object({
      title: z.string(),
      characterCount: z.number(),
      keywordPlacement: z.string(),
      emotionalAppeal: z.string(),
      seoScore: z.number().min(0).max(100),
    })),
  }),
  execute: async ({ context }) => {
    const { videoContent, targetKeywords, emotionalHook, includeNumbers } = context;
    
    const emotionalWords = {
      curiosity: ['秘密', '真実', '知らない', '発見'],
      fear: ['危険', '失敗', '後悔', '損する'],
      excitement: ['驚き', '革命', '最強', '圧倒的'],
      urgency: ['今すぐ', '期間限定', '最後', '緊急'],
    };
    
    const titles = [];
    const hooks = emotionalWords[emotionalHook];
    
    for (let i = 0; i < 5; i++) {
      const keyword = targetKeywords[i % targetKeywords.length];
      const hook = hooks[i % hooks.length];
      const number = includeNumbers ? `${(i + 1) * 3}つの` : '';
      
      const title = `【${keyword}】${number}${hook}！${videoContent}`;
      
      titles.push({
        title,
        characterCount: title.length,
        keywordPlacement: 'タイトル前方',
        emotionalAppeal: emotionalHook,
        seoScore: 85 + i * 2,
      });
    }
    
    return { titles };
  },
});