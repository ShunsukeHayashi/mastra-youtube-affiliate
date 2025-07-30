import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { relationshipManagementTool } from '../tools/relationship-management-tool';
import { emailAutomationTool } from '../tools/email-automation-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';
import { analyticsToolDashboard } from '../tools/analytics-dashboard-tool';

/**
 * パートナーアウトリーチワークフロー
 * パートナー特定 → アウトリーチメッセージ作成 → フォローアップ → 関係性追跡
 */
export const partnerOutreachWorkflow = createWorkflow({
  name: 'partner-outreach-workflow',
  description: '戦略的パートナーシップ構築のための自動化アウトリーチワークフロー',
  inputSchema: z.object({
    targetPartner: z.string(),
    partnerType: z.enum(['influencer', 'product_owner', 'affiliate', 'content_creator']),
    outreachGoal: z.string(),
    personalInfo: z.object({
      commonInterests: z.array(z.string()).optional(),
      mutualConnections: z.array(z.string()).optional(),
      specificAchievements: z.array(z.string()).optional(),
    }).optional(),
  }),
  outputSchema: z.object({
    partnerId: z.string(),
    outreachStatus: z.string(),
    emailSequenceId: z.string(),
    estimatedResponseRate: z.number(),
    followUpSchedule: z.array(z.object({
      day: z.number(),
      action: z.string(),
      message: z.string(),
    })),
  }),
  steps: [
    {
      id: 'create-partner-profile',
      name: 'パートナープロファイル作成',
      tool: relationshipManagementTool,
      input: ({ input }) => ({
        action: 'add_partner',
        partner: {
          name: input.targetPartner,
          type: input.partnerType,
          priority: input.partnerType === 'product_owner' ? 'high' : 'medium',
        },
      }),
    },
    {
      id: 'generate-outreach-message',
      name: 'アウトリーチメッセージ生成',
      tool: contentGeneratorToolV2,
      input: ({ input }) => ({
        action: 'generate',
        contentType: 'email',
        topic: `${input.targetPartner}への提携提案`,
        context: {
          market: 'jp',
          language: 'ja',
          style: input.targetPartner === '七里信一' ? 'respectful' : 'professional',
          personalization: {
            recipientName: input.targetPartner,
            commonInterests: input.personalInfo?.commonInterests,
            mutualConnections: input.personalInfo?.mutualConnections,
            achievements: input.personalInfo?.specificAchievements,
          },
        },
        template: getOutreachTemplate(input.partnerType, input.outreachGoal),
      }),
    },
    {
      id: 'create-follow-up-sequence',
      name: 'フォローアップシーケンス作成',
      tool: emailAutomationTool,
      input: ({ input, previousSteps }) => ({
        action: 'create_sequence',
        sequenceName: `${input.targetPartner} アウトリーチシーケンス`,
        emails: [
          {
            subject: `【ご提案】${input.outreachGoal}について`,
            content: previousSteps['generate-outreach-message'].output.content,
            sendAfterDays: 0,
          },
          {
            subject: `Re: 【ご提案】${input.outreachGoal}について`,
            content: generateFollowUp(1, input.targetPartner),
            sendAfterDays: 7,
          },
          {
            subject: `最後のご連絡：${input.outreachGoal}の件`,
            content: generateFollowUp(2, input.targetPartner),
            sendAfterDays: 14,
          },
        ],
        tags: [input.partnerType, 'outreach'],
      }),
    },
    {
      id: 'setup-tracking',
      name: 'トラッキング設定',
      tool: relationshipManagementTool,
      input: ({ input, previousSteps }) => ({
        action: 'track_outreach',
        partnerId: previousSteps['create-partner-profile'].output.partnerId,
        campaign: {
          emailSequenceId: previousSteps['create-follow-up-sequence'].output.sequenceId,
          goal: input.outreachGoal,
          startDate: new Date().toISOString(),
        },
      }),
    },
    {
      id: 'create-task-reminders',
      name: 'タスクリマインダー作成',
      tool: relationshipManagementTool,
      input: ({ input, previousSteps }) => ({
        action: 'add_activity',
        partnerId: previousSteps['create-partner-profile'].output.partnerId,
        activities: [
          {
            type: 'follow_up',
            description: 'LinkedInでつながりリクエストを送信',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            type: 'research',
            description: '最新の活動・投稿をチェック',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            type: 'engagement',
            description: 'コンテンツにコメント・シェア',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      }),
    },
    {
      id: 'setup-analytics',
      name: 'アナリティクス設定',
      tool: analyticsToolDashboard,
      input: ({ previousSteps }) => ({
        action: 'track_campaign',
        campaignType: 'partner_outreach',
        campaignId: previousSteps['create-follow-up-sequence'].output.sequenceId,
        metrics: ['open_rate', 'response_rate', 'meeting_scheduled'],
      }),
    },
  ],
  output: ({ steps, input }) => {
    const responseRates = {
      influencer: 25,
      product_owner: 40,
      affiliate: 35,
      content_creator: 30,
    };
    
    return {
      partnerId: steps['create-partner-profile'].output.partnerId,
      outreachStatus: 'initiated',
      emailSequenceId: steps['create-follow-up-sequence'].output.sequenceId,
      estimatedResponseRate: responseRates[input.partnerType],
      followUpSchedule: [
        {
          day: 0,
          action: '初回アウトリーチメール送信',
          message: '提携提案とメリットの説明',
        },
        {
          day: 3,
          action: 'LinkedInコネクション',
          message: 'プロフェッショナルネットワークでの接続',
        },
        {
          day: 7,
          action: '1回目フォローアップ',
          message: '追加情報の提供と質問への回答',
        },
        {
          day: 10,
          action: 'コンテンツエンゲージメント',
          message: 'パートナーのコンテンツへの価値ある反応',
        },
        {
          day: 14,
          action: '最終フォローアップ',
          message: '別のアプローチまたはタイミングの提案',
        },
      ],
    };
  },
});

// ヘルパー関数
function getOutreachTemplate(partnerType: string, goal: string): string {
  const templates = {
    influencer: `
{recipientName}様

突然のご連絡失礼いたします。
{yourName}と申します。

{recipientName}様の{achievement}を拝見し、
ぜひ{goal}についてご相談させていただきたくご連絡いたしました。

{commonInterest}という共通の関心もあり、
Win-Winの関係を構築できると確信しております。

15分ほどお時間をいただけないでしょうか？

よろしくお願いいたします。
    `,
    product_owner: `
{recipientName}様

お世話になっております。
{yourName}です。

{product}の素晴らしさに感銘を受け、
ぜひ{goal}のご提案をさせていただきたくご連絡いたしました。

私のプラットフォームでは月間{traffic}のアクセスがあり、
貴社製品の価値を効果的に伝えることができます。

詳細な提案書をご用意しておりますので、
ご都合の良い時にお話しさせていただけないでしょうか？

何卒よろしくお願いいたします。
    `,
  };
  
  return templates[partnerType] || templates.influencer;
}

function generateFollowUp(attemptNumber: number, partnerName: string): string {
  const followUps = [
    `${partnerName}様\n\n先日お送りした提案についてご検討いただけましたでしょうか？\n\n追加でご質問やご不明な点がございましたら、お気軽にお聞きください。\n\nよろしくお願いいたします。`,
    `${partnerName}様\n\nお忙しい中恐れ入ります。\n\n以前の提案について、タイミングが合わないようでしたら、別の形でのコラボレーションも可能です。\n\n一度お話しできる機会をいただけないでしょうか？\n\nよろしくお願いいたします。`,
  ];
  
  return followUps[attemptNumber - 1] || followUps[1];
}