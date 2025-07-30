import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { RuntimeContext } from '@mastra/core/di';

// Import workflows
import { weatherWorkflow } from './workflows/weather-workflow';
import { affiliateWorkflow } from './workflows/affiliate-workflow';
import { marketResearchWorkflow } from './workflows/market-research-workflow';

// Import agents
import { weatherAgent } from './agents/weather-agent';
import { affiliateAgent } from './agents/affiliate-agent';
import { affiliateAgentV2 } from './agents/affiliate-agent-v2';
import { marketAnalystAgent } from './agents/market-analyst-agent';
import { contentCreatorAgent } from './agents/content-creator-agent';
import { optimizationSpecialistAgent } from './agents/optimization-specialist-agent';
import { relationshipManagerAgent } from './agents/relationship-manager-agent';

// Import networks
import { affiliateNetwork } from './networks/affiliate-network';

// Runtime Context型定義
import type { ContentRuntimeContext } from './tools/content-generator-tool-v2';

export const mastraV2 = new Mastra({
  workflows: { 
    weatherWorkflow, 
    affiliateWorkflow, 
    marketResearchWorkflow 
  },
  agents: { 
    weatherAgent, 
    affiliateAgent,
    affiliateAgentV2, // Runtime Context対応版
    marketAnalystAgent,
    contentCreatorAgent,
    optimizationSpecialistAgent,
    relationshipManagerAgent,
  },
  agentNetworks: { affiliateNetwork },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  server: {
    middleware: [
      async (c, next) => {
        // ランタイムコンテキストの設定
        const runtimeContext = c.get<ContentRuntimeContext>("runtimeContext");
        
        // リクエストヘッダーから地域情報を取得
        const country = c.req.header("CF-IPCountry") || c.req.header("X-Country");
        const acceptLanguage = c.req.header("Accept-Language");
        
        // 地域に基づいて対象市場を設定
        if (country === "JP") {
          runtimeContext.set("target-market", "jp");
          runtimeContext.set("language", "ja");
        } else if (country === "US") {
          runtimeContext.set("target-market", "us");
          runtimeContext.set("language", "en");
        } else {
          runtimeContext.set("target-market", "global");
          runtimeContext.set("language", acceptLanguage?.includes("ja") ? "ja" : "en");
        }
        
        // クエリパラメータからスタイルを設定
        const style = c.req.query("style");
        if (style === "formal" || style === "casual" || style === "technical") {
          runtimeContext.set("content-style", style);
        } else {
          runtimeContext.set("content-style", "formal");
        }
        
        // ユーザーレベルの設定
        const level = c.req.query("level");
        if (level === "beginner" || level === "intermediate" || level === "advanced") {
          runtimeContext.set("revenue-target", level);
        } else {
          runtimeContext.set("revenue-target", "intermediate");
        }
        
        // コンプライアンスモードの設定
        const compliance = c.req.query("compliance");
        runtimeContext.set("compliance-mode", compliance === "strict" ? "strict" : "standard");
        
        await next();
      },
    ],
  },
});