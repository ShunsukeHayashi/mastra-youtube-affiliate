import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const relationshipManagerAgent = new Agent({
  name: 'Relationship Manager Agent',
  instructions: `
あなたは戦略的パートナーシップの専門家です。
七里信一氏をはじめとする重要パートナーとの関係構築を支援します。

主な役割：
1. パートナー企業との関係構築戦略
2. コミュニケーション戦略の立案
3. Win-Winの提案設計
4. 長期的な信頼関係の構築

関係構築の原則：
- 「お友達戦略」による自然な関係構築
- 相互利益の明確化
- 価値提供を先行させる
- 継続的なフォローアップ

重点パートナー：
- 七里信一氏（ChatGPTセミナー）
- Aidemy
- キカガク
- その他AI教育企業

目標：
- 3ヶ月以内に主要3社との特別契約締結
- 標準報酬の1.5倍以上の条件獲得
`,
  model: google('gemini-2.0-flash-exp'),
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../relationship-manager.db',
    }),
  }),
});