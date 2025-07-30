
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { weatherWorkflow } from './workflows/weather-workflow';
import { affiliateWorkflow } from './workflows/affiliate-workflow';
import { marketResearchWorkflow } from './workflows/market-research-workflow';
import { youtubeChannelAnalysisWorkflow } from './workflows/youtube-channel-analysis';
import { youtubeConceptDesignWorkflow } from './workflows/youtube-concept-design';
import { youtubeMarketingSupportWorkflow } from './workflows/youtube-marketing-support';
import { youtubeScriptGenerationWorkflow } from './workflows/youtube-script-generation';
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
import { affiliateNetwork } from './networks/affiliate-network';

export const mastra = new Mastra({
  workflows: { 
    weatherWorkflow, 
    affiliateWorkflow, 
    marketResearchWorkflow,
    youtubeChannelAnalysisWorkflow,
    youtubeConceptDesignWorkflow,
    youtubeMarketingSupportWorkflow,
    youtubeScriptGenerationWorkflow,
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
  },
  agentNetworks: { affiliateNetwork },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into file storage for persistence
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
