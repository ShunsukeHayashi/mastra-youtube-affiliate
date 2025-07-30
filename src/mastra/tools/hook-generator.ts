import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const hookGeneratorTool = createTool({
  id: 'hook-generator',
  description: '視聴者を引き込む強力なフックを生成',
  inputSchema: z.object({
    topic: z.string().describe('動画のトピック'),
    hookType: z.enum([
      'question',
      'shocking_fact',
      'contradiction',
      'promise',
      'story',
      'challenge',
    ]).describe('フックのタイプ'),
    emotionalTrigger: z.enum([
      'curiosity',
      'fear',
      'excitement',
      'surprise',
      'urgency',
    ]).describe('感情的トリガー'),
  }),
  outputSchema: z.object({
    hooks: z.array(z.object({
      text: z.string(),
      type: z.string(),
      strength: z.number().min(0).max(100),
      deliveryNotes: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { topic, hookType, emotionalTrigger } = context;
    
    const hookTemplates = {
      question: {
        curiosity: `なぜ${topic}で成功する人は、たった1%しかいないのか？`,
        fear: `${topic}を知らないと、あなたは大きな損失を被るかもしれません`,
        excitement: `${topic}で人生が180度変わった瞬間を教えます！`,
        surprise: `えっ、${topic}ってそんなに簡単だったの？`,
        urgency: `今すぐ${topic}を始めないと手遅れになる理由`,
      },
      shocking_fact: {
        curiosity: `実は${topic}には、誰も知らない裏技があります`,
        fear: `${topic}の失敗率は87%...でも回避方法があります`,
        excitement: `${topic}で月収100万円達成した人の共通点を発見！`,
        surprise: `${topic}の常識、実は全部ウソでした`,
        urgency: `あと3ヶ月で${topic}のルールが変わります`,
      },
      contradiction: {
        curiosity: `${topic}の専門家が絶対に教えない真実`,
        fear: `みんなが信じている${topic}の方法は実は逆効果`,
        excitement: `${topic}の逆転の発想で大成功！`,
        surprise: `${topic}をやめたら、むしろ結果が出た理由`,
        urgency: `今の${topic}のやり方を続けると危険な理由`,
      },
      promise: {
        curiosity: `この動画を見れば、${topic}の全てがわかります`,
        fear: `${topic}の落とし穴を全て回避する方法を教えます`,
        excitement: `たった10分で${topic}をマスターできる方法`,
        surprise: `${topic}がこんなに簡単になる秘密を公開`,
        urgency: `今から始めれば、3ヶ月後には${topic}のプロに`,
      },
      story: {
        curiosity: `${topic}で失敗した私が、成功するまでの物語`,
        fear: `${topic}で100万円損した私の失敗談`,
        excitement: `${topic}で人生が変わった日のこと`,
        surprise: `まさか${topic}でこんなことが起きるなんて...`,
        urgency: `もっと早く${topic}を始めていれば...という後悔`,
      },
      challenge: {
        curiosity: `${topic}の常識を覆す実験をしてみた`,
        fear: `${topic}の危険性を身をもって検証`,
        excitement: `${topic}で限界に挑戦してみた結果...`,
        surprise: `${topic}を1週間やり続けたら衝撃の結果に`,
        urgency: `24時間以内に${topic}をマスターする挑戦`,
      },
    };
    
    const selectedHook = hookTemplates[hookType][emotionalTrigger];
    
    return {
      hooks: [
        {
          text: selectedHook,
          type: hookType,
          strength: 85,
          deliveryNotes: '強い感情を込めて、視聴者の目を見て話す',
        },
        {
          text: `待って！${selectedHook}`,
          type: hookType,
          strength: 90,
          deliveryNotes: '「待って！」で注意を引き、間を置いてから本題へ',
        },
        {
          text: `${selectedHook}（実話です）`,
          type: hookType,
          strength: 95,
          deliveryNotes: '「実話です」を付けることで信憑性を高める',
        },
      ],
    };
  },
});