import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const advancedScriptStylesTool = createTool({
  id: 'advanced-script-styles',
  description: 'YouTube長尺動画の高度な台本スタイルを生成',
  inputSchema: z.object({
    styleType: z.enum([
      'taiki',
      'roadmap',
      'osaru',
      'moezo',
      'dialogue',
    ]).describe('台本スタイルタイプ'),
    topic: z.string().describe('動画のトピック'),
    targetDuration: z.number().describe('目標時間（分）'),
  }),
  outputSchema: z.object({
    scriptTemplate: z.object({
      styleName: z.string(),
      description: z.string(),
      uniqueFeatures: z.array(z.string()),
      narrativeApproach: z.string(),
      structureGuidelines: z.array(z.object({
        phase: z.string(),
        objective: z.string(),
        techniques: z.array(z.string()),
        duration: z.string(),
      })),
      languageStyle: z.object({
        tone: z.string(),
        vocabulary: z.string(),
        sentenceStructure: z.string(),
        specialExpressions: z.array(z.string()),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const { styleType, topic, targetDuration } = context;
    
    const styles = {
      taiki: {
        styleName: 'TAIKI型 - 市場リサーチ重視スタイル',
        description: '徹底的な市場調査に基づき、データドリブンで説得力のある台本を作成',
        uniqueFeatures: [
          '最新の市場データとトレンド分析',
          '競合分析と差別化ポイント',
          '視聴者の検索意図の深掘り',
          '数値とファクトベースの論証',
        ],
        narrativeApproach: '客観的データから始まり、徐々に個人的な洞察や提案へと展開',
        structureGuidelines: [
          {
            phase: '市場状況の提示',
            objective: '現在の市場トレンドと課題を明確化',
            techniques: ['統計データの活用', 'グラフやチャートの言及', '業界レポートの引用'],
            duration: `${Math.floor(targetDuration * 0.2)}分`,
          },
          {
            phase: '問題分析',
            objective: '視聴者が直面する具体的な課題を掘り下げる',
            techniques: ['ペルソナ分析', '痛みポイントの特定', 'ケーススタディ'],
            duration: `${Math.floor(targetDuration * 0.3)}分`,
          },
          {
            phase: '解決策の提示',
            objective: 'データに基づく実践的な解決方法を提供',
            techniques: ['ステップバイステップガイド', 'ベストプラクティス', 'ROI分析'],
            duration: `${Math.floor(targetDuration * 0.4)}分`,
          },
          {
            phase: '将来展望',
            objective: '今後のトレンド予測と準備方法',
            techniques: ['予測モデル', '先行指標の解説', '行動計画'],
            duration: `${Math.floor(targetDuration * 0.1)}分`,
          },
        ],
        languageStyle: {
          tone: 'プロフェッショナルかつ親しみやすい',
          vocabulary: '専門用語を使いつつ、必ず分かりやすく解説',
          sentenceStructure: '論理的で明確、結論ファースト',
          specialExpressions: ['データによると', '市場調査の結果', '統計的に見て', '傾向として'],
        },
      },
      roadmap: {
        styleName: 'ロードマップ型 - 段階的成長スタイル',
        description: '初心者から上級者まで、段階的な成長パスを示す包括的な台本',
        uniqueFeatures: [
          '明確なレベル分けとマイルストーン',
          '各段階での具体的な目標設定',
          'つまずきポイントと対処法',
          '成功事例の段階的紹介',
        ],
        narrativeApproach: '視聴者の現在地を確認し、目標達成までの道筋を明確に示す',
        structureGuidelines: [
          {
            phase: '現状診断',
            objective: '視聴者の現在のレベルを自己診断できるようにする',
            techniques: ['チェックリスト', 'レベル判定基準', '自己評価ツール'],
            duration: `${Math.floor(targetDuration * 0.15)}分`,
          },
          {
            phase: '初級編',
            objective: '基礎知識とスキルの習得',
            techniques: ['基本概念の解説', '簡単な実践例', '初心者の失敗例'],
            duration: `${Math.floor(targetDuration * 0.25)}分`,
          },
          {
            phase: '中級編',
            objective: '応用力の向上と実践的スキル',
            techniques: ['応用テクニック', 'ケーススタディ', '効率化のコツ'],
            duration: `${Math.floor(targetDuration * 0.3)}分`,
          },
          {
            phase: '上級編',
            objective: 'プロレベルの知識とスキル',
            techniques: ['高度なテクニック', '独自の工夫', '業界の最前線'],
            duration: `${Math.floor(targetDuration * 0.2)}分`,
          },
          {
            phase: '継続的改善',
            objective: '長期的な成長戦略',
            techniques: ['習慣化の方法', 'PDCAサイクル', 'コミュニティ活用'],
            duration: `${Math.floor(targetDuration * 0.1)}分`,
          },
        ],
        languageStyle: {
          tone: '励ましと指導のバランス',
          vocabulary: 'レベルに応じて段階的に高度化',
          sentenceStructure: '明確な指示と具体的なアクション',
          specialExpressions: ['まず最初に', '次のステップは', 'この段階では', '最終的には'],
        },
      },
      osaru: {
        styleName: 'おさる型 - エンタメ教育スタイル',
        description: 'ユーモアとエンターテインメント性を重視しつつ、しっかりと学べる台本',
        uniqueFeatures: [
          'ユーモアと学習のバランス',
          '記憶に残るキャッチフレーズ',
          '視覚的な比喩の多用',
          'サプライズ要素の組み込み',
        ],
        narrativeApproach: '楽しませながら教える、エデュテインメント型アプローチ',
        structureGuidelines: [
          {
            phase: 'つかみ',
            objective: '笑いや驚きで視聴者の心を掴む',
            techniques: ['意外な導入', 'ユーモラスな例え', '共感できる失敗談'],
            duration: `${Math.floor(targetDuration * 0.15)}分`,
          },
          {
            phase: '楽しい学習',
            objective: 'エンタメ要素を交えながら核心を伝える',
            techniques: ['面白い例え話', 'クイズ形式', 'ゲーミフィケーション'],
            duration: `${Math.floor(targetDuration * 0.4)}分`,
          },
          {
            phase: '実践チャレンジ',
            objective: '視聴者参加型のコンテンツ',
            techniques: ['視聴者への挑戦', '実験的要素', 'インタラクティブ要素'],
            duration: `${Math.floor(targetDuration * 0.3)}分`,
          },
          {
            phase: 'お楽しみまとめ',
            objective: '楽しく復習し、記憶に定着させる',
            techniques: ['替え歌', '語呂合わせ', 'ビジュアルまとめ'],
            duration: `${Math.floor(targetDuration * 0.15)}分`,
          },
        ],
        languageStyle: {
          tone: 'フレンドリーでカジュアル',
          vocabulary: '日常的な言葉と専門用語のミックス',
          sentenceStructure: 'リズミカルで変化に富む',
          specialExpressions: ['なんと！', 'ここがポイント！', '実は...', 'びっくりするけど'],
        },
      },
      moezo: {
        styleName: 'もえぞう型 - 感情共感スタイル',
        description: '視聴者の感情に寄り添い、共感を通じて深い理解を促す台本',
        uniqueFeatures: [
          '個人的なストーリーの共有',
          '感情的な共感ポイント',
          '視聴者の気持ちの代弁',
          '温かみのあるアドバイス',
        ],
        narrativeApproach: '個人的な体験から普遍的な学びへと昇華させる',
        structureGuidelines: [
          {
            phase: '共感の入り口',
            objective: '視聴者と感情的なつながりを作る',
            techniques: ['個人的な体験談', '失敗談の共有', '素直な感情表現'],
            duration: `${Math.floor(targetDuration * 0.2)}分`,
          },
          {
            phase: '深い理解',
            objective: '感情と論理を結びつける',
            techniques: ['なぜそう感じるのか', '背景の説明', '心理的メカニズム'],
            duration: `${Math.floor(targetDuration * 0.3)}分`,
          },
          {
            phase: '一緒に成長',
            objective: '視聴者と共に解決策を探る',
            techniques: ['対話形式', '視聴者の声の反映', '段階的な改善'],
            duration: `${Math.floor(targetDuration * 0.35)}分`,
          },
          {
            phase: '励ましとエール',
            objective: '前向きな気持ちで締めくくる',
            techniques: ['応援メッセージ', '成功の可視化', 'コミュニティの力'],
            duration: `${Math.floor(targetDuration * 0.15)}分`,
          },
        ],
        languageStyle: {
          tone: '温かく親身',
          vocabulary: '感情を表す豊かな表現',
          sentenceStructure: '共感を呼ぶ問いかけ多用',
          specialExpressions: ['私も同じでした', '一緒に頑張りましょう', 'あなたは一人じゃない', '大丈夫です'],
        },
      },
      dialogue: {
        styleName: '掛け合い型 - ダイナミック対話スタイル',
        description: '複数の視点を対話形式で展開し、深い理解を促す台本',
        uniqueFeatures: [
          '異なる立場からの意見交換',
          '質問と回答の自然な流れ',
          'リアルタイムな疑問解消',
          '議論を通じた発見',
        ],
        narrativeApproach: '対話を通じて多角的な理解を深める',
        structureGuidelines: [
          {
            phase: 'キャラクター紹介',
            objective: '話者の立場と背景を明確化',
            techniques: ['役割設定', '専門性の提示', '関係性の説明'],
            duration: `${Math.floor(targetDuration * 0.1)}分`,
          },
          {
            phase: '問題提起の対話',
            objective: '異なる視点から課題を浮き彫りに',
            techniques: ['質問の投げかけ', '意見の対立', '共通認識の確認'],
            duration: `${Math.floor(targetDuration * 0.25)}分`,
          },
          {
            phase: '深掘り討論',
            objective: '核心に迫る議論の展開',
            techniques: ['論点整理', '具体例での検証', '反論と再反論'],
            duration: `${Math.floor(targetDuration * 0.4)}分`,
          },
          {
            phase: '合意形成',
            objective: '建設的な結論への到達',
            techniques: ['共通点の発見', '妥協点の模索', '新しい視点の提示'],
            duration: `${Math.floor(targetDuration * 0.25)}分`,
          },
        ],
        languageStyle: {
          tone: '活発で知的',
          vocabulary: '話者ごとに特徴的な語彙',
          sentenceStructure: '会話のキャッチボール',
          specialExpressions: ['なるほど', 'でも一方で', 'その観点は面白い', '確かにそうですね'],
        },
      },
    };
    
    return {
      scriptTemplate: styles[styleType],
    };
  },
});