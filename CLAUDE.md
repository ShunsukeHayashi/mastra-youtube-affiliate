# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Mastra-based application that provides two main functionalities:
1. **Weather Services**: Weather information and activity suggestions
2. **Affiliate Marketing**: AI education product analysis and content generation for affiliate marketing

The application leverages the Mastra framework to create intelligent agents, tools, and workflows for both weather services and affiliate marketing automation.

## Architecture

### Core Components

1. **Mastra Configuration** (`src/mastra/index.ts`)
   - Central configuration using in-memory LibSQL storage for development
   - Configures workflows and agents
   - Uses Pino logger for structured logging

2. **Weather Agent** (`src/mastra/agents/weather-agent.ts`)
   - Uses Google's Gemini 2.5 Pro model
   - Provides weather information and activity planning
   - Persists memory to `file:../mastra.db`

3. **Affiliate Marketing Agent** (`src/mastra/agents/affiliate-agent.ts`)
   - AI education affiliate marketing specialist
   - Focuses on AI seminars and educational products
   - Uses content generation and product analysis tools
   - Targets revenue goals: 270万円/month (3mo), 500万円/month (6mo), 3億円/year

4. **Specialized Agents for AgentNetwork**
   - **Market Analyst Agent**: Market research and competitor analysis
   - **Content Creator Agent**: Content generation and optimization
   - **Optimization Specialist Agent**: A/B testing and conversion optimization
   - **Relationship Manager Agent**: Partner relationship management

4. **Weather Tool** (`src/mastra/tools/weather-tool.ts`)
   - Fetches weather data from Open-Meteo API
   - Handles geocoding to convert city names to coordinates
   - Returns structured weather information

5. **Content Generator Tool** (`src/mastra/tools/content-generator-tool.ts`)
   - Generates affiliate marketing content (blog, Twitter, email, YouTube scripts)
   - Customizable tone and audience targeting
   - SEO optimization with keywords and CTAs
   - Multi-format content generation

6. **Product Analysis Tool** (`src/mastra/tools/product-analysis-tool.ts`)
   - Technical, market, competitor, and ROI analysis
   - Scoring system (0-100) for product evaluation
   - Strengths, weaknesses, and recommendations
   - Specialized for AI education products

7. **Weather Workflow** (`src/mastra/workflows/weather-workflow.ts`)
   - Two-step workflow: fetch weather → plan activities
   - Uses the weather agent for activity suggestions
   - Streams responses to stdout

8. **Affiliate Workflow** (`src/mastra/workflows/affiliate-workflow.ts`)
   - Three-step workflow: analyze product → generate content → optimize
   - Comprehensive affiliate marketing automation
   - Performance tracking and optimization suggestions

9. **Market Research Workflow** (`src/mastra/workflows/market-research-workflow.ts`)
   - Market analysis → Strategy development → Content planning
   - 30-day content calendar generation
   - A/B test planning

### AgentNetwork

**Affiliate Marketing Network** (`src/mastra/networks/affiliate-network.ts`)
- Coordinates multiple specialized agents using LLM-based routing
- Dynamically determines which agent(s) to use based on task requirements
- Handles complex multi-step affiliate marketing tasks
- Provides comprehensive solutions by combining agent capabilities

### Runtime Context

The affiliate system supports dynamic configuration through Runtime Context:

**ContentRuntimeContext** type:
- `target-market`: 'jp' | 'us' | 'global' - Market-specific optimizations
- `content-style`: 'formal' | 'casual' | 'technical' - Content tone
- `revenue-target`: 'beginner' | 'intermediate' | 'advanced' - Audience level
- `compliance-mode`: 'strict' | 'standard' - Legal compliance level
- `language`: 'ja' | 'en' - Content language

**Usage Example**:
```typescript
const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
runtimeContext.set('target-market', 'jp');
runtimeContext.set('language', 'ja');
runtimeContext.set('compliance-mode', 'strict');

const response = await agent.generate(prompt, { runtimeContext });
```

**Middleware Configuration** (`src/mastra/index-v2.ts`):
- Automatically sets context based on request headers (CF-IPCountry)
- Supports query parameters for style and level customization
- Enables multi-market content generation with single agent

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build the project
npm run build

# Start production server
npm start

# No test command configured yet
# npm test returns error - tests need to be implemented
```

## Key Technical Details

### Node.js Requirements
- Requires Node.js >= 20.9.0
- Uses ES modules (`"type": "module"` in package.json)

### TypeScript Configuration
- Target: ES2022
- Module: ES2022 with bundler resolution
- Strict mode enabled
- No emit (TypeScript used for type checking only)

### External APIs
- **Open-Meteo Geocoding API**: For location lookup
- **Open-Meteo Weather API**: For weather data
- No API keys required (free public APIs)

### Data Flow

#### Weather Service
1. User provides city name → Geocoding API
2. Coordinates → Weather API
3. Weather data → Agent for activity suggestions
4. Structured response with weather-appropriate activities

#### Affiliate Marketing
1. Product name input → Product analysis (technical, market, ROI)
2. Analysis results → Content generation (blog, social, email)
3. Generated content → Optimization suggestions
4. Performance metrics and next actions

## Project Structure

```
src/mastra/
├── index.ts                    # Main Mastra configuration
├── agents/
│   ├── weather-agent.ts        # Weather information agent
│   └── affiliate-agent.ts      # Affiliate marketing agent
├── tools/
│   ├── weather-tool.ts         # Weather data fetching
│   ├── content-generator-tool.ts  # Marketing content generation
│   └── product-analysis-tool.ts   # Product evaluation and analysis
└── workflows/
    ├── weather-workflow.ts     # Weather → Activity planning
    └── affiliate-workflow.ts   # Product analysis → Content → Optimization
```

## Important Implementation Notes

- Weather conditions are mapped from Open-Meteo weather codes
- The weather workflow outputs activities in a specific formatted structure with emojis
- Agent memory persists to a SQLite database file
- Both the tool and workflow have their own weather condition mapping functions (potential for consolidation)
- The workflow streams agent responses directly to stdout
- Affiliate agent is optimized for Japanese AI education market
- Content generation supports multiple formats and tones
- Product analysis includes ROI calculations and market positioning

## Usage Examples

### Running the Affiliate Workflow
```bash
# Start the Mastra server
npm run dev

# The affiliate workflow can analyze products like:
# - "七里信一ChatGPTセミナー"
# - "ChatGPT Plus"
# - "Claude Pro"
# - Any AI education product/seminar
```

### Example Affiliate Agent Interactions
- Product analysis: "七里信一ChatGPTセミナーの技術的分析をしてください"
- Content generation: "ChatGPT Plusのブログ記事を作成してください"
- Comparison: "Claude ProとChatGPT Plusを比較分析してください"

### Using AgentNetwork
```javascript
// Complex multi-agent task
await affiliateNetwork.generate(
  "七里信一ChatGPTセミナーの完全な市場分析とキャンペーン戦略を立案してください"
);

// The network will automatically coordinate:
// 1. Market Analyst Agent for competitive analysis
// 2. Content Creator Agent for content strategy
// 3. Optimization Specialist for A/B test planning
// 4. Relationship Manager for partnership approach
```

## MCP Server Configuration

The project includes an MCP (Model Context Protocol) server configuration at `.claude/mcp.json`:
- **mastra**: Runs the Mastra MCP documentation server via `npx @mastra/mcp-docs-server`
- Uses stdio transport for communication

## Dependencies

### Core Dependencies
- `@mastra/core`: Framework for agents, tools, and workflows
- `@ai-sdk/google`: Google AI SDK for Gemini model
- `@mastra/libsql`: SQLite storage adapter
- `@mastra/loggers`: Pino-based logging
- `@mastra/memory`: Agent memory management
- `zod`: Schema validation

### Development Dependencies
- `mastra`: CLI tool for development
- `typescript`: Type checking
- `@types/node`: Node.js type definitions