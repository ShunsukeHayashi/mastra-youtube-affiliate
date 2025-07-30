import { google } from 'googleapis';
import type { youtube_v3 } from 'googleapis';

export class YouTubeService {
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async getChannelInfo(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channelId],
      });

      return response.data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 50) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        channelId,
        maxResults,
        order: 'date',
        type: ['video'],
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }

  async getVideoDetails(videoIds: string[]) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  async searchVideos(query: string, maxResults: number = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        maxResults,
        type: ['video'],
        order: 'relevance',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  async getTrendingVideos(regionCode: string = 'JP', categoryId?: string) {
    try {
      const params: any = {
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode,
        maxResults: 20,
      };

      if (categoryId) {
        params.videoCategoryId = categoryId;
      }

      const response = await this.youtube.videos.list(params);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  }
}