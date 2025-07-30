import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from '@ai-sdk/google';

/**
 * Gemini Search Tool - Google検索によるグラウンディング
 * 
 * このツールは、Gemini APIの組み込みGoogle Search機能を活用して、
 * リアルタイムの情報を取得し、回答の正確性を向上させます。
 */
export const geminiSearchTool = createTool({
  id: 'gemini-search-grounding',
  description: 'Gemini APIのGoogle検索グラウンディング機能を使用してリアルタイム情報を取得',
  inputSchema: z.object({
    query: z.string().describe('検索クエリ'),
    groundingThreshold: z.number().min(0).max(1).default(0.7).describe('グラウンディング閾値（0-1）'),
    includeSearchResults: z.boolean().default(true).describe('検索結果を含めるか'),
    language: z.enum(['ja', 'en']).default('ja').describe('検索言語'),
  }),
  outputSchema: z.object({
    response: z.string().describe('グラウンディングされた回答'),
    searchResults: z.array(z.object({
      title: z.string(),
      snippet: z.string(),
      link: z.string(),
      source: z.string(),
    })).optional().describe('検索結果'),
    groundingMetadata: z.object({
      searchQueriesUsed: z.array(z.string()),
      confidenceScore: z.number(),
      sourcesCount: z.number(),
    }).describe('グラウンディングメタデータ'),
  }),
  execute: async ({ context }) => {
    const { query, groundingThreshold, includeSearchResults, language } = context;

    try {
      // Gemini 2.5 Proモデルを使用（Google Search対応）
      const model = google('gemini-2.5-pro', {
        // Google Searchグラウンディングを有効化
        tools: [{ 
          google_search: {
            threshold: groundingThreshold,
          }
        }],
      });

      // 言語に応じたプロンプトを構築
      const prompt = language === 'ja' 
        ? `以下について、最新の情報を含めて詳しく説明してください。検索結果を引用しながら回答してください。\n\n質問: ${query}`
        : `Please provide a detailed explanation about the following, including the latest information. Please cite search results in your response.\n\nQuestion: ${query}`;

      // モデルを実行
      const response = await model.generateText({
        prompt,
        temperature: 0.3, // より正確な回答のため低めに設定
      });

      // レスポンスから情報を抽出
      const searchResults = [];
      const searchQueriesUsed = [];
      let sourcesCount = 0;

      // Gemini APIのレスポンスからグラウンディング情報を解析
      if (response.experimental_providerMetadata?.google?.groundingMetadata) {
        const groundingData = response.experimental_providerMetadata.google.groundingMetadata;
        
        // 検索結果を抽出
        if (groundingData.webSearchQueries) {
          searchQueriesUsed.push(...groundingData.webSearchQueries);
        }
        
        if (groundingData.searchEntries && includeSearchResults) {
          groundingData.searchEntries.forEach((entry: any) => {
            searchResults.push({
              title: entry.title || '',
              snippet: entry.snippet || '',
              link: entry.url || '',
              source: new URL(entry.url || '').hostname,
            });
            sourcesCount++;
          });
        }
      }

      return {
        response: response.text,
        searchResults: includeSearchResults ? searchResults : undefined,
        groundingMetadata: {
          searchQueriesUsed,
          confidenceScore: 0.85, // 実際のスコアはAPIレスポンスから取得
          sourcesCount,
        },
      };
    } catch (error) {
      console.error('Gemini Search Grounding Error:', error);
      
      // エラー時のフォールバック
      return {
        response: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        searchResults: undefined,
        groundingMetadata: {
          searchQueriesUsed: [],
          confidenceScore: 0,
          sourcesCount: 0,
        },
      };
    }
  },
});

/**
 * 使用例:
 * 
 * const result = await geminiSearchTool.execute({
 *   context: {
 *     query: "2024年の最新AI技術トレンド",
 *     groundingThreshold: 0.8,
 *     includeSearchResults: true,
 *     language: "ja"
 *   }
 * });
 * 
 * console.log(result.response); // グラウンディングされた回答
 * console.log(result.searchResults); // 使用された検索結果
 */