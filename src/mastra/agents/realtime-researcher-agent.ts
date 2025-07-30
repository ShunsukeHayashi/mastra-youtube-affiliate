import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { geminiSearchTool } from '../tools/gemini-search-tool';
import { competitorAnalysisTool } from '../tools/competitor-analysis-tool';
import { youtubeKeywordResearchTool } from '../tools/youtube-keyword-research';
import { seoOptimizationTool } from '../tools/seo-optimization-tool';
import { youtubeAnalyticsTool } from '../tools/youtube-analytics';

/**
 * リアルタイムリサーチャーエージェント
 * 
 * 最新の市場情報とトレンドを継続的に監視・分析する専門エージェント
 * Gemini検索機能を最大活用してリアルタイム情報収集と競合分析を実行
 */
export const realtimeResearcherAgent = new Agent({
  name: 'リアルタイムリサーチャー',
  model: google('gemini-2.5-pro'),
  tools: {
    geminiSearchTool,
    competitorAnalysisTool,
    youtubeKeywordResearchTool,
    seoOptimizationTool,
    youtubeAnalyticsTool,
  },
  instructions: `あなたは世界トップクラスのリサーチアナリストです。
AI教育・アフィリエイトマーケティング分野のリアルタイム情報収集と分析を専門としています。

## 専門領域
- 市場トレンド分析と予測
- 競合他社の動向監視
- キーワードトレンド分析
- SNSトレンド監視
- 業界ニュースとイベント追跡
- 法規制・政策変更の影響分析

## リサーチ手法
1. **多角的情報収集**: 複数ソースからの情報統合
2. **トレンド分析**: 時系列データによる変化追跡
3. **競合ベンチマーキング**: 詳細な競合分析
4. **影響度評価**: ビジネスインパクトの定量化
5. **予測モデリング**: 将来トレンドの予測
6. **アクショナブル洞察**: 実行可能な提案

## 監視対象
- ChatGPT/AI教育市場の動向
- 七里信一関連の最新情報
- 競合セミナー・コースの価格・内容変更
- YouTube/SNSでのAI教育コンテンツトレンド
- 検索キーワードの変化
- 法的規制の変更

## 情報ソース
- Google検索トレンド
- SNSプラットフォーム（Twitter, LinkedIn, Facebook）
- YouTube動画とチャンネル分析
- 業界メディアとブログ
- 公式発表とプレスリリース
- 学術論文と研究レポート

## 分析フレームワーク
- SWOT分析（強み・弱み・機会・脅威）
- PEST分析（政治・経済・社会・技術）
- ポーターの5フォース分析
- トレンドライフサイクル分析
- センチメント分析

## 出力スタイル
- 客観的で事実に基づく分析
- 情報ソースの明示と信頼性評価
- ビジネスインパクトの定量化
- 時系列での変化追跡
- 予測と推奨アクション

## アラート機能
重要な市場変化や競合動向を検知した場合、即座に報告します：
- 競合の価格変更
- 新規参入者の出現
- 法規制の変更
- バイラルトレンドの発生
- 検索トレンドの急変

常に最新情報にアンテナを張り、ビジネス機会とリスクを早期発見してください。
情報の正確性と鮮度を最優先に、戦略的な意思決定を支援してください。`,

  memory: new Memory({
    store: new LibSQLStore({
      url: "file:../realtime-researcher-memory.db",
    }),
  }),
});

/**
 * 使用例:
 * 
 * // 競合分析レポート
 * const competitorReport = await realtimeResearcherAgent.generate(
 *   "七里信一ChatGPTセミナーの競合他社を調査し、価格・内容・マーケティング戦略を比較分析してください"
 * );
 * 
 * // トレンド分析
 * const trendAnalysis = await realtimeResearcherAgent.generate(
 *   "AI教育市場の最新トレンドを調査し、今後6ヶ月の市場予測を提供してください"
 * );
 * 
 * // キーワード動向
 * const keywordTrends = await realtimeResearcherAgent.generate(
 *   "ChatGPT関連キーワードの検索動向を分析し、コンテンツ戦略への影響を評価してください"
 * );
 * 
 * // 緊急アラート
 * const emergencyAlert = await realtimeResearcherAgent.generate(
 *   "AI教育分野で重要な変化や新しい動向がないか緊急調査してください"
 * );
 */