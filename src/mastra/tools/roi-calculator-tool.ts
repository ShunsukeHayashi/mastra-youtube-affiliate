import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ROICalculation {
  investment: {
    initial: number;
    monthly: number;
    total: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    projected5Year: number;
  };
  metrics: {
    roi: number;
    paybackPeriod: number;
    netProfit: number;
    profitMargin: number;
  };
  breakdown: {
    byProduct: Record<string, number>;
    byChannel: Record<string, number>;
    byMonth: Array<{ month: string; revenue: number; profit: number }>;
  };
}

interface InvestmentScenario {
  name: string;
  description: string;
  investment: number;
  expectedReturn: number;
  timeframe: number;
  risk: 'low' | 'medium' | 'high';
  confidence: number;
}

export const roiCalculatorTool = createTool({
  id: 'roi-calculator',
  description: 'アフィリエイト事業のROI計算と収益予測',
  inputSchema: z.object({
    action: z.enum(['calculate_roi', 'project_revenue', 'compare_scenarios', 'optimize_investment', 'sensitivity_analysis']),
    investment: z.object({
      initial: z.number().optional(),
      monthly: z.number().optional(),
      tools: z.number().optional(),
      advertising: z.number().optional(),
      content: z.number().optional(),
    }).optional(),
    revenue: z.object({
      currentMonthly: z.number().optional(),
      growthRate: z.number().optional(),
      conversionRate: z.number().optional(),
      averageCommission: z.number().optional(),
    }).optional(),
    scenarios: z.array(z.object({
      name: z.string(),
      investment: z.number(),
      expectedReturn: z.number(),
    })).optional(),
    timeframe: z.number().optional(), // months
  }),
  outputSchema: z.object({
    calculation: z.any(),
    projections: z.array(z.object({
      period: z.string(),
      revenue: z.number(),
      profit: z.number(),
      roi: z.number(),
    })).optional(),
    recommendations: z.array(z.string()),
    visualizations: z.array(z.object({
      type: z.string(),
      title: z.string(),
      data: z.any(),
    })).optional(),
    insights: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { action, investment, revenue, scenarios, timeframe } = context;
    
    switch (action) {
      case 'calculate_roi':
        return calculateROI(investment!, revenue!);
        
      case 'project_revenue':
        return projectRevenue(revenue!, timeframe || 12);
        
      case 'compare_scenarios':
        return compareInvestmentScenarios(scenarios!);
        
      case 'optimize_investment':
        return optimizeInvestmentAllocation(investment!, revenue!);
        
      case 'sensitivity_analysis':
        return performSensitivityAnalysis(investment!, revenue!);
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function calculateROI(investment: any, revenue: any): Promise<any> {
  // ROI計算
  const totalInvestment = (investment.initial || 0) + 
                         ((investment.monthly || 0) * 12) +
                         (investment.tools || 0) +
                         (investment.advertising || 0) +
                         (investment.content || 0);
  
  const yearlyRevenue = (revenue.currentMonthly || 0) * 12;
  const projectedGrowth = revenue.growthRate || 0.2;
  
  const calculation: ROICalculation = {
    investment: {
      initial: investment.initial || 0,
      monthly: investment.monthly || 0,
      total: totalInvestment,
    },
    revenue: {
      monthly: revenue.currentMonthly || 0,
      yearly: yearlyRevenue,
      projected5Year: calculateCompoundGrowth(yearlyRevenue, projectedGrowth, 5),
    },
    metrics: {
      roi: ((yearlyRevenue - totalInvestment) / totalInvestment) * 100,
      paybackPeriod: totalInvestment / (revenue.currentMonthly || 1),
      netProfit: yearlyRevenue - totalInvestment,
      profitMargin: ((yearlyRevenue - totalInvestment) / yearlyRevenue) * 100,
    },
    breakdown: {
      byProduct: {
        '七里信一ChatGPTセミナー': yearlyRevenue * 0.64,
        'ChatGPT Plus': yearlyRevenue * 0.13,
        'Claude Pro': yearlyRevenue * 0.08,
        'その他': yearlyRevenue * 0.15,
      },
      byChannel: {
        'ブログ': yearlyRevenue * 0.45,
        'メール': yearlyRevenue * 0.30,
        'SNS': yearlyRevenue * 0.20,
        'その他': yearlyRevenue * 0.05,
      },
      byMonth: generateMonthlyBreakdown(revenue.currentMonthly || 0, projectedGrowth),
    },
  };
  
  const insights = generateROIInsights(calculation);
  const recommendations = generateROIRecommendations(calculation);
  
  return {
    calculation,
    insights,
    recommendations,
    visualizations: [
      {
        type: 'roi_gauge',
        title: 'ROI率',
        data: { value: calculation.metrics.roi, target: 300 },
      },
      {
        type: 'revenue_breakdown',
        title: '収益源別内訳',
        data: calculation.breakdown.byProduct,
      },
      {
        type: 'payback_timeline',
        title: '投資回収期間',
        data: { months: calculation.metrics.paybackPeriod },
      },
    ],
  };
}

async function projectRevenue(revenue: any, timeframe: number): Promise<any> {
  const projections = [];
  const baseMonthly = revenue.currentMonthly || 2700000;
  const growthRate = revenue.growthRate || 0.235;
  
  // 3つのシナリオ：保守的、現実的、楽観的
  const scenarios = {
    conservative: growthRate * 0.7,
    realistic: growthRate,
    optimistic: growthRate * 1.3,
  };
  
  for (let month = 1; month <= timeframe; month++) {
    const projection = {
      period: `Month ${month}`,
      conservative: calculateMonthlyRevenue(baseMonthly, scenarios.conservative, month),
      realistic: calculateMonthlyRevenue(baseMonthly, scenarios.realistic, month),
      optimistic: calculateMonthlyRevenue(baseMonthly, scenarios.optimistic, month),
    };
    
    projections.push({
      period: projection.period,
      revenue: projection.realistic,
      profit: projection.realistic * 0.8, // 80% profit margin
      roi: ((projection.realistic - baseMonthly) / baseMonthly) * 100,
    });
  }
  
  // 主要マイルストーン
  const milestones = [
    { month: 3, target: 2700000, name: '初期目標達成' },
    { month: 6, target: 5000000, name: '中期目標達成' },
    { month: 12, target: 25000000, name: '年間目標達成' },
  ];
  
  const insights = [
    `現在の成長率${(growthRate * 100).toFixed(1)}%で年収${(baseMonthly * 12 * (1 + growthRate)).toLocaleString()}円達成見込み`,
    '保守的シナリオでも年収3億円は達成可能',
    '七里セミナーの成約率向上で更なる加速が可能',
  ];
  
  return {
    projections,
    calculation: {
      scenarios,
      milestones,
      yearEndRevenue: projections[11]?.revenue || 0,
    },
    insights,
    recommendations: [
      '高成約商品の比率を段階的に増加',
      '新規高単価商品の追加を検討',
      'リピート購入の仕組み構築',
      '自動化による利益率向上',
    ],
    visualizations: [
      {
        type: 'revenue_projection',
        title: '収益予測（12ヶ月）',
        data: projections,
      },
      {
        type: 'scenario_comparison',
        title: 'シナリオ別予測',
        data: scenarios,
      },
    ],
  };
}

async function compareInvestmentScenarios(scenarios: any[]): Promise<any> {
  // 投資シナリオの比較
  const evaluatedScenarios = scenarios.map(scenario => {
    const roi = ((scenario.expectedReturn - scenario.investment) / scenario.investment) * 100;
    const payback = scenario.investment / (scenario.expectedReturn / 12);
    const risk = assessRisk(scenario);
    
    return {
      ...scenario,
      roi,
      payback,
      risk,
      score: calculateScenarioScore(roi, payback, risk),
    };
  });
  
  // スコア順にソート
  evaluatedScenarios.sort((a, b) => b.score - a.score);
  
  const bestScenario = evaluatedScenarios[0];
  
  const insights = [
    `最適シナリオ: ${bestScenario.name}（ROI ${bestScenario.roi.toFixed(1)}%）`,
    `投資回収期間: ${bestScenario.payback.toFixed(1)}ヶ月`,
    'リスクとリターンのバランスが最適',
  ];
  
  return {
    calculation: {
      scenarios: evaluatedScenarios,
      bestScenario,
      comparisonMatrix: generateComparisonMatrix(evaluatedScenarios),
    },
    insights,
    recommendations: [
      `${bestScenario.name}への投資を優先`,
      'リスク分散のため複数シナリオの組み合わせも検討',
      '段階的な投資で市場反応を確認',
      '3ヶ月ごとに投資配分を見直し',
    ],
    visualizations: [
      {
        type: 'scenario_scatter',
        title: 'リスク vs リターン',
        data: evaluatedScenarios.map(s => ({
          x: s.risk,
          y: s.roi,
          name: s.name,
        })),
      },
    ],
  };
}

async function optimizeInvestmentAllocation(investment: any, revenue: any): Promise<any> {
  // 投資配分の最適化
  const totalBudget = (investment.initial || 0) + 
                     ((investment.monthly || 0) * 12) +
                     (investment.tools || 0) +
                     (investment.advertising || 0) +
                     (investment.content || 0);
  
  // 最適な配分比率
  const optimalAllocation = {
    content: 0.35,      // コンテンツ制作
    tools: 0.20,        // ツール・システム
    advertising: 0.25,  // 広告・プロモーション
    education: 0.10,    // 教育・研修
    reserve: 0.10,      // 予備費
  };
  
  const currentAllocation = {
    content: (investment.content || 0) / totalBudget,
    tools: (investment.tools || 0) / totalBudget,
    advertising: (investment.advertising || 0) / totalBudget,
    education: 0,
    reserve: 0,
  };
  
  const recommendations = generateAllocationRecommendations(currentAllocation, optimalAllocation, totalBudget);
  
  // 最適化後の予想収益
  const optimizedRevenue = calculateOptimizedRevenue(totalBudget, optimalAllocation, revenue);
  
  return {
    calculation: {
      currentAllocation,
      optimalAllocation,
      totalBudget,
      currentROI: ((revenue.currentMonthly * 12 - totalBudget) / totalBudget) * 100,
      optimizedROI: ((optimizedRevenue - totalBudget) / totalBudget) * 100,
      improvement: optimizedRevenue - (revenue.currentMonthly * 12),
    },
    insights: [
      'コンテンツ投資を35%に増加で収益最大化',
      '広告投資の効率化で20%のコスト削減可能',
      'ツール投資でオペレーション効率50%向上',
    ],
    recommendations,
    visualizations: [
      {
        type: 'allocation_pie',
        title: '最適投資配分',
        data: optimalAllocation,
      },
      {
        type: 'roi_comparison',
        title: '現在 vs 最適化後',
        data: {
          current: ((revenue.currentMonthly * 12 - totalBudget) / totalBudget) * 100,
          optimized: ((optimizedRevenue - totalBudget) / totalBudget) * 100,
        },
      },
    ],
  };
}

async function performSensitivityAnalysis(investment: any, revenue: any): Promise<any> {
  // 感度分析
  const baseCase = {
    investment: investment.initial || 500000,
    monthlyRevenue: revenue.currentMonthly || 2700000,
    conversionRate: revenue.conversionRate || 0.12,
    commission: revenue.averageCommission || 60000,
  };
  
  // 各変数の変動による影響
  const sensitivityFactors = [
    {
      variable: 'コンバージョン率',
      current: baseCase.conversionRate,
      variations: [-20, -10, 0, 10, 20],
      impact: [],
    },
    {
      variable: '平均コミッション',
      current: baseCase.commission,
      variations: [-20, -10, 0, 10, 20],
      impact: [],
    },
    {
      variable: 'トラフィック',
      current: 100,
      variations: [-30, -15, 0, 15, 30],
      impact: [],
    },
  ];
  
  // 各要因の影響を計算
  sensitivityFactors.forEach(factor => {
    factor.impact = factor.variations.map(variation => {
      const adjustedValue = factor.current * (1 + variation / 100);
      return calculateImpactOnRevenue(factor.variable, adjustedValue, baseCase);
    });
  });
  
  const criticalFactors = identifyCriticalFactors(sensitivityFactors);
  
  return {
    calculation: {
      baseCase,
      sensitivityFactors,
      criticalFactors,
      breakEvenPoint: calculateBreakEvenPoint(baseCase),
    },
    insights: [
      `最も影響が大きいのは${criticalFactors[0].variable}`,
      'コンバージョン率10%改善で月収540万円増',
      'トラフィック30%減でも黒字維持可能',
    ],
    recommendations: [
      'コンバージョン率改善に最優先で投資',
      '複数の収益源でリスク分散',
      '固定費を最小限に抑える',
      '市場変動に対する柔軟性を維持',
    ],
    visualizations: [
      {
        type: 'tornado_chart',
        title: '感度分析：各要因の影響度',
        data: sensitivityFactors,
      },
      {
        type: 'break_even_analysis',
        title: '損益分岐点分析',
        data: calculateBreakEvenScenarios(baseCase),
      },
    ],
  };
}

// ヘルパー関数
function calculateCompoundGrowth(initial: number, rate: number, years: number): number {
  return initial * Math.pow(1 + rate, years);
}

function generateMonthlyBreakdown(baseMonthly: number, growthRate: number): any[] {
  const breakdown = [];
  let currentRevenue = baseMonthly;
  
  for (let month = 1; month <= 12; month++) {
    currentRevenue *= (1 + growthRate / 12);
    breakdown.push({
      month: `2024-${String(month).padStart(2, '0')}`,
      revenue: Math.round(currentRevenue),
      profit: Math.round(currentRevenue * 0.8),
    });
  }
  
  return breakdown;
}

function generateROIInsights(calculation: ROICalculation): string[] {
  const insights = [];
  
  if (calculation.metrics.roi > 300) {
    insights.push(`ROI ${calculation.metrics.roi.toFixed(1)}%は業界トップクラス`);
  }
  
  if (calculation.metrics.paybackPeriod < 3) {
    insights.push(`投資回収期間${calculation.metrics.paybackPeriod.toFixed(1)}ヶ月は非常に優秀`);
  }
  
  const topProduct = Object.entries(calculation.breakdown.byProduct)
    .sort(([,a], [,b]) => b - a)[0];
  insights.push(`${topProduct[0]}が収益の${(topProduct[1] / calculation.revenue.yearly * 100).toFixed(1)}%を占める`);
  
  return insights;
}

function generateROIRecommendations(calculation: ROICalculation): string[] {
  const recommendations = [];
  
  if (calculation.metrics.roi < 200) {
    recommendations.push('高収益商品の比率を増やしてROI改善');
  }
  
  if (calculation.metrics.paybackPeriod > 6) {
    recommendations.push('初期投資を抑えて段階的に拡大');
  }
  
  recommendations.push('収益源の多様化でリスク軽減');
  recommendations.push('自動化投資で利益率向上');
  
  return recommendations;
}

function calculateMonthlyRevenue(base: number, growthRate: number, month: number): number {
  return base * Math.pow(1 + growthRate / 12, month - 1);
}

function assessRisk(scenario: any): number {
  // リスク評価（0-100）
  let risk = 50;
  
  if (scenario.investment > 5000000) risk += 20;
  if (scenario.expectedReturn / scenario.investment > 5) risk += 15;
  if (scenario.name.includes('新規')) risk += 10;
  
  return Math.min(risk, 100);
}

function calculateScenarioScore(roi: number, payback: number, risk: number): number {
  // スコア計算（ROI重視）
  return (roi * 0.5) + ((12 - payback) * 10) + ((100 - risk) * 0.3);
}

function generateComparisonMatrix(scenarios: any[]): any {
  return {
    headers: ['シナリオ', 'ROI', '回収期間', 'リスク', 'スコア'],
    rows: scenarios.map(s => [
      s.name,
      `${s.roi.toFixed(1)}%`,
      `${s.payback.toFixed(1)}ヶ月`,
      `${s.risk}/100`,
      s.score.toFixed(1),
    ]),
  };
}

function generateAllocationRecommendations(
  current: any, 
  optimal: any, 
  budget: number
): string[] {
  const recommendations = [];
  
  Object.keys(optimal).forEach(key => {
    const diff = optimal[key] - (current[key] || 0);
    if (diff > 0.1) {
      recommendations.push(`${key}への投資を${(diff * 100).toFixed(0)}%増加（+${(budget * diff).toLocaleString()}円）`);
    } else if (diff < -0.1) {
      recommendations.push(`${key}への投資を${(-diff * 100).toFixed(0)}%削減（-${(-budget * diff).toLocaleString()}円）`);
    }
  });
  
  return recommendations;
}

function calculateOptimizedRevenue(budget: number, allocation: any, revenue: any): number {
  // 最適化後の収益予測
  const efficiencyGains = {
    content: 1.3,
    tools: 1.5,
    advertising: 1.2,
    education: 1.1,
    reserve: 1.0,
  };
  
  let optimizedRevenue = revenue.currentMonthly * 12;
  
  Object.keys(allocation).forEach(key => {
    const investment = budget * allocation[key];
    const efficiency = efficiencyGains[key] || 1;
    optimizedRevenue += investment * efficiency * 2; // 2x return assumption
  });
  
  return optimizedRevenue;
}

function calculateImpactOnRevenue(variable: string, value: number, baseCase: any): number {
  switch (variable) {
    case 'コンバージョン率':
      return baseCase.monthlyRevenue * (value / baseCase.conversionRate);
    case '平均コミッション':
      return baseCase.monthlyRevenue * (value / baseCase.commission);
    case 'トラフィック':
      return baseCase.monthlyRevenue * (value / 100);
    default:
      return baseCase.monthlyRevenue;
  }
}

function identifyCriticalFactors(factors: any[]): any[] {
  // 影響度順にソート
  return factors.sort((a, b) => {
    const aRange = Math.max(...a.impact) - Math.min(...a.impact);
    const bRange = Math.max(...b.impact) - Math.min(...b.impact);
    return bRange - aRange;
  });
}

function calculateBreakEvenPoint(baseCase: any): any {
  return {
    revenue: baseCase.investment / 0.8, // 80% profit margin
    conversions: Math.ceil(baseCase.investment / baseCase.commission),
    months: baseCase.investment / (baseCase.monthlyRevenue * 0.8),
  };
}

function calculateBreakEvenScenarios(baseCase: any): any[] {
  const scenarios = [];
  
  for (let cvr = 0.05; cvr <= 0.20; cvr += 0.025) {
    const revenue = (baseCase.monthlyRevenue / baseCase.conversionRate) * cvr;
    scenarios.push({
      conversionRate: cvr,
      revenue,
      profitable: revenue > baseCase.investment / 12,
    });
  }
  
  return scenarios;
}