import { createAgentNetwork } from '@mastra/core/agent-network';
import { google } from '@ai-sdk/google';
import { affiliateAgent } from '../agents/affiliate-agent';
import { marketAnalystAgent } from '../agents/market-analyst-agent';
import { contentCreatorAgent } from '../agents/content-creator-agent';
import { optimizationSpecialistAgent } from '../agents/optimization-specialist-agent';
import { relationshipManagerAgent } from '../agents/relationship-manager-agent';
import { dataScientistAgent } from '../agents/data-scientist-agent';
import { visualDesignerAgent } from '../agents/visual-designer-agent';
import { realtimeResearcherAgent } from '../agents/realtime-researcher-agent';

/**
 * 強化されたアフィリエイトネットワーク
 * 
 * 8つの専門エージェントが協調して高度なアフィリエイトマーケティング業務を実行
 * 動的エージェント選択とタスク分散により効率と品質を最大化
 */
export const enhancedAffiliateNetwork = createAgentNetwork({
  id: 'enhanced-affiliate-network',
  name: '強化アフィリエイトネットワーク',
  description: '8つの専門エージェントによる高度なアフィリエイトマーケティング協調システム',
  model: google('gemini-2.5-pro'),
  
  agents: {
    // 既存エージェント
    affiliate: affiliateAgent,
    marketAnalyst: marketAnalystAgent,
    contentCreator: contentCreatorAgent,
    optimizationSpecialist: optimizationSpecialistAgent,
    relationshipManager: relationshipManagerAgent,
    
    // 新規エージェント
    dataScientist: dataScientistAgent,
    visualDesigner: visualDesignerAgent,
    realtimeResearcher: realtimeResearcherAgent,
  },

  systemPrompt: `あなたは8つの専門エージェントを統括する高度なアフィリエイトマーケティングネットワークのオーケストレーターです。

## エージェント構成と専門性

### 戦略・分析チーム
1. **Affiliate Agent** - 総合戦略とプロジェクト管理
2. **Market Analyst Agent** - 市場分析と競合調査
3. **Data Scientist Agent** - 高度データ分析と予測モデリング
4. **Realtime Researcher Agent** - リアルタイム情報収集と監視

### 制作・最適化チーム  
5. **Content Creator Agent** - コンテンツ企画・制作
6. **Visual Designer Agent** - ビジュアルコンテンツ制作
7. **Optimization Specialist Agent** - パフォーマンス最適化
8. **Relationship Manager Agent** - パートナー関係管理

## 協調プロセス

### Phase 1: 戦略策定
1. **Realtime Researcher** が最新市場情報を収集
2. **Market Analyst** が競合分析と市場ポジショニングを実行
3. **Data Scientist** が過去データから予測モデルを構築
4. **Affiliate** が総合戦略を策定

### Phase 2: コンテンツ制作
1. **Content Creator** がコンテンツ戦略と原稿を作成
2. **Visual Designer** がビジュアルコンテンツを制作
3. **Optimization Specialist** がA/Bテスト設計
4. **Relationship Manager** がパートナー調整

### Phase 3: 実行・最適化
1. **Data Scientist** がパフォーマンス分析
2. **Optimization Specialist** が継続改善実行
3. **Realtime Researcher** が市場変化を監視
4. **Affiliate** が全体統括と次期戦略策定

## タスク分散ルール

### 高複雑度タスク
- 複数エージェントの専門性を組み合わせ
- 段階的な品質チェック
- クロスバリデーション実行

### 緊急度高タスク
- 最適エージェントに直接割り当て
- 並列処理による高速化
- リアルタイム進捗共有

### 学習・改善タスク
- 全エージェントで知見共有
- ベストプラクティス蓄積
- 継続的能力向上

## 品質保証システム
- 複数エージェントによるピアレビュー
- データドリブンな意思決定
- 成果物の一貫性確保
- ブランドガイドライン遵守

## パフォーマンス監視
- KPI自動追跡
- エージェント個別評価
- ネットワーク効率分析
- 改善提案の自動生成

各エージェントの専門性を最大限活用し、シナジー効果による価値創出を実現してください。`,

  // エージェント選択ロジック
  routingLogic: async (task: string, context: any) => {
    // タスクの複雑度と緊急度を分析
    const complexity = analyzeTaskComplexity(task);
    const urgency = analyzeTaskUrgency(task);
    const domain = identifyTaskDomain(task);

    // 単一エージェント処理
    if (complexity === 'low' && urgency === 'high') {
      return selectBestAgent(domain);
    }

    // マルチエージェント協調
    if (complexity === 'high') {
      return createAgentChain(domain, task);
    }

    // デフォルト: 主担当エージェント + 品質チェック
    return [selectBestAgent(domain), 'affiliate'];
  },
});

/**
 * タスクの複雑度を分析
 */
function analyzeTaskComplexity(task: string): 'low' | 'medium' | 'high' {
  const complexityIndicators = [
    '分析', '予測', '最適化', '戦略', '設計',
    'A/Bテスト', 'データ', '競合', '市場'
  ];
  
  const matches = complexityIndicators.filter(indicator => 
    task.toLowerCase().includes(indicator)
  ).length;
  
  if (matches >= 3) return 'high';
  if (matches >= 1) return 'medium';
  return 'low';
}

/**
 * タスクの緊急度を分析
 */
function analyzeTaskUrgency(task: string): 'low' | 'medium' | 'high' {
  const urgencyIndicators = [
    '緊急', '急ぎ', '今すぐ', 'ASAP', '即座',
    '今日', '明日', 'リアルタイム'
  ];
  
  const hasUrgencyKeyword = urgencyIndicators.some(indicator =>
    task.toLowerCase().includes(indicator)
  );
  
  return hasUrgencyKeyword ? 'high' : 'medium';
}

/**
 * タスクドメインを特定
 */
function identifyTaskDomain(task: string): string {
  const domains = {
    data: ['データ', '分析', '統計', '予測', 'AI', '機械学習'],
    visual: ['画像', 'デザイン', 'ビジュアル', 'バナー', 'サムネイル'],
    research: ['調査', 'リサーチ', '競合', '市場', 'トレンド'],
    content: ['コンテンツ', '記事', 'ブログ', 'メール', 'SNS'],
    optimization: ['最適化', 'A/B', 'テスト', 'コンバージョン'],
    relationship: ['関係', 'パートナー', '交渉', 'コミュニケーション'],
    strategy: ['戦略', '計画', '方針', '目標'],
  };

  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(keyword => task.includes(keyword))) {
      return domain;
    }
  }
  
  return 'strategy'; // デフォルト
}

/**
 * ドメインに基づく最適エージェント選択
 */
function selectBestAgent(domain: string): string {
  const agentMapping = {
    data: 'dataScientist',
    visual: 'visualDesigner', 
    research: 'realtimeResearcher',
    content: 'contentCreator',
    optimization: 'optimizationSpecialist',
    relationship: 'relationshipManager',
    strategy: 'affiliate',
    market: 'marketAnalyst',
  };
  
  return agentMapping[domain] || 'affiliate';
}

/**
 * 複雑タスク用エージェントチェーン作成
 */
function createAgentChain(domain: string, task: string): string[] {
  // 基本チェーン: リサーチ → 分析 → 制作 → 最適化
  const baseChain = [
    'realtimeResearcher',  // 情報収集
    'dataScientist',       // データ分析
    'contentCreator',      // コンテンツ制作
    'optimizationSpecialist' // 最適化
  ];
  
  // ドメイン特化の調整
  if (domain === 'visual') {
    baseChain.splice(2, 1, 'visualDesigner');
  }
  
  if (domain === 'market') {
    baseChain.splice(1, 0, 'marketAnalyst');
  }
  
  // 最終レビューを追加
  baseChain.push('affiliate');
  
  return baseChain;
}

/**
 * 使用例:
 * 
 * // 包括的なキャンペーン作成
 * const campaign = await enhancedAffiliateNetwork.generate(
 *   "ChatGPTセミナーの包括的なマーケティングキャンペーンを企画し、データ分析から画像制作まで完全実行"
 * );
 * 
 * // 緊急の競合分析
 * const urgentAnalysis = await enhancedAffiliateNetwork.generate(
 *   "緊急: 新しい競合が出現しました。即座に分析して対策を提案してください"
 * );
 * 
 * // 高度なデータ分析タスク
 * const dataAnalysis = await enhancedAffiliateNetwork.generate(
 *   "過去1年のアフィリエイトデータを機械学習で分析し、今後の収益予測モデルを構築"
 * );
 */