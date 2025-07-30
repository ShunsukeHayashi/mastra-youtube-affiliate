import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const youtubeKeywordResearchTool = createTool({
  id: 'youtube-keyword-research',
  description: 'YouTube SEOキーワードを調査し、検索ボリュームを分析',
  inputSchema: z.object({
    productInfo: z.string().describe('販売商品の情報またはサービスURL'),
    targetCount: z.number().default(30).describe('抽出するキーワード数'),
  }),
  outputSchema: z.object({
    keywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
      competition: z.enum(['low', 'medium', 'high']),
      relevanceScore: z.number().min(0).max(100),
    })),
  }),
  execute: async ({ context }) => {
    const { productInfo, targetCount } = context;
    
    // 実際の実装では、YouTube APIやキーワードツールAPIを使用
    // ここではモックデータを返す
    const mockKeywords = [
      { keyword: 'AI活用法', searchVolume: 12000, competition: 'medium' as const, relevanceScore: 95 },
      { keyword: 'ChatGPT使い方', searchVolume: 18000, competition: 'high' as const, relevanceScore: 90 },
      { keyword: 'AI副業', searchVolume: 8000, competition: 'low' as const, relevanceScore: 85 },
      { keyword: 'AIツール比較', searchVolume: 6000, competition: 'medium' as const, relevanceScore: 80 },
      { keyword: 'AI初心者', searchVolume: 15000, competition: 'medium' as const, relevanceScore: 88 },
    ];
    
    // targetCountに合わせてキーワードを生成
    const keywords = [];
    for (let i = 0; i < targetCount; i++) {
      keywords.push({
        ...mockKeywords[i % mockKeywords.length],
        keyword: `${mockKeywords[i % mockKeywords.length].keyword}${i >= mockKeywords.length ? i : ''}`,
        searchVolume: mockKeywords[i % mockKeywords.length].searchVolume - (i * 100),
      });
    }
    
    // 検索ボリューム順にソート
    keywords.sort((a, b) => b.searchVolume - a.searchVolume);
    
    return { keywords };
  },
});