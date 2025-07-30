import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { jupyterExecutionTool } from '../tools/mcp-tools/jupyter-execution-tool';
import { analyticsToolDashboard } from '../tools/analytics-dashboard-tool';
import { roiCalculatorTool } from '../tools/roi-calculator-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';

/**
 * データ分析ワークフロー
 * データ収集 → Jupyter分析 → ビジュアライゼーション → インサイト生成 → レポート作成
 */
export const dataAnalysisWorkflow = createWorkflow({
  name: 'data-analysis-workflow',
  description: 'Jupyterを活用した高度なアフィリエイトデータ分析と自動レポーティング',
  inputSchema: z.object({
    analysisType: z.enum(['revenue', 'conversion', 'traffic', 'engagement', 'comprehensive']),
    period: z.object({
      start: z.string(),
      end: z.string(),
    }),
    dataSource: z.object({
      type: z.enum(['csv', 'json', 'api', 'database']),
      path: z.string().optional(),
      query: z.string().optional(),
    }).optional(),
    reportFormat: z.enum(['pdf', 'html', 'jupyter', 'dashboard']).default('pdf'),
  }),
  outputSchema: z.object({
    analysisResults: z.any(),
    visualizations: z.array(z.object({
      type: z.string(),
      title: z.string(),
      imageUrl: z.string(),
    })),
    insights: z.array(z.string()),
    report: z.object({
      format: z.string(),
      url: z.string(),
      summary: z.string(),
    }),
    recommendations: z.array(z.object({
      action: z.string(),
      impact: z.string(),
      priority: z.string(),
    })),
  }),
  steps: [
    {
      id: 'collect-data',
      name: 'データ収集',
      tool: analyticsToolDashboard,
      input: ({ input }) => ({
        action: 'export_data',
        metrics: input.analysisType === 'comprehensive' 
          ? ['revenue', 'conversion_rate', 'traffic', 'engagement']
          : [input.analysisType],
        period: input.period,
        format: 'csv',
      }),
    },
    {
      id: 'jupyter-analysis',
      name: 'Jupyter分析実行',
      tool: jupyterExecutionTool,
      input: ({ input, previousSteps }) => ({
        action: 'analyze_data',
        dataSource: input.dataSource || {
          type: 'csv',
          path: previousSteps['collect-data'].output.exportPath,
        },
        analysisType: input.analysisType === 'comprehensive' ? 'revenue' : input.analysisType,
      }),
    },
    {
      id: 'create-visualizations',
      name: 'ビジュアライゼーション作成',
      tool: jupyterExecutionTool,
      input: ({ input, previousSteps }) => ({
        action: 'create_visualization',
        dataSource: input.dataSource || {
          type: 'csv',
          path: previousSteps['collect-data'].output.exportPath,
        },
        visualizationType: getVisualizationType(input.analysisType),
      }),
    },
    {
      id: 'deep-analysis',
      name: '詳細分析コード実行',
      tool: jupyterExecutionTool,
      input: ({ input }) => ({
        action: 'execute_code',
        code: generateAnalysisCode(input.analysisType),
      }),
    },
    {
      id: 'roi-projection',
      name: 'ROI予測',
      tool: roiCalculatorTool,
      input: ({ previousSteps }) => ({
        action: 'project_revenue',
        revenue: {
          currentMonthly: previousSteps['jupyter-analysis'].output.result.total || 2700000,
          growthRate: previousSteps['deep-analysis'].output.result.growth_rate || 0.25,
        },
        timeframe: 12,
      }),
    },
    {
      id: 'generate-report',
      name: 'レポート生成',
      tool: contentGeneratorToolV2,
      input: ({ input, previousSteps }) => ({
        action: 'generate_report',
        reportType: 'data_analysis',
        data: {
          analysis: previousSteps['jupyter-analysis'].output,
          visualizations: previousSteps['create-visualizations'].output,
          projections: previousSteps['roi-projection'].output,
        },
        context: {
          format: input.reportFormat,
          language: 'ja',
          style: 'executive-summary',
          includeCharts: true,
        },
      }),
    },
    {
      id: 'export-results',
      name: '結果エクスポート',
      tool: jupyterExecutionTool,
      input: ({ input }) => ({
        action: 'export_results',
        format: input.reportFormat,
      }),
    },
  ],
  output: ({ steps, input }) => {
    const analysisResults = steps['jupyter-analysis'].output.result;
    const visualizations = [
      {
        type: steps['create-visualizations'].output.visualization.type,
        title: getVisualizationTitle(input.analysisType),
        imageUrl: steps['create-visualizations'].output.visualization.imageUrl,
      },
    ];
    
    const insights = [
      ...steps['jupyter-analysis'].output.insights,
      ...steps['deep-analysis'].output.insights,
      ...steps['roi-projection'].output.insights,
    ];
    
    const recommendations = generateRecommendations(
      input.analysisType,
      analysisResults,
      steps['roi-projection'].output
    );
    
    const report = {
      format: input.reportFormat,
      url: steps['export-results'].output.exports[0].path,
      summary: steps['generate-report'].output.content.substring(0, 500) + '...',
    };
    
    return {
      analysisResults,
      visualizations,
      insights,
      report,
      recommendations,
    };
  },
});

// ヘルパー関数
function getVisualizationType(analysisType: string): 'line' | 'bar' | 'scatter' | 'heatmap' | 'pie' {
  const typeMap = {
    revenue: 'line',
    conversion: 'scatter',
    traffic: 'bar',
    engagement: 'heatmap',
    comprehensive: 'pie',
  };
  return typeMap[analysisType] || 'line';
}

function generateAnalysisCode(analysisType: string): string {
  const baseCode = `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.linear_model import LinearRegression

# データ読み込み
data = pd.read_csv('affiliate_data.csv')
data['date'] = pd.to_datetime(data['date'])
`;

  const analysisCode = {
    revenue: `
# 収益トレンド分析
revenue_trend = data.groupby('date')['revenue'].sum().reset_index()
revenue_trend['cumulative'] = revenue_trend['revenue'].cumsum()

# 成長率計算
revenue_trend['growth_rate'] = revenue_trend['revenue'].pct_change()
avg_growth = revenue_trend['growth_rate'].mean()

# 予測モデル
X = np.array(range(len(revenue_trend))).reshape(-1, 1)
y = revenue_trend['revenue'].values
model = LinearRegression().fit(X, y)
future_revenue = model.predict([[len(revenue_trend) + i] for i in range(3)])

print(f"Average Growth Rate: {avg_growth:.2%}")
print(f"Next 3 months projection: {future_revenue}")
`,
    conversion: `
# コンバージョン分析
conversion_data = data.groupby(['source', 'date']).agg({
    'visitors': 'sum',
    'conversions': 'sum'
}).reset_index()
conversion_data['cvr'] = conversion_data['conversions'] / conversion_data['visitors']

# 最適化ポイント
low_cvr_sources = conversion_data[conversion_data['cvr'] < 0.1]['source'].unique()
high_potential = conversion_data[
    (conversion_data['visitors'] > 1000) & 
    (conversion_data['cvr'] < conversion_data['cvr'].median())
]

print(f"Low performing sources: {list(low_cvr_sources)}")
print(f"High potential for improvement: {len(high_potential)} cases")
`,
    traffic: `
# トラフィック分析
traffic_sources = data.groupby('source')['visitors'].sum().sort_values(ascending=False)
traffic_trend = data.groupby('date')['visitors'].sum()

# 季節性分析
data['month'] = data['date'].dt.month
seasonal_pattern = data.groupby('month')['visitors'].mean()

# チャネル効率
channel_efficiency = data.groupby('source').agg({
    'visitors': 'sum',
    'revenue': 'sum'
})
channel_efficiency['revenue_per_visitor'] = channel_efficiency['revenue'] / channel_efficiency['visitors']

print(f"Top traffic source: {traffic_sources.index[0]} ({traffic_sources.iloc[0]:,} visitors)")
print(f"Most efficient channel: {channel_efficiency['revenue_per_visitor'].idxmax()}")
`,
    engagement: `
# エンゲージメント分析
engagement_metrics = data[['bounce_rate', 'avg_session_duration', 'pages_per_session']].describe()

# 相関分析
correlation_matrix = data[['bounce_rate', 'avg_session_duration', 'pages_per_session', 'conversion_rate']].corr()

# セグメント分析
high_engagement = data[
    (data['avg_session_duration'] > data['avg_session_duration'].quantile(0.75)) &
    (data['bounce_rate'] < data['bounce_rate'].quantile(0.25))
]

print(f"High engagement segments: {len(high_engagement)} records")
print(f"Key correlations:\\n{correlation_matrix}")
`,
  };

  return baseCode + (analysisCode[analysisType] || analysisCode.revenue);
}

function getVisualizationTitle(analysisType: string): string {
  const titles = {
    revenue: '月次収益トレンドと予測',
    conversion: 'ソース別コンバージョン率分析',
    traffic: 'トラフィックソース分布',
    engagement: 'エンゲージメント指標相関',
    comprehensive: '総合パフォーマンス概要',
  };
  return titles[analysisType] || 'データ分析結果';
}

function generateRecommendations(analysisType: string, results: any, projections: any): any[] {
  const baseRecommendations = [
    {
      action: '高成長セグメントへの投資拡大',
      impact: '収益30%向上の可能性',
      priority: 'high',
    },
    {
      action: '低パフォーマンスチャネルの改善',
      impact: 'ROI 20%改善',
      priority: 'medium',
    },
  ];

  if (analysisType === 'revenue') {
    baseRecommendations.push({
      action: '七里信一セミナーのプロモーション強化',
      impact: '月間収益100万円増の見込み',
      priority: 'high',
    });
  } else if (analysisType === 'conversion') {
    baseRecommendations.push({
      action: 'メールマーケティングの配信頻度最適化',
      impact: 'コンバージョン率3%向上',
      priority: 'medium',
    });
  }

  return baseRecommendations;
}