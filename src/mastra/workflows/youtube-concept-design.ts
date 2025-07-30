import { createWorkflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { youtubeConceptDesignerAgent } from '../agents/youtube-concept-designer.js';

// Step 1: 商品情報収集
const collectProductInfoStep = createStep({
  id: 'collect-product-info',
  description: '販売商品情報を収集',
  inputSchema: z.object({
    businessName: z.string(),
    serviceUrl: z.string().optional(),
    productDescription: z.string(),
  }),
  outputSchema: z.object({
    productInfo: z.string(),
  }),
  execute: async ({ getInitData }) => {
    const triggerData = getInitData();
    if (!triggerData) {
      throw new Error('Trigger data not found');
    }
    const { businessName, serviceUrl, productDescription } = triggerData;
    
    let productInfo = `事業者名: ${businessName}\n`;
    if (serviceUrl) {
      productInfo += `サービスURL: ${serviceUrl}\n`;
    }
    productInfo += `商品説明: ${productDescription}`;
    
    return { productInfo };
  },
});

// Step 2: キーワード調査
const researchKeywordsStep = createStep({
  id: 'research-keywords',
  description: 'YouTube SEOキーワードを調査',
  inputSchema: z.object({
    productInfo: z.string(),
  }),
  outputSchema: z.object({
    topKeywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
    })),
  }),
  execute: async ({ getStepResult }) => {
    const productResult = getStepResult(collectProductInfoStep);
    if (!productResult) {
      throw new Error('Product info not found');
    }
    const { productInfo } = productResult;
    
    const result = await youtubeConceptDesignerAgent.generate([{
      role: 'user',
      content: `以下の商品情報に基づいて、YouTube SEOキーワードを30個調査し、検索ボリューム順にランキングしてください：\n\n${productInfo}`,
    }]);
    
    // モックデータ（実際はエージェントの応答を解析）
    return {
      topKeywords: [
        { keyword: 'AI活用法', searchVolume: 18000 },
        { keyword: 'ChatGPT使い方', searchVolume: 15000 },
        { keyword: 'AI初心者', searchVolume: 12000 },
      ],
    };
  },
});

// Step 3: ペルソナ生成
const generatePersonasStep = createStep({
  id: 'generate-personas',
  description: 'ターゲットペルソナを生成',
  inputSchema: z.object({
    topKeywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
    })),
  }),
  outputSchema: z.object({
    selectedPersonas: z.array(z.object({
      id: z.string(),
      description: z.string(),
      goals: z.array(z.string()),
    })),
  }),
  execute: async ({ getStepResult }) => {
    const keywordResult = getStepResult(researchKeywordsStep);
    if (!keywordResult) {
      throw new Error('Keywords not found');
    }
    const { topKeywords } = keywordResult;
    const top3Keywords = topKeywords.slice(0, 3).map(k => k.keyword);
    
    const result = await youtubeConceptDesignerAgent.generate([{
      role: 'user',
      content: `以下のキーワードに対して、それぞれ3つずつペルソナを作成し、最も相関性の高い3つを選定してください：\n\n${top3Keywords.join(', ')}`,
    }]);
    
    // モックデータ
    return {
      selectedPersonas: [
        {
          id: 'persona_1',
          description: '30代会社員、AI初心者、業務効率化を目指す',
          goals: ['AIスキルを身につける', '業務時間を削減', '新しいスキルで昇進'],
        },
        {
          id: 'persona_2',
          description: '20代フリーランス、副業探し、AI活用に興味',
          goals: ['副業収入を得る', 'AI技術をマスター', '独立を目指す'],
        },
        {
          id: 'persona_3',
          description: '40代経営者、DX推進、競争力強化',
          goals: ['会社にAI導入', '競合に差をつける', 'コスト削減'],
        },
      ],
    };
  },
});

// Step 4: コンセプト生成
const generateConceptsStep = createStep({
  id: 'generate-concepts',
  description: 'チャンネルコンセプトを生成',
  inputSchema: z.object({
    topKeywords: z.array(z.object({
      keyword: z.string(),
      searchVolume: z.number(),
    })),
    selectedPersonas: z.array(z.object({
      id: z.string(),
      description: z.string(),
      goals: z.array(z.string()),
    })),
  }),
  outputSchema: z.object({
    concepts: z.array(z.object({
      title: z.string(),
      description: z.string(),
      targetKeywords: z.array(z.string()),
      targetPersona: z.string(),
    })),
  }),
  execute: async ({ getStepResult }) => {
    const keywordResult = getStepResult(researchKeywordsStep);
    const personaResult = getStepResult(generatePersonasStep);
    if (!keywordResult || !personaResult) {
      throw new Error('Required data not found');
    }
    const { topKeywords } = keywordResult;
    const { selectedPersonas } = personaResult;
    
    const result = await youtubeConceptDesignerAgent.generate([{
      role: 'user',
      content: `以下の情報に基づいて、YouTubeチャンネルコンセプト案を30個生成してください（タイトルは13文字以内）：
      
キーワード: ${topKeywords.slice(0, 3).map(k => k.keyword).join(', ')}
ペルソナ: ${selectedPersonas.map(p => p.description).join('; ')}`,
    }]);
    
    // モックデータ（実際は30個生成）
    return {
      concepts: [
        {
          title: 'AI活用の教科書',
          description: '初心者でもわかるAI活用法を毎日配信',
          targetKeywords: ['AI活用法', 'AI初心者'],
          targetPersona: 'persona_1',
        },
        {
          title: 'ChatGPT実践塾',
          description: 'ChatGPTを使った実践的な業務効率化テクニック',
          targetKeywords: ['ChatGPT使い方', 'AI活用法'],
          targetPersona: 'persona_1',
        },
        {
          title: 'AI副業スタート',
          description: 'AIを使った副業の始め方と成功事例',
          targetKeywords: ['AI副業', 'AI初心者'],
          targetPersona: 'persona_2',
        },
      ],
    };
  },
});

// ワークフロー定義
export const youtubeConceptDesignWorkflow = createWorkflow({
  id: 'youtube-concept-design',
  inputSchema: z.object({
    businessName: z.string(),
    serviceUrl: z.string().optional(),
    productDescription: z.string(),
    targetConceptCount: z.number().default(30),
  }),
  outputSchema: z.object({
    concepts: z.array(z.object({
      title: z.string(),
      description: z.string(),
      targetKeywords: z.array(z.string()),
      targetPersona: z.string(),
    })),
  }),
})
  .then(collectProductInfoStep)
  .then(researchKeywordsStep)
  .then(generatePersonasStep)
  .then(generateConceptsStep);

youtubeConceptDesignWorkflow.commit();