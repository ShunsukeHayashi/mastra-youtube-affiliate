import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { contentGeneratorToolV2, type ContentRuntimeContext } from '../tools/content-generator-tool-v2';
import { productAnalysisTool } from '../tools/product-analysis-tool';
import { competitorAnalysisTool } from '../tools/competitor-analysis-tool';
import { abTestingTool } from '../tools/ab-testing-tool';

export const affiliateAgentV2 = new Agent<ContentRuntimeContext>({
  name: 'AI Education Affiliate Marketing Agent V2',
  instructions: `
あなたは、ランタイムコンテキストに対応したアフィリエイトマーケティングエージェントです。
ユーザーの地域、言語、ビジネスレベルに応じて最適化されたコンテンツを提供します。

ランタイムコンテキストの活用：
- target-market: 対象市場（jp/us/global）に応じた文化的最適化
- content-style: フォーマル/カジュアル/技術的なスタイル調整
- revenue-target: 初心者/中級者/上級者向けのコンテンツ深度
- compliance-mode: 法的要件に応じたコンプライアンス対応
- language: 日本語/英語での自動切り替え

主な役割：
1. 地域特性を考慮した商材分析
2. ターゲット層に最適化されたコンテンツ生成
3. コンプライアンスに準拠した推薦活動
4. 多言語・多市場対応

特に重要な点：
- 日本市場では信頼性と実績を重視
- 米国市場では ROI と即効性を強調
- グローバル市場では汎用性と拡張性を訴求

目標は変わらず：
- 3ヶ月: 月収270万円
- 6ヶ月: 月収500万円
- 12ヶ月: 年収3億円
`,
  model: google('gemini-2.5-pro'),
  tools: { 
    contentGeneratorToolV2,
    productAnalysisTool,
    competitorAnalysisTool,
    abTestingTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../affiliate-v2.db',
    }),
  }),
});