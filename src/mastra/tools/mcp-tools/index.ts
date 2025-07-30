// MCP Tools Import
import { ideDiagnosticsTool } from './ide-diagnostics-tool';
import { jupyterExecutionTool } from './jupyter-execution-tool';
import { larkBaseTool } from './lark-base-tool';
import { larkDocsTool } from './lark-docs-tool';
import { larkGenesisTool } from './lark-genesis-tool';
import { gasInterpreterTool } from './gas-interpreter-tool';
import { difyWorkflowTool } from './dify-workflow-tool';

// MCP Tools Export
export { ideDiagnosticsTool } from './ide-diagnostics-tool';
export { jupyterExecutionTool } from './jupyter-execution-tool';
export { larkBaseTool } from './lark-base-tool';
export { larkDocsTool } from './lark-docs-tool';
export { larkGenesisTool } from './lark-genesis-tool';
export { gasInterpreterTool } from './gas-interpreter-tool';
export { difyWorkflowTool } from './dify-workflow-tool';

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

// MCP Tool Types
export type MCPToolName = keyof typeof mcpTools;

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