import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { YouTubeService } from '../lib/youtube.js';

export const youtubeAnalyticsTool = createTool({
  id: 'youtube-analytics',
  description: 'YouTubeチャンネルと動画を分析',
  inputSchema: z.object({
    action: z.enum(['channel', 'video', 'search', 'trending']).describe('実行するアクション'),
    channelId: z.string().optional().describe('チャンネルID（channel分析時に必須）'),
    videoId: z.string().optional().describe('動画ID（video分析時に必須）'),
    query: z.string().optional().describe('検索クエリ（search時に必須）'),
    regionCode: z.string().optional().describe('地域コード（デフォルト: JP）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { action, channelId, videoId, query, regionCode } = context;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        data: null,
        error: 'YouTube API key not configured',
      };
    }

    const youtube = new YouTubeService(apiKey);

    try {
      let data;
      
      switch (action) {
        case 'channel':
          if (!channelId) {
            throw new Error('Channel ID is required for channel analysis');
          }
          const channelInfo = await youtube.getChannelInfo(channelId);
          const channelVideos = await youtube.getChannelVideos(channelId);
          data = { channel: channelInfo, videos: channelVideos };
          break;
          
        case 'video':
          if (!videoId) {
            throw new Error('Video ID is required for video analysis');
          }
          const videoDetails = await youtube.getVideoDetails([videoId]);
          data = videoDetails[0];
          break;
          
        case 'search':
          if (!query) {
            throw new Error('Query is required for search');
          }
          data = await youtube.searchVideos(query);
          break;
          
        case 'trending':
          data = await youtube.getTrendingVideos(regionCode || 'JP');
          break;
          
        default:
          throw new Error('Invalid action');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});