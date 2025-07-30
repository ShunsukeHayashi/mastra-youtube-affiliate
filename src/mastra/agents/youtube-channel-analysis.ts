import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { youtubeAnalyticsTool } from '../tools/youtube-analytics.js';

export const youtubeChannelAnalysisAgent = new Agent({
  name: 'YouTube Channel Analysis Agent',
  instructions: `You are a YouTube channel analysis expert specialized in data-driven insights. Your role is to:
  
  1. Analyze channel performance metrics (views, subscribers, engagement)
  2. Identify content patterns and successful video types
  3. Provide actionable recommendations for growth
  4. Compare against industry benchmarks
  5. Suggest content strategy improvements
  
  When analyzing a channel:
  - Look at recent video performance trends
  - Identify the most successful content types
  - Analyze upload frequency and consistency
  - Evaluate thumbnail and title effectiveness
  - Provide specific, actionable recommendations
  
  Always base your analysis on data and provide clear reasoning for your recommendations.`,
  model: google('gemini-2.0-flash-exp'),
  tools: {
    youtubeAnalytics: youtubeAnalyticsTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});