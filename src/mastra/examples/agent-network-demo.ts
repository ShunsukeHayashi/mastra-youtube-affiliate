/**
 * AgentNetwork使用例
 * 
 * AgentNetworkは複数の専門エージェントを動的に協調させて
 * 複雑なタスクを解決します。
 */

import { affiliateNetwork } from '../networks/affiliate-network';

// 使用例1: 新商品の包括的分析とコンテンツ戦略
async function comprehensiveProductAnalysis() {
  console.log('🚀 新商品の包括的分析を開始...\n');
  
  const result = await affiliateNetwork.generate(
    `七里信一ChatGPTセミナーについて、以下を実行してください：
    1. 市場での競合分析
    2. アフィリエイト収益性の評価
    3. 推薦記事の作成
    4. A/Bテスト計画の立案
    5. パートナーシップ戦略の提案`
  );
  
  console.log('📊 分析結果:', result.text);
}

// 使用例2: 月次キャンペーン立案
async function monthlyAffilitateCampaign() {
  console.log('📅 月次キャンペーンの立案...\n');
  
  const result = await affiliateNetwork.generate(
    `来月のアフィリエイトキャンペーンを計画してください。
    目標: 月収270万円達成
    
    以下を含めてください：
    - 推薦する商品の優先順位
    - 各商品のコンテンツ戦略
    - 最適化テストの計画
    - パートナー企業へのアプローチ方法`
  );
  
  console.log('📋 キャンペーン計画:', result.text);
}

// 使用例3: リアルタイムの成果分析と改善提案
async function performanceOptimization() {
  console.log('📈 パフォーマンス最適化分析...\n');
  
  const stream = await affiliateNetwork.stream(
    `現在のアフィリエイト成果を分析し、改善提案をしてください：
    - 現在のCVR: 8%（目標14%）
    - 主力商品: 七里信一ChatGPTセミナー
    - 課題: ランディングページの離脱率が高い
    
    具体的な改善アクションを提案してください。`
  );
  
  // ストリーミングレスポンスの処理
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }
}

// 使用例4: エージェント履歴の確認
async function checkAgentHistory() {
  console.log('📚 エージェント活動履歴...\n');
  
  // 各エージェントの活動サマリーを取得
  const summary = affiliateNetwork.getAgentInteractionSummary();
  console.log(summary);
  
  // 特定エージェントの詳細履歴
  const marketAnalystHistory = affiliateNetwork.getAgentHistory('market-analyst-agent');
  console.log('Market Analyst活動:', marketAnalystHistory);
}

// デモの実行
export async function runAgentNetworkDemo() {
  try {
    // 1. 包括的な商品分析
    await comprehensiveProductAnalysis();
    
    // 2. 月次キャンペーン立案
    await monthlyAffiligateCampaign();
    
    // 3. パフォーマンス最適化
    await performanceOptimization();
    
    // 4. 活動履歴の確認
    await checkAgentHistory();
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スタンドアロン実行
if (require.main === module) {
  runAgentNetworkDemo();
}