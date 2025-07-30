
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ quiet: true });

// Import specific tools to avoid circular dependencies
// Direct tool imports to avoid bundling issues
import { weatherTool } from './tools/weather-tool';
import { productAnalysisTool } from './tools/product-analysis-tool';
import { contentGeneratorTool } from './tools/content-generator-tool';
import { youtubeAnalyticsTool } from './tools/youtube-analytics';
import { youtubeKeywordResearchTool } from './tools/youtube-keyword-research';
import { youtubeThumbnailGeneratorTool } from './tools/youtube-thumbnail-generator';
import { geminiSearchTool } from './tools/gemini-search-tool';
import { geminiCodeExecutionTool } from './tools/gemini-code-execution-tool';
import { geminiImageGenerationTool } from './tools/gemini-image-generation-tool';
import { weatherWorkflow } from './workflows/weather-workflow';
import { affiliateWorkflow } from './workflows/affiliate-workflow';
import { marketResearchWorkflow } from './workflows/market-research-workflow';
import { youtubeChannelAnalysisWorkflow } from './workflows/youtube-channel-analysis';
import { youtubeConceptDesignWorkflow } from './workflows/youtube-concept-design';
import { youtubeMarketingSupportWorkflow } from './workflows/youtube-marketing-support';
import { youtubeScriptGenerationWorkflow } from './workflows/youtube-script-generation';
// import { comprehensiveCampaignWorkflow } from './workflows/comprehensive-campaign-workflow';
// import { dataDrivenOptimizationWorkflow } from './workflows/data-driven-optimization-workflow';
import { weatherAgent } from './agents/weather-agent';
import { affiliateAgent } from './agents/affiliate-agent';
import { marketAnalystAgent } from './agents/market-analyst-agent';
import { contentCreatorAgent } from './agents/content-creator-agent';
import { optimizationSpecialistAgent } from './agents/optimization-specialist-agent';
import { relationshipManagerAgent } from './agents/relationship-manager-agent';
import { youtubeChannelAnalysisAgent } from './agents/youtube-channel-analysis';
import { youtubeConceptDesignerAgent } from './agents/youtube-concept-designer';
import { youtubeMarketingAgent } from './agents/youtube-marketing-agent';
import { youtubeScriptWriterAgent } from './agents/youtube-script-writer';
import { realtimeResearcherAgent } from './agents/realtime-researcher-agent';
import { visualDesignerAgent } from './agents/visual-designer-agent';
import { affiliateNetwork } from './networks/affiliate-network';
// import { enhancedAffiliateNetwork } from './networks/enhanced-affiliate-network';

export const mastra = new Mastra({
  workflows: { 
    weatherWorkflow, 
    affiliateWorkflow, 
    marketResearchWorkflow,
    youtubeChannelAnalysisWorkflow,
    youtubeConceptDesignWorkflow,
    youtubeMarketingSupportWorkflow,
    youtubeScriptGenerationWorkflow,
    // comprehensiveCampaignWorkflow,
    // dataDrivenOptimizationWorkflow,
  },
  agents: { 
    weatherAgent, 
    affiliateAgent,
    marketAnalystAgent,
    contentCreatorAgent,
    optimizationSpecialistAgent,
    relationshipManagerAgent,
    youtubeChannelAnalysisAgent,
    youtubeConceptDesignerAgent,
    youtubeMarketingAgent,
    youtubeScriptWriterAgent,
    realtimeResearcherAgent,
    visualDesignerAgent,
  },
  agentNetworks: { 
    affiliateNetwork,
    // enhancedAffiliateNetwork,
  },
  tools: {
    // Core Tools
    'get-weather': weatherTool,
    'analyze-ai-product': productAnalysisTool,
    'generate-affiliate-content': contentGeneratorTool,
    
    // YouTube Tools
    'youtube-analytics': youtubeAnalyticsTool,
    'youtube-keyword-research': youtubeKeywordResearchTool,
    'youtube-thumbnail-generator': youtubeThumbnailGeneratorTool,
    
    // Gemini API Tools
    'gemini-search-grounding': geminiSearchTool,
    'gemini-code-execution': geminiCodeExecutionTool,
    'gemini-image-generation': geminiImageGenerationTool,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into file storage for persistence
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
