// Core Tools Export
export { weatherTool } from './weather-tool';
export { productAnalysisTool } from './product-analysis-tool';
export { contentGeneratorTool } from './content-generator-tool';
export { contentGeneratorToolV2 } from './content-generator-tool-v2';
export { competitorAnalysisTool } from './competitor-analysis-tool';
export { abTestingTool } from './ab-testing-tool';
export { roiCalculatorTool } from './roi-calculator-tool';
export { socialMediaSchedulingTool } from './social-media-scheduling-tool';
export { emailAutomationTool } from './email-automation-tool';
export { seoOptimizationTool } from './seo-optimization-tool';
export { analyticsDashboardTool } from './analytics-dashboard-tool';
export { leadMagnetGeneratorTool } from './lead-magnet-generator-tool';
export { personaGeneratorTool } from './persona-generator';
export { complianceCheckerTool } from './compliance-checker-tool';
export { relationshipManagementTool } from './relationship-management-tool';

// YouTube Tools Export
export { youtubeAnalyticsTool } from './youtube-analytics';
export { youtubeKeywordResearchTool } from './youtube-keyword-research';
export { youtubeThumbnailGeneratorTool } from './youtube-thumbnail-generator';
export { youtubeTitleGeneratorTool } from './youtube-title-generator';
export { scriptStructureGeneratorTool } from './script-structure-generator';
export { scriptStyleSelectorTool } from './script-style-selector';
export { advancedScriptStylesTool } from './advanced-script-styles';
export { hookGeneratorTool } from './hook-generator';

// Gemini API Tools Export
export { geminiSearchTool } from './gemini-search-tool';
export { geminiCodeExecutionTool } from './gemini-code-execution-tool';
export { geminiImageGenerationTool } from './gemini-image-generation-tool';

// Re-export MCP tools
export * from './mcp-tools';

// Tool Collections
export const coreTools = () => ({
  'get-weather': weatherTool,
  'analyze-ai-product': productAnalysisTool,
  'generate-affiliate-content': contentGeneratorTool,
  'generate-affiliate-content-v2': contentGeneratorToolV2,
  'analyze-competitors': competitorAnalysisTool,
  'ab-testing': abTestingTool,
  'roi-calculator': roiCalculatorTool,
  'social-media-scheduling': socialMediaSchedulingTool,
  'email-automation': emailAutomationTool,
  'seo-optimization': seoOptimizationTool,
  'analytics-dashboard': analyticsDashboardTool,
  'lead-magnet-generator': leadMagnetGeneratorTool,
  'persona-generator': personaGeneratorTool,
  'compliance-checker': complianceCheckerTool,
  'relationship-management': relationshipManagementTool,
});

export const youtubeTools = () => ({
  'youtube-analytics': youtubeAnalyticsTool,
  'youtube-keyword-research': youtubeKeywordResearchTool,
  'youtube-thumbnail-generator': youtubeThumbnailGeneratorTool,
  'youtube-title-generator': youtubeTitleGeneratorTool,
  'script-structure-generator': scriptStructureGeneratorTool,
  'script-style-selector': scriptStyleSelectorTool,
  'advanced-script-styles': advancedScriptStylesTool,
  'hook-generator': hookGeneratorTool,
});

export const geminiApiTools = () => ({
  'gemini-search-grounding': geminiSearchTool,
  'gemini-code-execution': geminiCodeExecutionTool,
  'gemini-image-generation': geminiImageGenerationTool,
});

// Import MCP tools from sub-module
import { mcpTools } from './mcp-tools';

// Combined all tools
export const allMastraTools = () => ({
  ...coreTools(),
  ...youtubeTools(),
  ...geminiApiTools(),
  ...mcpTools,
});

// Tool Types
export type CoreToolName = keyof ReturnType<typeof coreTools>;
export type YouTubeToolName = keyof ReturnType<typeof youtubeTools>;
export type GeminiApiToolName = keyof ReturnType<typeof geminiApiTools>;
export type AllMastraToolName = keyof ReturnType<typeof allMastraTools>;

// Tool Descriptions
export const toolDescriptions = {
  // Core Tools
  'get-weather': '指定都市の天気情報を取得',
  'analyze-ai-product': 'AI教育製品の詳細分析とスコアリング',
  'generate-affiliate-content': 'アフィリエイトコンテンツの自動生成',
  'generate-affiliate-content-v2': '拡張版コンテンツ生成（RuntimeContext対応）',
  'analyze-competitors': '競合分析と戦略的ポジショニング',
  'ab-testing': 'A/Bテストの作成と管理',
  'roi-calculator': 'ROI計算と収益予測',
  'social-media-scheduling': 'ソーシャルメディア投稿のスケジューリング',
  'email-automation': 'メール自動化とキャンペーン管理',
  'seo-optimization': 'SEO最適化と分析',
  'analytics-dashboard': '統合分析ダッシュボード',
  'lead-magnet-generator': 'リードマグネットの自動生成',
  'persona-generator': 'ターゲットペルソナの生成',
  'compliance-checker': '法的コンプライアンスチェック',
  'relationship-management': 'パートナー関係管理',
  
  // YouTube Tools
  'youtube-analytics': 'YouTubeチャンネルと動画の分析',
  'youtube-keyword-research': 'YouTubeキーワードリサーチ',
  'youtube-thumbnail-generator': 'サムネイルコンセプト生成',
  'youtube-title-generator': 'SEO最適化タイトル生成',
  'script-structure-generator': 'スクリプト構造の生成',
  'script-style-selector': 'スクリプトスタイルの選択',
  'advanced-script-styles': '高度なスクリプトスタイル',
  'hook-generator': '強力なフック生成',
  
  // Gemini API Tools
  'gemini-search-grounding': 'Google検索でリアルタイム情報取得',
  'gemini-code-execution': 'Pythonコード実行とデータ分析',
  'gemini-image-generation': 'AI画像生成（Imagen）',
} as const;