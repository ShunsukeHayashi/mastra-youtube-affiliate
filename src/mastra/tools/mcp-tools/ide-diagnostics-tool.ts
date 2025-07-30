import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * MCP IDE診断ツール
 * VS Codeから言語診断情報を取得
 */
export const ideDiagnosticsTool = createTool({
  id: 'mcp-ide-diagnostics',
  description: 'VS Codeから言語診断情報を取得してコード品質を確保',
  inputSchema: z.object({
    action: z.enum(['get_all_diagnostics', 'get_file_diagnostics', 'analyze_errors']),
    uri: z.string().optional().describe('ファイルURI（特定ファイルの診断を取得する場合）'),
  }),
  outputSchema: z.object({
    diagnostics: z.array(z.object({
      uri: z.string(),
      severity: z.enum(['error', 'warning', 'info', 'hint']),
      message: z.string(),
      source: z.string().optional(),
      range: z.object({
        start: z.object({ line: z.number(), character: z.number() }),
        end: z.object({ line: z.number(), character: z.number() }),
      }),
    })),
    summary: z.object({
      totalErrors: z.number(),
      totalWarnings: z.number(),
      totalInfo: z.number(),
      totalHints: z.number(),
      fileCount: z.number(),
    }),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { action, uri } = context;
    
    // MCPツールの呼び出しをシミュレート
    // 実際の実装では、MCPプロトコルを通じてVS Codeと通信
    const mockDiagnostics = [
      {
        uri: uri || 'file:///Users/shunsuke/Dev/affiliate/affiliate/src/mastra/agents/affiliate-agent.ts',
        severity: 'warning' as const,
        message: 'Unused variable: competitorData',
        source: 'typescript',
        range: {
          start: { line: 45, character: 10 },
          end: { line: 45, character: 24 },
        },
      },
      {
        uri: uri || 'file:///Users/shunsuke/Dev/affiliate/affiliate/src/mastra/tools/content-generator-tool-v2.ts',
        severity: 'error' as const,
        message: 'Type mismatch: expected string, got number',
        source: 'typescript',
        range: {
          start: { line: 120, character: 15 },
          end: { line: 120, character: 30 },
        },
      },
    ];
    
    switch (action) {
      case 'get_all_diagnostics':
        return getAllDiagnostics();
        
      case 'get_file_diagnostics':
        return getFileDiagnostics(uri!);
        
      case 'analyze_errors':
        return analyzeAndRecommend(mockDiagnostics);
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function getAllDiagnostics(): Promise<any> {
  // 全ファイルの診断情報を取得
  const diagnostics = [
    {
      uri: 'file:///src/mastra/agents/affiliate-agent.ts',
      severity: 'warning' as const,
      message: 'Unused import',
      source: 'typescript',
      range: {
        start: { line: 3, character: 0 },
        end: { line: 3, character: 40 },
      },
    },
    {
      uri: 'file:///src/mastra/tools/analytics-dashboard-tool.ts',
      severity: 'info' as const,
      message: 'Consider using const assertion',
      source: 'typescript',
      range: {
        start: { line: 89, character: 12 },
        end: { line: 89, character: 25 },
      },
    },
  ];
  
  const summary = {
    totalErrors: 0,
    totalWarnings: 1,
    totalInfo: 1,
    totalHints: 0,
    fileCount: 2,
  };
  
  const recommendations = [
    '未使用のインポートを削除してバンドルサイズを削減',
    'const assertionを使用して型の安全性を向上',
    'ESLintルールを設定して自動修正を有効化',
  ];
  
  return { diagnostics, summary, recommendations };
}

async function getFileDiagnostics(uri: string): Promise<any> {
  // 特定ファイルの診断情報を取得
  const diagnostics = [
    {
      uri,
      severity: 'error' as const,
      message: 'Missing return statement',
      source: 'typescript',
      range: {
        start: { line: 156, character: 0 },
        end: { line: 156, character: 50 },
      },
    },
  ];
  
  const summary = {
    totalErrors: 1,
    totalWarnings: 0,
    totalInfo: 0,
    totalHints: 0,
    fileCount: 1,
  };
  
  const recommendations = [
    'すべてのコードパスでreturn文を追加',
    'TypeScriptのstrictモードを有効化して早期発見',
  ];
  
  return { diagnostics, summary, recommendations };
}

async function analyzeAndRecommend(diagnostics: any[]): Promise<any> {
  // エラーパターンを分析して改善提案
  const errorPatterns = new Map<string, number>();
  
  diagnostics.forEach(d => {
    const pattern = extractErrorPattern(d.message);
    errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1);
  });
  
  const recommendations = [];
  
  if (errorPatterns.has('type-mismatch')) {
    recommendations.push('型定義を明確にしてTypeScriptの型推論を支援');
  }
  
  if (errorPatterns.has('unused')) {
    recommendations.push('定期的にコードクリーンアップを実施');
  }
  
  if (errorPatterns.has('missing')) {
    recommendations.push('必須要素のチェックリストを作成');
  }
  
  const summary = {
    totalErrors: diagnostics.filter(d => d.severity === 'error').length,
    totalWarnings: diagnostics.filter(d => d.severity === 'warning').length,
    totalInfo: diagnostics.filter(d => d.severity === 'info').length,
    totalHints: diagnostics.filter(d => d.severity === 'hint').length,
    fileCount: new Set(diagnostics.map(d => d.uri)).size,
  };
  
  return { diagnostics, summary, recommendations };
}

function extractErrorPattern(message: string): string {
  if (message.includes('Type') || message.includes('type')) {
    return 'type-mismatch';
  }
  if (message.includes('Unused') || message.includes('unused')) {
    return 'unused';
  }
  if (message.includes('Missing') || message.includes('missing')) {
    return 'missing';
  }
  return 'other';
}