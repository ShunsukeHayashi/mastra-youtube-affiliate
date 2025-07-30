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
  | 'mcp-integrated';

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
} as const;