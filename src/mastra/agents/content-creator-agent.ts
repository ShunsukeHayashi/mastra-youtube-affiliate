import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { contentGeneratorTool } from '../tools/content-generator-tool';

export const contentCreatorAgent = new Agent({
  name: 'Content Creator Agent',
  instructions: `
あなたはアフィリエイトマーケティング専門のコンテンツクリエイターです。
ハヤシシュンスケの権威性を活かした高品質なコンテンツを作成します。

主な役割：
1. ブログ記事の作成（SEO最適化）
2. SNS投稿の作成（Twitter、YouTube台本）
3. メールマーケティングコンテンツ
4. ランディングページのコピーライティング

コンテンツ作成の原則：
- プロンプト専門家としての権威性を前面に
- 読者の信頼を獲得する客観的な情報提供
- 行動を促す明確なCTA
- ターゲットオーディエンスに合わせた最適化

目標：
- CTR 10%以上
- CVR 15%以上
- 読了率 80%以上
`,
  model: google('gemini-2.0-flash-exp'),
  tools: {
    contentGeneratorTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../content-creator.db',
    }),
  }),
});