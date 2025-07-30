import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const scriptStyleSelectorTool = createTool({
  id: 'script-style-selector',
  description: 'YouTube台本のスタイルを選択',
  inputSchema: z.object({
    videoType: z.enum(['long', 'shorts']).describe('動画タイプ'),
    contentCategory: z.enum([
      'educational',
      'entertainment',
      'how-to',
      'news',
      'review',
      'vlog',
    ]).describe('コンテンツカテゴリー'),
    targetAudience: z.string().describe('ターゲット視聴者'),
  }),
  outputSchema: z.object({
    scriptStyle: z.object({
      styleName: z.string(),
      description: z.string(),
      characteristics: z.array(z.string()),
      structureTemplate: z.object({
        sections: z.array(z.object({
          name: z.string(),
          purpose: z.string(),
          duration: z.string(),
          keyElements: z.array(z.string()),
        })),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const { videoType, contentCategory, targetAudience } = context;
    
    if (videoType === 'shorts') {
      // Shorts用のスタイル
      return {
        scriptStyle: {
          styleName: 'Shorts高速展開型',
          description: '60秒以内で視聴者を引き込み、価値を提供する超圧縮型スタイル',
          characteristics: [
            '3秒以内の強力なフック',
            '一般常識を否定する導入',
            '最後まで見るメリットの明示',
            '抽象と具体のバランス',
            '500-600文字の台本',
          ],
          structureTemplate: {
            sections: [
              {
                name: 'タイトルコール',
                purpose: '動画の主題を一言で伝える',
                duration: '2-3秒',
                keyElements: ['キャッチーなタイトル', '期待感の演出'],
              },
              {
                name: '興味付け',
                purpose: '視聴者の常識を覆し、興味を引く',
                duration: '5-7秒',
                keyElements: ['否定的フック', '意外性', '問題提起'],
              },
              {
                name: 'メリット提示',
                purpose: '最後まで見る価値を明確に伝える',
                duration: '3-5秒',
                keyElements: ['具体的な利益', '数字の活用', '約束'],
              },
              {
                name: 'メインコンテンツ',
                purpose: '価値ある情報を凝縮して提供',
                duration: '40-45秒',
                keyElements: ['3つのポイント', '具体例', '実践方法'],
              },
              {
                name: 'クロージング',
                purpose: '行動を促し、エンゲージメントを獲得',
                duration: '5-8秒',
                keyElements: ['CTA', 'フォロー促進', '次回予告'],
              },
            ],
          },
        },
      };
    } else {
      // 長尺動画用のスタイル選択
      const styles = {
        educational: {
          styleName: '教育型詳細解説',
          description: '専門的な内容を分かりやすく、段階的に解説するスタイル',
          characteristics: [
            '論理的な構成',
            '図解やデータの活用',
            'ステップバイステップの説明',
            '実例の豊富な使用',
          ],
        },
        entertainment: {
          styleName: 'エンタメ型ストーリーテリング',
          description: '物語性を重視し、感情に訴えかけるスタイル',
          characteristics: [
            'ドラマチックな展開',
            'ユーモアの活用',
            '感情的な共感',
            'サプライズ要素',
          ],
        },
        'how-to': {
          styleName: 'ハウツー実践型',
          description: '具体的な手順を実演しながら教えるスタイル',
          characteristics: [
            '明確な手順説明',
            '実演の重要性',
            'つまずきポイントの解説',
            '結果の実証',
          ],
        },
        news: {
          styleName: 'ニュース報道型',
          description: '最新情報を客観的に、分かりやすく伝えるスタイル',
          characteristics: [
            '5W1Hの明確化',
            '客観性の維持',
            '複数視点の提示',
            '影響分析',
          ],
        },
        review: {
          styleName: 'レビュー評価型',
          description: '製品やサービスを多角的に評価するスタイル',
          characteristics: [
            'メリット・デメリット分析',
            '比較検討',
            '実使用体験',
            '総合評価',
          ],
        },
        vlog: {
          styleName: 'Vlog日常共有型',
          description: '個人的な体験や日常を親しみやすく共有するスタイル',
          characteristics: [
            'パーソナルな語り',
            '自然な会話調',
            '感情の共有',
            'リアルタイム感',
          ],
        },
      };
      
      const selectedStyle = styles[contentCategory] || styles.educational;
      
      return {
        scriptStyle: {
          ...selectedStyle,
          structureTemplate: {
            sections: [
              {
                name: 'オープニング',
                purpose: '視聴者の注意を引き、動画の価値を伝える',
                duration: '30-60秒',
                keyElements: ['強力なフック', 'テーマ紹介', '価値提案'],
              },
              {
                name: '問題提起',
                purpose: '視聴者が共感する課題を明確にする',
                duration: '60-90秒',
                keyElements: ['現状分析', '課題の具体化', '共感ポイント'],
              },
              {
                name: 'メインコンテンツ',
                purpose: '核となる情報や解決策を提供',
                duration: '5-10分',
                keyElements: ['3-5つのメインポイント', '詳細説明', '実例'],
              },
              {
                name: '実践・応用',
                purpose: '視聴者が実際に活用できる方法を示す',
                duration: '2-3分',
                keyElements: ['ステップバイステップ', '注意点', 'Tips'],
              },
              {
                name: 'まとめ・CTA',
                purpose: '要点を整理し、次のアクションを促す',
                duration: '30-60秒',
                keyElements: ['要点復習', 'CTA', '関連動画案内'],
              },
            ],
          },
        },
      };
    }
  },
});