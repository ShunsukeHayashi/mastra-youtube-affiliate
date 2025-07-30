// Mastra Workflows Export
export { contentCreationWorkflow } from './content-creation-workflow';
export { leadNurturingWorkflow } from './lead-nurturing-workflow';
export { socialMediaCampaignWorkflow } from './social-media-campaign-workflow';
export { complianceCheckWorkflow } from './compliance-check-workflow';
export { revenueOptimizationWorkflow } from './revenue-optimization-workflow';
export { partnerOutreachWorkflow } from './partner-outreach-workflow';
export { workflowOrchestrator } from './workflow-orchestrator';
export { codeQualityWorkflow } from './code-quality-workflow';
export { dataAnalysisWorkflow } from './data-analysis-workflow';
export { mcpIntegratedWorkflow } from './mcp-integrated-workflow';

// Core Workflows
export { weatherWorkflow } from './weather-workflow';
export { affiliateWorkflow } from './affiliate-workflow';
export { marketResearchWorkflow } from './market-research-workflow';

// YouTube Workflows
export { youtubeChannelAnalysisWorkflow } from './youtube-channel-analysis';
export { youtubeConceptDesignWorkflow } from './youtube-concept-design';
export { youtubeMarketingSupportWorkflow } from './youtube-marketing-support';
export { youtubeScriptGenerationWorkflow } from './youtube-script-generation';

// Enhanced Workflows (NEW)
export { comprehensiveCampaignWorkflow } from './comprehensive-campaign-workflow';
export { dataDrivenOptimizationWorkflow } from './data-driven-optimization-workflow';

// Workflow Types
export type WorkflowName = 
  | 'content-creation'
  | 'lead-nurturing'
  | 'social-media-campaign'
  | 'compliance-check'
  | 'revenue-optimization'
  | 'partner-outreach'
  | 'workflow-orchestrator'
  | 'code-quality'
  | 'data-analysis'
  | 'mcp-integrated'
  | 'weather'
  | 'affiliate'
  | 'market-research'
  | 'youtube-channel-analysis'
  | 'youtube-concept-design'
  | 'youtube-marketing-support'
  | 'youtube-script-generation'
  | 'comprehensive-campaign'
  | 'data-driven-optimization';

// Workflow Registry
export const workflows = {
  'content-creation': contentCreationWorkflow,
  'lead-nurturing': leadNurturingWorkflow,
  'social-media-campaign': socialMediaCampaignWorkflow,
  'compliance-check': complianceCheckWorkflow,
  'revenue-optimization': revenueOptimizationWorkflow,
  'partner-outreach': partnerOutreachWorkflow,
  'workflow-orchestrator': workflowOrchestrator,
  'code-quality': codeQualityWorkflow,
  'data-analysis': dataAnalysisWorkflow,
  'mcp-integrated': mcpIntegratedWorkflow,
  
  // Core Workflows
  'weather': weatherWorkflow,
  'affiliate': affiliateWorkflow,
  'market-research': marketResearchWorkflow,
  
  // YouTube Workflows
  'youtube-channel-analysis': youtubeChannelAnalysisWorkflow,
  'youtube-concept-design': youtubeConceptDesignWorkflow,
  'youtube-marketing-support': youtubeMarketingSupportWorkflow,
  'youtube-script-generation': youtubeScriptGenerationWorkflow,
  
  // Enhanced Workflows (NEW)
  'comprehensive-campaign': comprehensiveCampaignWorkflow,
  'data-driven-optimization': dataDrivenOptimizationWorkflow,
} as const;

// Workflow Descriptions
export const workflowDescriptions = {
  'content-creation': '競合分析から最適化まで、コンテンツ作成の全プロセスを自動化',
  'lead-nurturing': 'リード獲得から顧客化まで、自動化されたナーチャリングプロセス',
  'social-media-campaign': 'マルチプラットフォーム対応の自動化されたソーシャルメディアキャンペーン',
  'compliance-check': '法的コンプライアンスを確保するための包括的チェックワークフロー',
  'revenue-optimization': '収益を最大化するための包括的な分析と最適化ワークフロー',
  'partner-outreach': '戦略的パートナーシップ構築のための自動化アウトリーチワークフロー',
  'workflow-orchestrator': '月次キャンペーンの完全自動化オーケストレーション',
  'code-quality': 'MCPを活用したコード品質の自動チェックと改善',
  'data-analysis': 'Jupyterを活用した高度なアフィリエイトデータ分析と自動レポーティング',
  'mcp-integrated': 'MCPツール群を統合した完全自動化アフィリエイトマーケティングシステム',
  
  // Core Workflows
  'weather': '天気情報取得とアクティビティ提案の自動化ワークフロー',
  'affiliate': 'AI教育商材の分析からコンテンツ生成、最適化まで包括的なアフィリエイトワークフロー',
  'market-research': 'AI教育市場の包括的調査と30日間コンテンツカレンダー生成',
  
  // YouTube Workflows
  'youtube-channel-analysis': 'YouTubeチャンネルの詳細分析と改善提案',
  'youtube-concept-design': 'YouTube動画企画の自動生成と最適化',
  'youtube-marketing-support': 'YouTube動画のマーケティング戦略立案と実行支援',
  'youtube-script-generation': 'YouTube動画台本の自動生成と最適化',
  
  // Enhanced Workflows (NEW)
  'comprehensive-campaign': '市場調査からコンテンツ制作、最適化まで完全自動化された8段階キャンペーン構築',
  'data-driven-optimization': '機械学習とリアルタイムデータ分析による継続的最適化ワークフロー',
} as const;