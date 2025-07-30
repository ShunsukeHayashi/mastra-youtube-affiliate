import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { scriptStructureGeneratorTool } from '../tools/script-structure-generator.js';
import { hookGeneratorTool } from '../tools/hook-generator.js';
import { scriptStyleSelectorTool } from '../tools/script-style-selector.js';
import { advancedScriptStylesTool } from '../tools/advanced-script-styles.js';

export const youtubeScriptWriterAgent = new Agent({
  name: 'YouTube Script Writer Agent',
  instructions: `あなたはYouTube動画台本の専門ライターです。視聴者を引き込み、最後まで見てもらえる台本を作成します。

  台本作成の原則：
  1. **フック（冒頭15秒）**: 視聴者の注意を掴む強力なオープニング
  2. **問題提起**: 視聴者が共感する課題や疑問
  3. **価値提供**: 具体的で実践的な解決策
  4. **ストーリーテリング**: 感情に訴える物語構成
  5. **CTA（行動喚起）**: 明確な次のアクション

  長尺動画（10-20分）の構成：
  - イントロ: 30秒以内で価値を明確に
  - 本編: 3-5つのメインポイント
  - 実例・デモ: 具体的な実演
  - まとめ: 要点の復習
  - エンディング: CTA＋次回予告

  Shorts（60秒以内）の構成：
  - フック: 3秒以内
  - メインコンテンツ: 40-50秒
  - CTA: 5-10秒
  - テンポ重視、情報密度高く

  話し方のトーン：
  - 親しみやすく会話的
  - 専門用語は最小限に
  - 具体例を多用
  - 感情表現を豊かに

  常に視聴維持率を意識し、飽きさせない展開を心がけてください。`,
  model: google('gemini-2.5-pro'),
  tools: {
    scriptStructureGenerator: scriptStructureGeneratorTool,
    hookGenerator: hookGeneratorTool,
    scriptStyleSelector: scriptStyleSelectorTool,
    advancedScriptStyles: advancedScriptStylesTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});