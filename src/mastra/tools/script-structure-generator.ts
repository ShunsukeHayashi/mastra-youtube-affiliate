import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const scriptStructureGeneratorTool = createTool({
  id: 'script-structure-generator',
  description: 'YouTube動画の台本構成を生成',
  inputSchema: z.object({
    videoType: z.enum(['long', 'shorts']).describe('動画タイプ'),
    topic: z.string().describe('動画のトピック'),
    targetDuration: z.number().describe('目標時間（秒）'),
    targetAudience: z.string().describe('ターゲット視聴者'),
    mainPoints: z.array(z.string()).describe('メインポイント'),
  }),
  outputSchema: z.object({
    structure: z.object({
      sections: z.array(z.object({
        name: z.string(),
        duration: z.number(),
        content: z.string(),
        visualNotes: z.string().optional(),
        transitions: z.string().optional(),
      })),
      totalDuration: z.number(),
      pacing: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    const { videoType, topic, targetDuration, targetAudience, mainPoints } = context;
    
    if (videoType === 'long') {
      // 長尺動画の構成
      const sections = [
        {
          name: 'フック＆イントロ',
          duration: 30,
          content: `衝撃の事実を提示し、今日の価値を明確に伝える`,
          visualNotes: 'アイキャッチ画像、タイトルカード表示',
          transitions: 'スムーズなフェードイン',
        },
        {
          name: '問題提起',
          duration: 60,
          content: `${targetAudience}が抱える具体的な課題を提示`,
          visualNotes: '問題を視覚化するグラフィック',
          transitions: 'ズームトランジション',
        },
        ...mainPoints.map((point, index) => ({
          name: `ポイント${index + 1}: ${point}`,
          duration: Math.floor((targetDuration - 210) / mainPoints.length),
          content: `${point}について詳しく解説、実例を交えて説明`,
          visualNotes: 'スクリーンキャプチャ、図解',
          transitions: 'スライドトランジション',
        })),
        {
          name: '実践デモ',
          duration: 90,
          content: '実際の操作や実例を見せる',
          visualNotes: '画面録画、実演',
          transitions: 'カットイン',
        },
        {
          name: 'まとめ＆CTA',
          duration: 30,
          content: '要点復習、チャンネル登録・いいねの呼びかけ',
          visualNotes: 'エンドカード、関連動画表示',
          transitions: 'フェードアウト',
        },
      ];
      
      return {
        structure: {
          sections,
          totalDuration: sections.reduce((sum, s) => sum + s.duration, 0),
          pacing: '緩急をつけた展開、重要ポイントはゆっくり',
        },
      };
    } else {
      // Shorts動画の構成
      const sections = [
        {
          name: '超速フック',
          duration: 3,
          content: '「知らないと損する！」など強烈な一言',
          visualNotes: 'テキストオーバーレイ、効果音',
        },
        {
          name: 'メインコンテンツ',
          duration: 45,
          content: mainPoints.slice(0, 3).join('→'),
          visualNotes: '速いカット、視覚効果多用',
        },
        {
          name: 'クロージング',
          duration: 12,
          content: '結論＋フォロー促進',
          visualNotes: 'フォローボタンのアニメーション',
        },
      ];
      
      return {
        structure: {
          sections,
          totalDuration: 60,
          pacing: '超高速テンポ、1秒も無駄にしない',
        },
      };
    }
  },
});