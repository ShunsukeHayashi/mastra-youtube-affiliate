import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { larkBaseTool } from '../tools/mcp-tools/lark-base-tool';
import { larkDocsTool } from '../tools/mcp-tools/lark-docs-tool';
import { larkGenesisTool } from '../tools/mcp-tools/lark-genesis-tool';
import { jupyterExecutionTool } from '../tools/mcp-tools/jupyter-execution-tool';
import { gasInterpreterTool } from '../tools/mcp-tools/gas-interpreter-tool';
import { difyWorkflowTool } from '../tools/mcp-tools/dify-workflow-tool';
import { ideDiagnosticsTool } from '../tools/mcp-tools/ide-diagnostics-tool';

/**
 * MCP統合ワークフロー
 * すべてのMCPツールを活用した包括的なアフィリエイトマーケティング自動化
 */
export const mcpIntegratedWorkflow = createWorkflow({
  name: 'mcp-integrated-workflow',
  description: 'MCPツール群を統合した完全自動化アフィリエイトマーケティングシステム',
  inputSchema: z.object({
    campaignName: z.string(),
    targetMonth: z.string(), // YYYY-MM format
    goals: z.object({
      revenue: z.number(),
      leads: z.number(),
      content: z.number(),
    }),
    focusProducts: z.array(z.string()),
  }),
  outputSchema: z.object({
    executionSummary: z.object({
      dataAnalysis: z.any(),
      contentGenerated: z.number(),
      workflowsCreated: z.number(),
      reportsGenerated: z.array(z.string()),
    }),
    performance: z.object({
      projectedRevenue: z.number(),
      expectedLeads: z.number(),
      automationSavings: z.number(), // hours saved
    }),
    deployments: z.array(z.object({
      system: z.string(),
      status: z.string(),
      url: z.string().optional(),
    })),
    nextActions: z.array(z.string()),
  }),
  steps: [
    {
      id: 'setup-lark-base',
      name: 'Larkデータベース構築',
      tool: larkBaseTool,
      input: ({ input }) => ({
        action: 'create_base',
        data: {
          campaignName: input.campaignName,
          products: input.focusProducts,
        },
      }),
    },
    {
      id: 'analyze-historical-data',
      name: 'Jupyter履歴データ分析',
      tool: jupyterExecutionTool,
      input: ({ input }) => ({
        action: 'analyze_data',
        dataSource: {
          type: 'csv',
          path: '/data/affiliate_history.csv',
        },
        analysisType: 'revenue',
      }),
    },
    {
      id: 'generate-content-strategy',
      name: 'Genesis AIコンテンツ戦略',
      tool: larkGenesisTool,
      input: ({ input, previousSteps }) => ({
        action: 'create_campaign',
        prompt: `${input.campaignName}の包括的コンテンツ戦略`,
        targetAudience: {
          demographics: '30-50歳のビジネスパーソン',
          interests: ['AI活用', 'ビジネス成長', '副業'],
          painPoints: ['時間不足', 'スキル不足', '収益化の壁'],
        },
      }),
    },
    {
      id: 'create-content-batch',
      name: 'コンテンツ一括生成',
      tool: larkGenesisTool,
      input: ({ input }) => ({
        action: 'generate_content',
        prompt: input.focusProducts[0],
        contentType: 'blog',
        language: 'ja',
        tone: 'educational',
      }),
      // Note: In production, this would loop through multiple content pieces
    },
    {
      id: 'store-content-docs',
      name: 'Larkドキュメント保存',
      tool: larkDocsTool,
      input: ({ previousSteps }) => ({
        action: 'create_document',
        title: `コンテンツライブラリ_${new Date().toISOString().split('T')[0]}`,
        content: previousSteps['create-content-batch'].output.generatedContent,
        template: 'blog',
      }),
    },
    {
      id: 'setup-gas-automation',
      name: 'GAS自動化設定',
      tool: gasInterpreterTool,
      input: ({ input }) => ({
        action: 'automate_workflow',
        spreadsheetId: 'affiliate_master_sheet',
      }),
    },
    {
      id: 'create-dify-workflows',
      name: 'Difyワークフロー構築',
      tool: difyWorkflowTool,
      input: ({ input }) => ({
        action: 'create_workflow',
        workflowType: 'lead_qualification',
        config: {
          name: `${input.campaignName}_リード処理`,
          description: '自動リードスコアリングと振り分け',
        },
      }),
    },
    {
      id: 'generate-chatbot',
      name: 'Difyチャットボット生成',
      tool: difyWorkflowTool,
      input: ({ input }) => ({
        action: 'generate_chatbot',
        config: {
          name: `${input.campaignName}アシスタント`,
          description: '24/7カスタマーサポート',
        },
      }),
    },
    {
      id: 'update-lark-metrics',
      name: 'Lark Base指標更新',
      tool: larkBaseTool,
      input: ({ previousSteps }) => ({
        action: 'insert_records',
        baseId: previousSteps['setup-lark-base'].output.baseId,
        tableId: 'revenue_tracking',
        data: [
          {
            date: new Date().toISOString(),
            campaign: 'MCP統合キャンペーン',
            status: 'active',
            projectedRevenue: previousSteps['analyze-historical-data'].output.result.projectedNext,
          },
        ],
      }),
    },
    {
      id: 'create-visualization',
      name: 'Jupyter可視化',
      tool: jupyterExecutionTool,
      input: ({ previousSteps }) => ({
        action: 'create_visualization',
        dataSource: {
          type: 'json',
          path: 'campaign_data.json',
        },
        visualizationType: 'line',
      }),
    },
    {
      id: 'generate-reports',
      name: 'レポート生成',
      tool: gasInterpreterTool,
      input: ({ input }) => ({
        action: 'create_report',
        spreadsheetId: 'campaign_results',
      }),
    },
    {
      id: 'code-quality-check',
      name: 'コード品質チェック',
      tool: ideDiagnosticsTool,
      input: () => ({
        action: 'get_all_diagnostics',
      }),
    },
    {
      id: 'deploy-workflows',
      name: 'ワークフローデプロイ',
      tool: difyWorkflowTool,
      input: ({ previousSteps }) => ({
        action: 'deploy_workflow',
        config: {
          name: 'mcp_integrated_system',
        },
        deploymentTarget: 'production',
      }),
    },
  ],
  output: ({ steps, input }) => {
    const executionSummary = {
      dataAnalysis: steps['analyze-historical-data'].output.result,
      contentGenerated: 1, // In production, this would be dynamic
      workflowsCreated: 2, // Lead workflow + Chatbot
      reportsGenerated: [
        steps['generate-reports'].output.result.url,
        steps['store-content-docs'].output.url,
      ],
    };
    
    const performance = {
      projectedRevenue: steps['analyze-historical-data'].output.result.projectedNext || input.goals.revenue,
      expectedLeads: Math.round(input.goals.leads * 1.2), // 20% improvement expected
      automationSavings: 160, // hours per month
    };
    
    const deployments = [
      {
        system: 'Lark Base',
        status: 'active',
        url: `https://lark.com/base/${steps['setup-lark-base'].output.baseId}`,
      },
      {
        system: 'Dify Workflows',
        status: steps['deploy-workflows'].output.deploymentStatus,
        url: steps['deploy-workflows'].output.workflowUrl,
      },
      {
        system: 'GAS Automation',
        status: 'running',
        url: steps['generate-reports'].output.result.url,
      },
      {
        system: 'Chatbot',
        status: 'live',
        url: steps['generate-chatbot'].output.workflowUrl,
      },
    ];
    
    const nextActions = [
      'Lark Baseダッシュボードでリアルタイムモニタリング',
      'Jupyterノートブックで詳細分析を継続',
      'Genesis AIで追加コンテンツを生成',
      'GASトリガーの動作確認',
      'Difyワークフローのパフォーマンスチューニング',
    ];
    
    return {
      executionSummary,
      performance,
      deployments,
      nextActions,
    };
  },
});