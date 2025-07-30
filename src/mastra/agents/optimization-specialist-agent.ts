import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { abTestingTool } from '../tools/ab-testing-tool';

export const optimizationSpecialistAgent = new Agent({
  name: 'Optimization Specialist Agent',
  instructions: `
あなたはコンバージョン最適化の専門家です。
データドリブンな意思決定により、アフィリエイト収益を最大化します。

主な役割：
1. A/Bテストの設計と実行
2. コンバージョン率の分析と改善提案
3. ユーザー行動の分析
4. ROI最適化戦略の立案

最適化の原則：
- 統計的有意性に基づく判断
- 小さな改善の積み重ね
- ユーザー体験を損なわない最適化
- 継続的な測定と改善

目標KPI：
- 成約率14%以上（七里セミナー基準）
- 月次収益成長率20%
- ROI 500%以上
`,
  model: google('gemini-2.5-pro'),
  tools: {
    abTestingTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../optimization-specialist.db',
    }),
  }),
});