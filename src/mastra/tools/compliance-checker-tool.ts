import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  issue: string;
  recommendation: string;
  legalReference?: string;
}

interface ComplianceReport {
  score: number;
  status: 'compliant' | 'needs_attention' | 'non_compliant';
  issues: ComplianceIssue[];
  recommendations: string[];
  requiredActions: string[];
}

export const complianceCheckerTool = createTool({
  id: 'compliance-checker',
  description: 'アフィリエイトマーケティングの法的コンプライアンスチェック',
  inputSchema: z.object({
    action: z.enum(['check_content', 'check_disclosure', 'check_claims', 'generate_disclaimer', 'audit_campaign']),
    content: z.string().optional(),
    contentType: z.enum(['blog', 'email', 'social', 'landing_page', 'video']).optional(),
    productClaims: z.array(z.string()).optional(),
    targetMarket: z.enum(['jp', 'us', 'global']).optional(),
  }),
  outputSchema: z.object({
    report: z.any(),
    issues: z.array(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      category: z.string(),
      issue: z.string(),
      recommendation: z.string(),
    })),
    recommendations: z.array(z.string()),
    disclaimer: z.string().optional(),
    templates: z.any().optional(),
  }),
  execute: async ({ context }) => {
    const { action, content, contentType, productClaims, targetMarket } = context;
    
    switch (action) {
      case 'check_content':
        return checkContentCompliance(content!, contentType!, targetMarket || 'jp');
        
      case 'check_disclosure':
        return checkAffiliateDisclosure(content!, contentType!);
        
      case 'check_claims':
        return checkProductClaims(productClaims!, targetMarket || 'jp');
        
      case 'generate_disclaimer':
        return generateDisclaimer(contentType!, targetMarket || 'jp');
        
      case 'audit_campaign':
        return auditMarketingCampaign(content!);
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function checkContentCompliance(
  content: string, 
  contentType: string, 
  market: string
): Promise<any> {
  const issues: ComplianceIssue[] = [];
  
  // 景品表示法チェック（日本）
  if (market === 'jp') {
    // 誇大広告のチェック
    const exaggeratedTerms = ['必ず', '絶対', '確実に', '保証', '最高', '日本一', 'No.1'];
    exaggeratedTerms.forEach(term => {
      if (content.includes(term)) {
        issues.push({
          severity: 'high',
          category: '景品表示法',
          issue: `誇大表現「${term}」が含まれています`,
          recommendation: `「${term}」を削除するか、客観的根拠を明示してください`,
          legalReference: '景品表示法第5条（不当表示の禁止）',
        });
      }
    });
    
    // 二重価格表示のチェック
    if (content.includes('通常価格') && content.includes('特別価格')) {
      issues.push({
        severity: 'medium',
        category: '景品表示法',
        issue: '二重価格表示が検出されました',
        recommendation: '比較対照価格の根拠を明確に示してください',
        legalReference: '不当な価格表示についての景品表示法上の考え方',
      });
    }
  }
  
  // アフィリエイト表示義務
  const hasAffiliateDisclosure = checkForAffiliateDisclosure(content);
  if (!hasAffiliateDisclosure) {
    issues.push({
      severity: 'critical',
      category: 'アフィリエイト表示',
      issue: 'アフィリエイトリンクの明示がありません',
      recommendation: '記事冒頭に「広告」「PR」表記を追加してください',
      legalReference: '消費者庁「インターネット消費者取引に係る広告表示に関する景品表示法上の問題点及び留意事項」',
    });
  }
  
  // 薬機法関連（健康・美容商品の場合）
  const medicalTerms = ['治る', '効果', '改善', '予防', '診断'];
  medicalTerms.forEach(term => {
    if (content.includes(term)) {
      issues.push({
        severity: 'high',
        category: '薬機法',
        issue: `医療関連表現「${term}」が含まれています`,
        recommendation: '医療効果を暗示する表現は避けてください',
        legalReference: '医薬品医療機器等法第66条（誇大広告等の禁止）',
      });
    }
  });
  
  // 個人情報保護
  if (content.includes('個人情報') || content.includes('メールアドレス')) {
    const hasPrivacyPolicy = content.includes('プライバシーポリシー');
    if (!hasPrivacyPolicy) {
      issues.push({
        severity: 'medium',
        category: '個人情報保護法',
        issue: '個人情報取得時のプライバシーポリシーへのリンクがありません',
        recommendation: 'プライバシーポリシーへのリンクを追加してください',
        legalReference: '個人情報保護法第18条（取得に際しての利用目的の通知等）',
      });
    }
  }
  
  const score = calculateComplianceScore(issues);
  const status = getComplianceStatus(score);
  
  return {
    report: {
      score,
      status,
      checkedAreas: ['景品表示法', 'アフィリエイト表示', '薬機法', '個人情報保護法'],
      market,
    },
    issues,
    recommendations: generateComplianceRecommendations(issues, contentType),
  };
}

async function checkAffiliateDisclosure(content: string, contentType: string): Promise<any> {
  const issues: ComplianceIssue[] = [];
  
  const disclosurePatterns = [
    'アフィリエイト',
    '広告',
    'PR',
    'プロモーション',
    'AD',
    '提供',
    'sponsored',
    'パートナーシップ',
  ];
  
  const hasDisclosure = disclosurePatterns.some(pattern => 
    content.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (!hasDisclosure) {
    issues.push({
      severity: 'critical',
      category: 'FTC/消費者庁ガイドライン',
      issue: 'アフィリエイト関係の開示が不十分です',
      recommendation: '明確なアフィリエイト表示を追加してください',
    });
  }
  
  // 表示位置のチェック
  const disclosurePosition = getDisclosurePosition(content, disclosurePatterns);
  if (disclosurePosition > 200) {
    issues.push({
      severity: 'medium',
      category: '表示位置',
      issue: 'アフィリエイト表示が記事の後方にあります',
      recommendation: '冒頭部分（最初の200文字以内）に移動してください',
    });
  }
  
  // プラットフォーム別の要件
  const platformRequirements = {
    blog: '記事冒頭と各アフィリエイトリンクの近くに表示',
    email: '件名または本文冒頭に「広告」表記',
    social: 'ハッシュタグ #PR または #広告 を使用',
    landing_page: 'ファーストビューに明確な表示',
    video: '動画開始時と説明欄に表示',
  };
  
  const requirement = platformRequirements[contentType];
  
  return {
    report: {
      hasDisclosure,
      disclosurePosition,
      platformRequirement: requirement,
    },
    issues,
    recommendations: [
      `${contentType}では${requirement}が必要です`,
      '「広告」「PR」などの明確な表記を使用',
      '読者が見逃さない位置に配置',
      '文字サイズと色で視認性を確保',
    ],
    templates: getDisclosureTemplates(contentType),
  };
}

async function checkProductClaims(claims: string[], market: string): Promise<any> {
  const issues: ComplianceIssue[] = [];
  
  claims.forEach(claim => {
    // 数値・統計の根拠チェック
    const hasNumbers = /\d+[%％]|\d+倍|\d+人/.test(claim);
    if (hasNumbers && !claim.includes('※') && !claim.includes('出典')) {
      issues.push({
        severity: 'medium',
        category: '根拠表示',
        issue: `「${claim}」の数値に根拠表示がありません`,
        recommendation: '調査元・期間・対象を明記してください',
      });
    }
    
    // 比較広告のチェック
    if (claim.includes('より') || claim.includes('最も') || claim.includes('No.1')) {
      issues.push({
        severity: 'high',
        category: '比較広告',
        issue: `比較表現「${claim}」の妥当性確認が必要`,
        recommendation: '比較対象と条件を明確にしてください',
      });
    }
    
    // 効果・効能の断定的表現
    const definitiveTerms = ['必ず', '確実', '絶対', '全員', '誰でも'];
    definitiveTerms.forEach(term => {
      if (claim.includes(term)) {
        issues.push({
          severity: 'high',
          category: '断定的表現',
          issue: `断定的表現「${term}」は避けるべきです`,
          recommendation: '「多くの場合」「傾向がある」などに変更',
        });
      }
    });
  });
  
  return {
    report: {
      totalClaims: claims.length,
      problematicClaims: issues.length,
      complianceRate: ((claims.length - issues.length) / claims.length) * 100,
    },
    issues,
    recommendations: [
      '客観的データに基づく表現を心がける',
      '個人の感想は明確に区別する',
      '誤解を招く表現を避ける',
      '定期的な表現の見直しを実施',
    ],
  };
}

async function generateDisclaimer(contentType: string, market: string): Promise<any> {
  const disclaimers = {
    jp: {
      blog: `【広告】この記事にはアフィリエイトリンクが含まれています。
商品の購入や登録により、売上の一部が当サイトに還元されることがあります。
読者様の判断でご利用ください。商品の詳細は販売元でご確認ください。`,
      
      email: `※このメールには広告が含まれています。
記載の情報は配信時点のものです。価格・内容は変更される場合があります。`,
      
      social: `#PR #アフィリエイト
※リンクから購入すると収益が発生する場合があります`,
      
      landing_page: `【広告表示】
当ページはアフィリエイトプログラムによる収益を得ています。
掲載情報には細心の注意を払っていますが、内容を保証するものではありません。
ご購入の際は、必ず公式サイトで最新情報をご確認ください。`,
      
      video: `この動画にはプロモーションが含まれています。
説明欄のリンクはアフィリエイトリンクです。`,
    },
    us: {
      blog: `Disclosure: This post contains affiliate links. 
If you purchase through these links, we may earn a commission at no extra cost to you.
We only recommend products we believe in.`,
      
      email: `This email contains affiliate links.
Prices and availability subject to change.`,
      
      social: `#ad #affiliate
May earn commission from purchases`,
      
      landing_page: `AFFILIATE DISCLOSURE
This page contains affiliate links. We may earn a commission from qualifying purchases.
This does not affect the price you pay.`,
      
      video: `This video includes paid promotion.
Check description for affiliate links.`,
    },
  };
  
  const disclaimer = disclaimers[market]?.[contentType] || disclaimers.jp.blog;
  
  return {
    disclaimer,
    recommendations: [
      '目立つ位置に配置（冒頭推奨）',
      '読みやすいフォントサイズを使用',
      '背景色で区別して視認性向上',
      '定期的に文言を更新',
    ],
    templates: {
      short: market === 'jp' ? '【PR】広告を含みます' : 'Contains affiliate links',
      medium: disclaimer,
      detailed: generateDetailedDisclaimer(market),
    },
  };
}

async function auditMarketingCampaign(campaignContent: string): Promise<any> {
  // キャンペーン全体の監査
  const auditAreas = [
    { area: '表示義務', check: checkDisplayObligations },
    { area: '価格表示', check: checkPriceDisplay },
    { area: '特定商取引法', check: checkSpecificCommercialTransaction },
    { area: '著作権', check: checkCopyright },
    { area: 'プライバシー', check: checkPrivacy },
  ];
  
  const auditResults = [];
  const allIssues: ComplianceIssue[] = [];
  
  for (const audit of auditAreas) {
    const result = audit.check(campaignContent);
    auditResults.push({
      area: audit.area,
      status: result.status,
      issues: result.issues,
    });
    allIssues.push(...result.issues);
  }
  
  const overallScore = calculateComplianceScore(allIssues);
  const requiredActions = prioritizeActions(allIssues);
  
  return {
    report: {
      overallScore,
      status: getComplianceStatus(overallScore),
      auditResults,
      timestamp: new Date().toISOString(),
    },
    issues: allIssues,
    recommendations: [
      '定期的なコンプライアンスチェックの実施',
      '法改正情報の継続的な収集',
      '専門家によるレビューの検討',
      'コンプライアンス研修の実施',
    ],
    requiredActions,
  };
}

// ヘルパー関数
function checkForAffiliateDisclosure(content: string): boolean {
  const disclosureKeywords = [
    'アフィリエイト', '広告', 'PR', 'プロモーション',
    'affiliate', 'sponsored', 'ad',
  ];
  
  return disclosureKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
}

function calculateComplianceScore(issues: ComplianceIssue[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });
  
  return Math.max(0, score);
}

function getComplianceStatus(score: number): 'compliant' | 'needs_attention' | 'non_compliant' {
  if (score >= 80) return 'compliant';
  if (score >= 60) return 'needs_attention';
  return 'non_compliant';
}

function generateComplianceRecommendations(issues: ComplianceIssue[], contentType: string): string[] {
  const recommendations = new Set<string>();
  
  // 重大な問題への対処を優先
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.add('至急: アフィリエイト表示を追加してください');
  }
  
  // カテゴリ別の推奨事項
  const categories = new Set(issues.map(i => i.category));
  categories.forEach(category => {
    switch (category) {
      case '景品表示法':
        recommendations.add('表現の根拠となるデータを準備');
        break;
      case '薬機法':
        recommendations.add('医療関連表現の削除または修正');
        break;
      case '個人情報保護法':
        recommendations.add('プライバシーポリシーの整備');
        break;
    }
  });
  
  // 一般的な推奨事項
  recommendations.add('定期的な法令更新チェック');
  recommendations.add('コンプライアンスチェックリストの活用');
  
  return Array.from(recommendations);
}

function getDisclosurePosition(content: string, patterns: string[]): number {
  let minPosition = content.length;
  
  patterns.forEach(pattern => {
    const position = content.toLowerCase().indexOf(pattern.toLowerCase());
    if (position !== -1 && position < minPosition) {
      minPosition = position;
    }
  });
  
  return minPosition;
}

function getDisclosureTemplates(contentType: string): any {
  return {
    simple: getSimpleDisclosure(contentType),
    detailed: getDetailedDisclosure(contentType),
    legal: getLegalDisclosure(contentType),
  };
}

function getSimpleDisclosure(contentType: string): string {
  const templates = {
    blog: '※この記事は広告を含みます',
    email: '【広告】',
    social: '#PR',
    landing_page: '広告',
    video: '提供',
  };
  return templates[contentType] || templates.blog;
}

function getDetailedDisclosure(contentType: string): string {
  return `当${contentType === 'blog' ? '記事' : 'コンテンツ'}はアフィリエイトプログラムを利用しています。`;
}

function getLegalDisclosure(contentType: string): string {
  return `本${contentType === 'video' ? '動画' : 'コンテンツ'}で紹介する商品・サービスのリンクは、アフィリエイトプログラムによるものです。`;
}

function generateDetailedDisclaimer(market: string): string {
  if (market === 'jp') {
    return `【詳細な広告表示】
当サイトは、複数のアフィリエイトプログラムに参加しています。
当サイトのリンクを経由して商品・サービスを購入された場合、
販売元から当サイトに対して紹介料が支払われることがあります。

掲載している情報は記事作成時点のものであり、
価格・サービス内容等は予告なく変更される場合があります。
ご購入・ご契約の際は、必ず販売元の公式サイトで
最新情報をご確認ください。

当サイトの情報によって生じたいかなる損害についても、
当サイトは一切の責任を負いかねます。`;
  } else {
    return `DETAILED AFFILIATE DISCLOSURE
This website participates in various affiliate programs.
We may receive commissions when you click our links and make purchases.
However, this does not impact our reviews and comparisons.
We only recommend products we believe will add value to our readers.
All opinions expressed are our own.`;
  }
}

// 監査用ヘルパー関数
function checkDisplayObligations(content: string): any {
  const issues: ComplianceIssue[] = [];
  
  if (!content.includes('広告') && !content.includes('PR')) {
    issues.push({
      severity: 'critical',
      category: '表示義務',
      issue: '広告表示がありません',
      recommendation: '「広告」または「PR」表記を追加',
    });
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
  };
}

function checkPriceDisplay(content: string): any {
  const issues: ComplianceIssue[] = [];
  
  if (content.includes('円') || content.includes('¥') || content.includes('$')) {
    if (!content.includes('税込') && !content.includes('税別')) {
      issues.push({
        severity: 'medium',
        category: '価格表示',
        issue: '税込/税別の表示がありません',
        recommendation: '価格には税込/税別を明記',
      });
    }
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
  };
}

function checkSpecificCommercialTransaction(content: string): any {
  const issues: ComplianceIssue[] = [];
  
  const requiredInfo = ['事業者名', '連絡先', '返品'];
  const missingInfo = requiredInfo.filter(info => !content.includes(info));
  
  if (missingInfo.length > 0) {
    issues.push({
      severity: 'medium',
      category: '特定商取引法',
      issue: `必要情報が不足: ${missingInfo.join(', ')}`,
      recommendation: '特定商取引法に基づく表記ページへのリンクを追加',
    });
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
  };
}

function checkCopyright(content: string): any {
  const issues: ComplianceIssue[] = [];
  
  if (content.includes('画像') || content.includes('引用')) {
    if (!content.includes('出典') && !content.includes('©')) {
      issues.push({
        severity: 'low',
        category: '著作権',
        issue: '画像・引用の出典表示が不明確',
        recommendation: '使用素材の出典を明記',
      });
    }
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
  };
}

function checkPrivacy(content: string): any {
  const issues: ComplianceIssue[] = [];
  
  if (content.includes('個人情報') || content.includes('メール')) {
    if (!content.includes('プライバシー')) {
      issues.push({
        severity: 'medium',
        category: 'プライバシー',
        issue: 'プライバシーポリシーへの言及なし',
        recommendation: 'プライバシーポリシーへのリンクを追加',
      });
    }
  }
  
  return {
    status: issues.length === 0 ? 'pass' : 'fail',
    issues,
  };
}

function prioritizeActions(issues: ComplianceIssue[]): string[] {
  const actions = [];
  
  // 重要度順にソート
  const sortedIssues = [...issues].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // 上位5件の対応アクション
  sortedIssues.slice(0, 5).forEach(issue => {
    actions.push(`【${issue.severity.toUpperCase()}】${issue.recommendation}`);
  });
  
  return actions;
}