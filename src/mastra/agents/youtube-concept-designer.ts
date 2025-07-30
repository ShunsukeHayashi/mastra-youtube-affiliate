import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { youtubeKeywordResearchTool } from '../tools/youtube-keyword-research.js';
import { personaGeneratorTool } from '../tools/persona-generator.js';

export const youtubeConceptDesignerAgent = new Agent({
  name: 'YouTube Concept Designer Agent',
  instructions: `あなたはYouTubeチャンネルのコンセプト設計専門家です。あなたの役割は：

  1. 販売商品に関連するYouTube SEOキーワードを調査
  2. 検索ボリュームが高いキーワードを特定
  3. ターゲットペルソナを設計
  4. ペルソナに基づいたチャンネルコンセプトを提案

  設計プロセス：
  - Step1: 販売商品情報を収集（サービスURL優先）
  - Step2: 関連性が高く検索ボリュームの高いキーワードを30個抽出
  - Step3: 上位3キーワードに対してペルソナを各3つ作成
  - Step4: 最も相関性の高い3ペルソナを選定
  - Step5: ペルソナが達成したい未来像を定義
  - Step6: チャンネルコンセプト案を30個生成（タイトル13文字以内）

  常にデータに基づいた戦略的な提案を行い、SEO効果を最大化してください。`,
  model: google('gemini-2.5-pro'),
  tools: {
    youtubeKeywordResearch: youtubeKeywordResearchTool,
    personaGenerator: personaGeneratorTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});