// MCP Tools Import
import { ideDiagnosticsTool } from './ide-diagnostics-tool';
import { jupyterExecutionTool } from './jupyter-execution-tool';
import { larkBaseTool } from './lark-base-tool';
import { larkDocsTool } from './lark-docs-tool';
import { larkGenesisTool } from './lark-genesis-tool';
import { gasInterpreterTool } from './gas-interpreter-tool';
import { difyWorkflowTool } from './dify-workflow-tool';

// Gemini API Tools Import
import { geminiSearchTool } from '../gemini-search-tool';
import { geminiCodeExecutionTool } from '../gemini-code-execution-tool';
import { geminiImageGenerationTool } from '../gemini-image-generation-tool';

// MCP Tools Export
export { ideDiagnosticsTool } from './ide-diagnostics-tool';
export { jupyterExecutionTool } from './jupyter-execution-tool';
export { larkBaseTool } from './lark-base-tool';
export { larkDocsTool } from './lark-docs-tool';
export { larkGenesisTool } from './lark-genesis-tool';
export { gasInterpreterTool } from './gas-interpreter-tool';
export { difyWorkflowTool } from './dify-workflow-tool';

// Gemini API Tools Export
export { geminiSearchTool } from '../gemini-search-tool';
export { geminiCodeExecutionTool } from '../gemini-code-execution-tool';
export { geminiImageGenerationTool } from '../gemini-image-generation-tool';

// MCP Tool Registry
export const mcpTools = {
  'ide-diagnostics': ideDiagnosticsTool,
  'jupyter-execution': jupyterExecutionTool,
  'lark-base': larkBaseTool,
  'lark-docs': larkDocsTool,
  'lark-genesis': larkGenesisTool,
  'gas-interpreter': gasInterpreterTool,
  'dify-workflow': difyWorkflowTool,
} as const;

// Gemini API Tool Registry
export const geminiTools = {
  'gemini-search': geminiSearchTool,
  'gemini-code-execution': geminiCodeExecutionTool,
  'gemini-image-generation': geminiImageGenerationTool,
} as const;

// Combined Tool Registry
export const allTools = {
  ...mcpTools,
  ...geminiTools,
} as const;

// MCP Tool Types
export type MCPToolName = keyof typeof mcpTools;
export type GeminiToolName = keyof typeof geminiTools;
export type AllToolName = keyof typeof allTools;

// MCP Tool Descriptions
export const mcpToolDescriptions = {
  'ide-diagnostics': 'VS Codeから診断情報を取得してコード品質を確保',
  'jupyter-execution': 'Jupyterでデータ分析とビジュアライゼーションを実行',
  'lark-base': 'Lark多維表格でデータ管理と分析',
  'lark-docs': 'Larkドキュメントでコンテンツ作成と管理',
  'lark-genesis': 'Genesis AIで高度なコンテンツ生成',
  'gas-interpreter': 'Google Apps Scriptで自動化',
  'dify-workflow': 'Difyワークフローの自動生成と管理',
} as const;

// Gemini Tool Descriptions
export const geminiToolDescriptions = {
  'gemini-search': 'Google検索でリアルタイム情報を取得し、回答を強化',
  'gemini-code-execution': 'Pythonコードを実行し、データ分析と可視化を実行',
  'gemini-image-generation': 'Imagenでテキストから高品質な画像を生成',
} as const;

// All Tool Descriptions
export const allToolDescriptions = {
  ...mcpToolDescriptions,
  ...geminiToolDescriptions,
} as const;