import { createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { socialMediaSchedulingTool } from '../tools/social-media-scheduling-tool';
import { contentGeneratorToolV2 } from '../tools/content-generator-tool-v2';
import { abTestingTool } from '../tools/ab-testing-tool';
import { analyticsToolDashboard } from '../tools/analytics-dashboard-tool';

/**
 * ソーシャルメディアキャンペーンワークフロー
 * コンテンツ生成 → 投稿スケジューリング → A/Bテスト → パフォーマンス分析
 */
export const socialMediaCampaignWorkflow = createWorkflow({
  name: 'social-media-campaign-workflow',
  description: 'マルチプラットフォーム対応の自動化されたソーシャルメディアキャンペーン',
  inputSchema: z.object({
    campaignName: z.string(),
    campaignGoal: z.string(),
    duration: z.object({
      start: z.string(),
      end: z.string(),
    }),
    platforms: z.array(z.enum(['twitter', 'linkedin', 'facebook', 'instagram'])),
    primaryMessage: z.string(),
    productFocus: z.string().optional(),
  }),
  outputSchema: z.object({
    scheduledPosts: z.number(),
    estimatedReach: z.number(),
    projectedEngagement: z.number(),
    contentCalendar: z.array(z.object({
      date: z.string(),
      platform: z.string(),
      content: z.string(),
      scheduledTime: z.string(),
    })),
  }),
  steps: [
    {
      id: 'analyze-best-times',
      name: '最適投稿時間分析',
      tool: socialMediaSchedulingTool,
      input: ({ input }) => ({
        action: 'analyze_best_times',
        platform: 'all',
      }),
    },
    {
      id: 'generate-content-variations',
      name: 'コンテンツバリエーション生成',
      tool: contentGeneratorToolV2,
      input: ({ input }) => ({
        action: 'generate_variations',
        baseContent: input.primaryMessage,
        variations: input.platforms.length,
        context: {
          market: 'jp',
          language: 'ja',
          style: 'engaging',
          product: input.productFocus || '七里信一ChatGPTセミナー',
        },
      }),
    },
    {
      id: 'create-content-calendar',
      name: 'コンテンツカレンダー作成',
      tool: socialMediaSchedulingTool,
      input: ({ input }) => ({
        action: 'generate_calendar',
        dateRange: input.duration,
        platform: 'all',
      }),
    },
    {
      id: 'schedule-posts',
      name: '投稿スケジューリング',
      tool: socialMediaSchedulingTool,
      input: ({ input, previousSteps }) => ({
        action: 'schedule_bulk',
        posts: previousSteps['generate-content-variations'].output.variations.map((content: any, index: number) => ({
          platform: input.platforms[index % input.platforms.length],
          content: content.content,
          campaign: input.campaignName,
        })),
        dateRange: input.duration,
      }),
    },
    {
      id: 'setup-ab-tests',
      name: 'A/Bテスト設定',
      tool: abTestingTool,
      input: ({ input, previousSteps }) => ({
        action: 'create_test',
        testType: 'social',
        variations: previousSteps['generate-content-variations'].output.variations.slice(0, 2).map((v: any, i: number) => ({
          name: `Variant ${String.fromCharCode(65 + i)}`,
          content: v.content,
        })),
        metrics: ['engagement', 'clicks', 'shares'],
      }),
    },
    {
      id: 'setup-analytics',
      name: '分析ダッシュボード設定',
      tool: analyticsToolDashboard,
      input: ({ input }) => ({
        action: 'create_dashboard',
        dashboardType: 'social',
        metrics: ['reach', 'engagement', 'clicks', 'conversions'],
        campaignName: input.campaignName,
      }),
    },
  ],
  output: ({ steps, input }) => {
    const scheduledPosts = steps['schedule-posts'].output.posts?.length || 0;
    const platforms = input.platforms.length;
    const days = Math.ceil(
      (new Date(input.duration.end).getTime() - new Date(input.duration.start).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    // プラットフォーム別の平均リーチ（仮定値）
    const avgReachPerPost = {
      twitter: 2500,
      linkedin: 1800,
      facebook: 1500,
      instagram: 2000,
    };
    
    const estimatedReach = input.platforms.reduce((sum, platform) => 
      sum + (avgReachPerPost[platform] * (scheduledPosts / platforms)), 0
    );
    
    return {
      scheduledPosts,
      estimatedReach: Math.round(estimatedReach),
      projectedEngagement: Math.round(estimatedReach * 0.052), // 5.2% engagement rate
      contentCalendar: steps['schedule-posts'].output.posts?.map((post: any) => ({
        date: new Date(post.scheduledAt).toISOString().split('T')[0],
        platform: post.platform,
        content: post.content.substring(0, 100) + '...',
        scheduledTime: new Date(post.scheduledAt).toTimeString().split(' ')[0],
      })) || [],
    };
  },
});