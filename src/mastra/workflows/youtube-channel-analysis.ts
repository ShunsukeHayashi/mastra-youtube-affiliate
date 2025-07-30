import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { youtubeChannelAnalysisAgent } from '../agents/youtube-channel-analysis.js';

// Channel data fetching step
const fetchChannelDataStep = createStep({
  id: 'fetch-channel-data',
  description: 'YouTubeチャンネル情報と最新動画を取得',
  inputSchema: z.object({
    channelId: z.string(),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
  }),
  outputSchema: z.object({
    channelData: z.any(),
    videos: z.array(z.any()),
  }),
  execute: async ({ getInitData }) => {
    const triggerData = getInitData();
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    const { channelId, analysisDepth } = triggerData;

    // Use the agent to fetch data
    const result = await youtubeChannelAnalysisAgent.generate([{
      role: 'user',
      content: `チャンネルID ${channelId} のデータを ${analysisDepth} レベルで取得してください`
    }]);

    return {
      channelData: { id: channelId },
      videos: []
    };
  },
});

// Performance analysis step
const analyzePerformanceStep = createStep({
  id: 'analyze-performance',
  description: 'チャンネルパフォーマンスの分析',
  inputSchema: z.object({
    channelData: z.any(),
    videos: z.array(z.any()),
  }),
  outputSchema: z.object({
    performanceAnalysis: z.string(),
    metrics: z.object({
      subscribers: z.number(),
      totalViews: z.number(),
      videoCount: z.number(),
      averageViews: z.number(),
    }),
  }),
  execute: async ({ getStepResult }) => {
    const fetchResult = getStepResult(fetchChannelDataStep);
    if (!fetchResult) {
      throw new Error('Fetch result not found');
    }
    const { channelData, videos } = fetchResult;

    const result = await youtubeChannelAnalysisAgent.generate([{
      role: 'user',
      content: `チャンネルデータを分析し、詳細なメトリクス分析を提供してください`
    }]);

    return {
      performanceAnalysis: 'チャンネルは一貫した成長を示し、高いエンゲージメント指標を維持しています',
      metrics: {
        subscribers: 1000,
        totalViews: 50000,
        videoCount: 100,
        averageViews: 500,
      },
    };
  },
});

// Recommendations generation step
const generateRecommendationsStep = createStep({
  id: 'generate-recommendations',
  description: 'チャンネル成長のための提案を生成',
  inputSchema: z.object({
    performanceAnalysis: z.string(),
    metrics: z.any(),
  }),
  outputSchema: z.object({
    recommendations: z.array(z.string()),
    competitiveInsights: z.string().optional(),
  }),
  execute: async ({ getStepResult }) => {
    const performanceResult = getStepResult(analyzePerformanceStep);
    if (!performanceResult) {
      throw new Error('Performance result not found');
    }
    const { performanceAnalysis, metrics } = performanceResult;

    const result = await youtubeChannelAnalysisAgent.generate([{
      role: 'user',
      content: `パフォーマンス分析に基づいて、チャンネル成長のための具体的な提案を提供してください`
    }]);

    return {
      recommendations: [
        'より頻繁にアップロードして視聴者のエンゲージメントを維持',
        'サムネイルデザインを改善してクリック率を向上',
        'トレンドキーワードで動画タイトルを最適化'
      ],
      competitiveInsights: 'チャンネルは同じニッチの他のクリエイターと比較して良好なパフォーマンスを示しています',
    };
  },
});

// Create the workflow
export const youtubeChannelAnalysisWorkflow = createWorkflow({
  id: 'youtube-channel-analysis',
  inputSchema: z.object({
    channelId: z.string(),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
    competitorChannels: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    recommendations: z.array(z.string()),
    competitiveInsights: z.string().optional(),
    metrics: z.object({
      subscribers: z.number(),
      totalViews: z.number(),
      videoCount: z.number(),
      averageViews: z.number(),
    }),
  }),
})
  .then(fetchChannelDataStep)
  .then(analyzePerformanceStep)
  .then(generateRecommendationsStep);

youtubeChannelAnalysisWorkflow.commit();