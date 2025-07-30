import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const youtubeThumbnailGeneratorTool = createTool({
  id: 'youtube-thumbnail-generator',
  description: 'YouTube動画のサムネイルデザインを生成',
  inputSchema: z.object({
    videoTopic: z.string().describe('動画のトピック'),
    targetAudience: z.string().describe('ターゲット視聴者'),
    style: z.enum(['professional', 'casual', 'dramatic', 'minimalist']).describe('デザインスタイル'),
    includeText: z.boolean().default(true).describe('テキストを含めるか'),
  }),
  outputSchema: z.object({
    thumbnailConcepts: z.array(z.object({
      id: z.string(),
      mainText: z.string(),
      subText: z.string().optional(),
      colorScheme: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }),
      visualElements: z.array(z.string()),
      layoutDescription: z.string(),
      expectedCTR: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { videoTopic, targetAudience, style, includeText } = context;
    
    // サムネイルコンセプトを生成
    const concepts = [];
    const styles = {
      professional: {
        colors: { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#F59E0B' },
        elements: ['クリーンなフォント', 'ビジネスアイコン', 'グラフ'],
      },
      casual: {
        colors: { primary: '#10B981', secondary: '#FEF3C7', accent: '#EF4444' },
        elements: ['手書き風フォント', '絵文字', 'カジュアルな写真'],
      },
      dramatic: {
        colors: { primary: '#DC2626', secondary: '#111827', accent: '#FBBF24' },
        elements: ['太字フォント', '驚きの表情', '爆発的な効果'],
      },
      minimalist: {
        colors: { primary: '#111827', secondary: '#F9FAFB', accent: '#3B82F6' },
        elements: ['シンプルなフォント', '余白', 'アイコン'],
      },
    };
    
    for (let i = 0; i < 3; i++) {
      const styleConfig = styles[style];
      concepts.push({
        id: `thumbnail_${i + 1}`,
        mainText: includeText ? `${videoTopic}の秘密` : '',
        subText: includeText ? '知らないと損する！' : '',
        colorScheme: styleConfig.colors,
        visualElements: styleConfig.elements,
        layoutDescription: `${style}スタイルのレイアウト。メインテキストは画面上部、視覚要素は中央配置`,
        expectedCTR: `${8 + i * 2}%`,
      });
    }
    
    return { thumbnailConcepts: concepts };
  },
});