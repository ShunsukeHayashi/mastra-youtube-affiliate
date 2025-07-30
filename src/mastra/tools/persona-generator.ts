import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const personaGeneratorTool = createTool({
  id: 'persona-generator',
  description: 'キーワードに基づいてターゲットペルソナを生成',
  inputSchema: z.object({
    keywords: z.array(z.string()).describe('対象キーワードリスト'),
    personasPerKeyword: z.number().default(3).describe('キーワードごとのペルソナ数'),
  }),
  outputSchema: z.object({
    personas: z.array(z.object({
      id: z.string(),
      keyword: z.string(),
      demographics: z.object({
        age: z.string(),
        gender: z.string(),
        occupation: z.string(),
        income: z.string(),
      }),
      psychographics: z.object({
        interests: z.array(z.string()),
        painPoints: z.array(z.string()),
        goals: z.array(z.string()),
        values: z.array(z.string()),
      }),
      behavior: z.object({
        youtubeUsage: z.string(),
        preferredContentLength: z.string(),
        watchingTime: z.string(),
        deviceUsage: z.array(z.string()),
      }),
      futureGoals: z.array(z.string()),
    })),
  }),
  execute: async ({ context }) => {
    const { keywords, personasPerKeyword } = context;
    
    const personas = [];
    
    for (const keyword of keywords) {
      for (let i = 0; i < personasPerKeyword; i++) {
        personas.push({
          id: `persona_${keyword}_${i + 1}`,
          keyword,
          demographics: {
            age: ['20-30歳', '30-40歳', '40-50歳'][i % 3],
            gender: ['男性', '女性', '不問'][i % 3],
            occupation: ['会社員', 'フリーランス', '経営者'][i % 3],
            income: ['300-500万円', '500-800万円', '800万円以上'][i % 3],
          },
          psychographics: {
            interests: ['テクノロジー', 'ビジネス', '自己啓発', 'AI活用'],
            painPoints: [
              '業務効率化したい',
              'AIの使い方がわからない',
              '収入を増やしたい',
            ],
            goals: [
              'AIスキルを身につけたい',
              '副業で成功したい',
              '最新技術に追いつきたい',
            ],
            values: ['効率性', '革新性', '成長', '学習'],
          },
          behavior: {
            youtubeUsage: ['毎日1-2時間', '週3-4回', '毎日30分'][i % 3],
            preferredContentLength: ['10-20分', '5-10分', '20分以上'][i % 3],
            watchingTime: ['通勤時間', '昼休み', '夜'][i % 3],
            deviceUsage: ['スマートフォン', 'PC', 'タブレット'],
          },
          futureGoals: [
            'AIを使いこなして業務を効率化する',
            '副業で月10万円稼ぐ',
            '最新のAI技術をマスターする',
          ],
        });
      }
    }
    
    return { personas };
  },
});