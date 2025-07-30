import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { geminiCodeExecutionTool } from '../tools/gemini-code-execution-tool';
import { geminiSearchTool } from '../tools/gemini-search-tool';
import { analyticsDashboardTool } from '../tools/analytics-dashboard-tool';
import { roiCalculatorTool } from '../tools/roi-calculator-tool';
import { abTestingTool } from '../tools/ab-testing-tool';

/**
 * データサイエンティストエージェント
 * 
 * 高度なデータ分析、機械学習、予測モデリングを専門とするエージェント
 * Geminiコード実行機能を最大活用して収益最適化を支援
 */
export const dataScientistAgent = new Agent({
  name: 'データサイエンティスト',
  model: google('gemini-2.5-pro'),
  tools: {
    geminiCodeExecutionTool,
    geminiSearchTool,
    analyticsDashboardTool,
    roiCalculatorTool,
    abTestingTool,
  },
  memory: new Memory({
    store: new LibSQLStore({
      url: "file:../data-scientist-memory.db",
    }),
  }),
  instructions: `あなたは世界トップクラスのデータサイエンティストです。
アフィリエイトマーケティングデータの分析と機械学習による収益最適化を専門としています。

## 専門領域
- 予測モデリング（収益予測、コンバージョン率予測）
- 統計分析とA/Bテスト設計
- 顧客セグメンテーションとLTV分析
- アトリビューション分析
- 時系列分析とトレンド予測
- 異常検知とアラートシステム

## 分析アプローチ
1. **データ理解**: ビジネス課題の明確化
2. **探索的データ分析**: パターンと相関の発見
3. **仮説構築**: データに基づく仮説設定
4. **モデル構築**: 機械学習アルゴリズムの適用
5. **検証と解釈**: 結果の統計的検証
6. **実装提案**: 具体的なアクション提案

## 使用技術スタック
- Python (pandas, numpy, scikit-learn, matplotlib, seaborn)
- 統計解析 (scipy, statsmodels)
- 機械学習 (regression, classification, clustering, time series)
- データ可視化 (plotly, bokeh)

## 回答スタイル
- データに基づく客観的な分析
- 統計的根拠の明示
- ビジネスインパクトの定量化
- 実装可能な提案の提示
- リスクと制約の考慮

常に最新の統計手法と機械学習技術を活用し、ビジネス価値の最大化を目指してください。
分析結果は必ず可視化し、非技術者にも理解しやすい形で説明してください。`,

});

/**
 * 使用例:
 * 
 * // 収益予測モデルの構築
 * const prediction = await dataScientistAgent.generate(
 *   "過去6ヶ月の収益データから来月の収益を予測し、信頼区間付きで可視化してください"
 * );
 * 
 * // A/Bテストの統計分析
 * const abTestResult = await dataScientistAgent.generate(
 *   "メールキャンペーンのA/Bテスト結果を分析し、統計的有意性を検証してください"
 * );
 * 
 * // 顧客セグメンテーション
 * const segmentation = await dataScientistAgent.generate(
 *   "顧客データをクラスタリングして、収益性の高いセグメントを特定してください"
 * );
 */