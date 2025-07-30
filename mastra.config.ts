import { defineConfig } from 'mastra';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  // Server configuration
  server: {
    port: process.env.PORT || 4111,
    host: '0.0.0.0',
  },
  
  // Development configuration
  dev: {
    port: 4111,
    debug: true,
  },
  
  // Build configuration
  build: {
    entry: './src/mastra/index.ts',
    outDir: './dist',
  },
  
  // Environment variables required
  env: {
    required: [
      'YOUTUBE_API_KEY',
    ],
    optional: [
      'OPENAI_API_KEY',
      'LARK_APP_ID',
      'LARK_APP_SECRET',
      'DIFY_API_URL',
      'DIFY_API_KEY',
    ],
  },
  
  // Deployment configuration
  deploy: {
    platform: 'mastra-cloud',
    projectName: 'youtube-affiliate-platform',
    region: 'auto',
    scaling: {
      minInstances: 1,
      maxInstances: 10,
      targetCPU: 70,
    },
  },
});