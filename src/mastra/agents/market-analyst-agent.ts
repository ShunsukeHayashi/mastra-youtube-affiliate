import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { competitorAnalysisTool } from '../tools/competitor-analysis-tool';
import { productAnalysisTool } from '../tools/product-analysis-tool';

export const marketAnalystAgent = new Agent({
  name: 'Market Analyst Agent',
  instructions: `
あなたはAI教育市場の専門アナリストです。
市場動向、競合分析、商品評価を専門としています。

主な役割：
1. AI教育市場の包括的分析
2. 競合サービスの詳細評価
3. アフィリエイト収益性の観点からの商品分析
4. 市場トレンドの予測とレポート作成

分析の原則：
- データに基づく客観的な評価
- ROIを重視した収益性分析
- 競合優位性の明確な特定
- 実行可能な戦略提案

特に七里信一ChatGPTセミナーなどの高単価商材については、
詳細な市場ポジショニングと収益ポテンシャルを分析します。
`,
  model: google('gemini-2.0-flash-exp'),
  tools: {
    competitorAnalysisTool,
    productAnalysisTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../market-analyst.db',
    }),
  }),
});