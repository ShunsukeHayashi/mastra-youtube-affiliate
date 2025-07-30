import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface Partner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: 'prospect' | 'contacted' | 'negotiating' | 'active' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  lastContact?: Date;
  nextAction?: string;
  notes: string[];
  dealValue?: number;
  commissionRate?: number;
  tags: string[];
}

interface Communication {
  id: string;
  partnerId: string;
  type: 'email' | 'call' | 'meeting' | 'social';
  date: Date;
  summary: string;
  outcome?: string;
  nextSteps?: string;
}

interface RelationshipStrategy {
  partnerId: string;
  approach: string;
  touchpoints: Array<{
    timing: string;
    action: string;
    message: string;
  }>;
  valueProposition: string;
  expectedOutcome: string;
}

// パートナーデータベース（実際の実装では永続化）
const partnersDB = new Map<string, Partner>();

// 初期データ
partnersDB.set('shichiri', {
  id: 'shichiri',
  name: '七里信一',
  company: '七里式ChatGPTセミナー',
  email: 'shichiri@example.com',
  status: 'prospect',
  priority: 'high',
  notes: ['ChatGPTセミナー主催者', '高額報酬プログラム'],
  dealValue: 80000,
  commissionRate: 26.8,
  tags: ['重要パートナー', 'AI教育', '高単価'],
});

export const relationshipManagementTool = createTool({
  id: 'relationship-management',
  description: 'パートナー関係構築と管理のための戦略的ツール',
  inputSchema: z.object({
    action: z.enum(['add_partner', 'update_status', 'log_communication', 'get_strategy', 'schedule_followup', 'analyze_relationships']),
    partner: z.object({
      name: z.string(),
      company: z.string(),
      email: z.string().email(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      notes: z.array(z.string()).optional(),
    }).optional(),
    partnerId: z.string().optional(),
    communication: z.object({
      type: z.enum(['email', 'call', 'meeting', 'social']),
      summary: z.string(),
      outcome: z.string().optional(),
      nextSteps: z.string().optional(),
    }).optional(),
    statusUpdate: z.object({
      newStatus: z.enum(['prospect', 'contacted', 'negotiating', 'active', 'inactive']),
      reason: z.string().optional(),
    }).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    strategy: z.any().optional(),
    recommendations: z.array(z.string()),
    timeline: z.array(z.object({
      date: z.string(),
      action: z.string(),
    })).optional(),
  }),
  execute: async ({ context }) => {
    const { action, partner, partnerId, communication, statusUpdate } = context;
    
    switch (action) {
      case 'add_partner':
        return addPartner(partner!);
        
      case 'update_status':
        return updatePartnerStatus(partnerId!, statusUpdate!);
        
      case 'log_communication':
        return logCommunication(partnerId!, communication!);
        
      case 'get_strategy':
        return getRelationshipStrategy(partnerId!);
        
      case 'schedule_followup':
        return scheduleFollowup(partnerId!);
        
      case 'analyze_relationships':
        return analyzeRelationships();
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function addPartner(partnerData: any): Promise<any> {
  const partner: Partner = {
    id: `partner_${Date.now()}`,
    name: partnerData.name,
    company: partnerData.company,
    email: partnerData.email,
    status: 'prospect',
    priority: partnerData.priority || 'medium',
    notes: partnerData.notes || [],
    tags: determinePartnerTags(partnerData),
  };
  
  partnersDB.set(partner.id, partner);
  
  // 関係構築戦略の生成
  const strategy = generateInitialStrategy(partner);
  
  return {
    success: true,
    data: partner,
    strategy,
    recommendations: [
      '48時間以内に初回コンタクトを推奨',
      '価値提供を先行させるアプローチ',
      'LinkedInでの事前リサーチを実施',
    ],
    timeline: [
      { date: '今日', action: 'LinkedInプロフィール確認' },
      { date: '明日', action: '初回メール送信' },
      { date: '3日後', action: 'フォローアップ' },
      { date: '1週間後', action: '価値提供コンテンツ送付' },
    ],
  };
}

async function updatePartnerStatus(partnerId: string, statusUpdate: any): Promise<any> {
  const partner = partnersDB.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  const previousStatus = partner.status;
  partner.status = statusUpdate.newStatus;
  partner.lastContact = new Date();
  
  // ステータス変更に応じた次のアクション
  const nextActions = getNextActionsForStatus(statusUpdate.newStatus);
  
  return {
    success: true,
    data: {
      partnerId,
      previousStatus,
      newStatus: statusUpdate.newStatus,
      reason: statusUpdate.reason,
    },
    recommendations: nextActions,
    timeline: generateActionTimeline(partner, statusUpdate.newStatus),
  };
}

async function logCommunication(partnerId: string, communicationData: any): Promise<any> {
  const partner = partnersDB.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  const communication: Communication = {
    id: `comm_${Date.now()}`,
    partnerId,
    type: communicationData.type,
    date: new Date(),
    summary: communicationData.summary,
    outcome: communicationData.outcome,
    nextSteps: communicationData.nextSteps,
  };
  
  // パートナー情報の更新
  partner.lastContact = new Date();
  partner.nextAction = communicationData.nextSteps;
  
  // 関係性の分析
  const relationshipHealth = analyzeRelationshipHealth(partner, communication);
  
  return {
    success: true,
    data: {
      communication,
      relationshipHealth,
    },
    recommendations: generateFollowupRecommendations(partner, communication),
  };
}

async function getRelationshipStrategy(partnerId: string): Promise<any> {
  const partner = partnersDB.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  // 七里氏への特別戦略
  if (partnerId === 'shichiri') {
    return {
      success: true,
      data: partner,
      strategy: {
        approach: 'お友達戦略 - 価値提供先行型アプローチ',
        phases: [
          {
            phase: 1,
            name: '認知獲得',
            duration: '1週間',
            actions: [
              'SNSでの自然な言及・技術的コメント',
              'セミナー内容の建設的な分析記事公開',
              '共通の知人を通じた紹介の模索',
            ],
          },
          {
            phase: 2,
            name: '価値提供',
            duration: '2週間',
            actions: [
              '技術分析レポートの無償提供',
              'セミナー改善提案の共有',
              '受講者向け補助教材の作成・提供',
            ],
          },
          {
            phase: 3,
            name: '関係深化',
            duration: '2週間',
            actions: [
              '直接面談の申し出',
              '相互利益の提案準備',
              '長期パートナーシップビジョンの共有',
            ],
          },
        ],
        valueProposition: `
          1. プロンプト専門家の権威性による信頼性向上
          2. 技術的な深掘りコンテンツでの差別化
          3. 受講者満足度向上のためのサポート
          4. 長期的なWin-Winパートナーシップ
        `,
        negotiationPoints: [
          '標準報酬の1.5倍（12万円）での特別契約',
          '受講者向け特別サポートの提供権',
          '共同マーケティングの実施',
          '独占的推薦権の獲得',
        ],
      },
      recommendations: [
        '段階的なアプローチで信頼構築を優先',
        '即座の契約要求は避ける',
        '価値提供を通じた実績作り',
        '共通の価値観・ビジョンの強調',
      ],
    };
  }
  
  // 一般的な戦略
  const strategy = generatePartnerStrategy(partner);
  
  return {
    success: true,
    data: partner,
    strategy,
    recommendations: generateStrategyRecommendations(partner),
  };
}

async function scheduleFollowup(partnerId: string): Promise<any> {
  const partner = partnersDB.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  // フォローアップスケジュールの生成
  const followupSchedule = generateFollowupSchedule(partner);
  
  return {
    success: true,
    data: {
      partner,
      followupSchedule,
    },
    recommendations: [
      'カレンダーへの自動登録を推奨',
      'リマインダーの設定',
      'フォローアップテンプレートの準備',
    ],
    timeline: followupSchedule.map(f => ({
      date: f.date,
      action: f.action,
    })),
  };
}

async function analyzeRelationships(): Promise<any> {
  const partners = Array.from(partnersDB.values());
  
  const analysis = {
    totalPartners: partners.length,
    byStatus: {
      prospect: partners.filter(p => p.status === 'prospect').length,
      contacted: partners.filter(p => p.status === 'contacted').length,
      negotiating: partners.filter(p => p.status === 'negotiating').length,
      active: partners.filter(p => p.status === 'active').length,
      inactive: partners.filter(p => p.status === 'inactive').length,
    },
    byPriority: {
      high: partners.filter(p => p.priority === 'high').length,
      medium: partners.filter(p => p.priority === 'medium').length,
      low: partners.filter(p => p.priority === 'low').length,
    },
    needsAttention: partners.filter(p => 
      !p.lastContact || 
      (new Date().getTime() - new Date(p.lastContact).getTime()) > 7 * 24 * 60 * 60 * 1000
    ),
    potentialRevenue: partners.reduce((sum, p) => sum + (p.dealValue || 0), 0),
  };
  
  const insights = [
    `${analysis.needsAttention.length}件のパートナーがフォローアップ必要`,
    `潜在収益: ${analysis.potentialRevenue.toLocaleString()}円/件`,
    `高優先度パートナー${analysis.byPriority.high}件に集中すべき`,
  ];
  
  return {
    success: true,
    data: analysis,
    recommendations: [
      '週次のパートナーレビュー実施',
      '高優先度パートナーへの集中的アプローチ',
      '非アクティブパートナーの再活性化',
      'CRMツールとの連携強化',
    ],
  };
}

// ヘルパー関数
function determinePartnerTags(partner: any): string[] {
  const tags = [];
  
  if (partner.company.includes('AI') || partner.company.includes('ChatGPT')) {
    tags.push('AI教育');
  }
  
  if (partner.priority === 'high') {
    tags.push('重要パートナー');
  }
  
  return tags;
}

function generateInitialStrategy(partner: Partner): any {
  return {
    approach: partner.priority === 'high' ? 'パーソナライズド' : 'スタンダード',
    touchpoints: [
      { timing: '即日', action: 'リサーチ', message: 'SNS・Web情報収集' },
      { timing: '2日以内', action: '初回コンタクト', message: '価値提供型メール' },
      { timing: '1週間後', action: 'フォローアップ', message: '追加情報提供' },
    ],
    valueProposition: '専門家による信頼性の高い推薦',
    expectedOutcome: '30日以内の契約締結',
  };
}

function getNextActionsForStatus(status: string): string[] {
  const actions = {
    contacted: [
      'フォローアップメールの送信',
      '価値提供コンテンツの準備',
      '次回ミーティングの提案',
    ],
    negotiating: [
      '条件詳細の確認',
      '契約書ドラフトの準備',
      'Win-Win提案の最終調整',
    ],
    active: [
      '定期レポートの送付',
      '成果の可視化',
      '追加提案の検討',
    ],
  };
  
  return actions[status] || ['次のアクションを計画'];
}

function generateActionTimeline(partner: Partner, status: string): any[] {
  const baseTimeline = [
    { date: '今日', action: 'ステータス更新の記録' },
    { date: '明日', action: '社内チームへの共有' },
  ];
  
  if (status === 'negotiating') {
    baseTimeline.push(
      { date: '3日後', action: '条件詳細の確認' },
      { date: '1週間後', action: '契約締結目標' }
    );
  }
  
  return baseTimeline;
}

function analyzeRelationshipHealth(partner: Partner, communication: Communication): string {
  const daysSinceLastContact = partner.lastContact 
    ? (new Date().getTime() - new Date(partner.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
    
  if (daysSinceLastContact < 7 && communication.outcome) {
    return 'excellent';
  } else if (daysSinceLastContact < 14) {
    return 'good';
  } else if (daysSinceLastContact < 30) {
    return 'fair';
  } else {
    return 'needs attention';
  }
}

function generateFollowupRecommendations(partner: Partner, communication: Communication): string[] {
  const recommendations = [];
  
  if (communication.type === 'email' && !communication.outcome) {
    recommendations.push('48時間以内のフォローアップ電話');
  }
  
  if (communication.type === 'meeting' && communication.outcome) {
    recommendations.push('ミーティングサマリーの送付');
    recommendations.push('次のステップの明確化');
  }
  
  if (partner.priority === 'high') {
    recommendations.push('エグゼクティブレベルでの関与検討');
  }
  
  return recommendations;
}

function generatePartnerStrategy(partner: Partner): any {
  return {
    currentStatus: partner.status,
    recommendedApproach: partner.priority === 'high' ? 'Strategic Partnership' : 'Standard Affiliate',
    keyMessages: [
      '相互利益の強調',
      '実績データの共有',
      '長期的ビジョンの提示',
    ],
    riskMitigation: [
      '複数の連絡チャネル確保',
      '代替パートナーの検討',
      '契約条件の柔軟性',
    ],
  };
}

function generateStrategyRecommendations(partner: Partner): string[] {
  return [
    `${partner.priority}優先度に応じたリソース配分`,
    '定期的なタッチポイントの設定',
    '成功指標の明確化',
    'エスカレーションパスの確立',
  ];
}

function generateFollowupSchedule(partner: Partner): any[] {
  const schedule = [];
  const baseDate = new Date();
  
  // 優先度に応じたフォローアップ頻度
  const intervals = {
    high: [2, 7, 14, 30],
    medium: [7, 14, 30, 60],
    low: [14, 30, 60, 90],
  };
  
  const days = intervals[partner.priority];
  
  days.forEach((day, index) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + day);
    
    schedule.push({
      date: date.toISOString().split('T')[0],
      action: getFollowupAction(index, partner),
    });
  });
  
  return schedule;
}

function getFollowupAction(index: number, partner: Partner): string {
  const actions = [
    '進捗確認メール',
    '価値提供コンテンツ送付',
    '次回ミーティング提案',
    '四半期レビュー実施',
  ];
  
  return actions[index] || 'フォローアップ';
}