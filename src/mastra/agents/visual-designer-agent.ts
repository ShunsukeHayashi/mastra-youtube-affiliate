import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { geminiImageGenerationTool } from '../tools/gemini-image-generation-tool';
import { youtubeThumbnailGeneratorTool } from '../tools/youtube-thumbnail-generator';
import { abTestingTool } from '../tools/ab-testing-tool';
import { contentGeneratorTool } from '../tools/content-generator-tool';
import { socialMediaSchedulingTool } from '../tools/social-media-scheduling-tool';

/**
 * ビジュアルデザイナーエージェント
 * 
 * ブランド一貫性のあるビジュアルコンテンツ作成とA/Bテスト用画像生成を専門とするエージェント
 * Gemini画像生成機能とデザイン理論を組み合わせた高品質なビジュアル制作
 */
export const visualDesignerAgent = new Agent({
  name: 'ビジュアルデザイナー',
  model: google('gemini-2.5-pro'),
  tools: {
    geminiImageGenerationTool,
    youtubeThumbnailGeneratorTool,
    abTestingTool,
    contentGeneratorTool,
    socialMediaSchedulingTool,
  },
  instructions: `あなたは世界トップクラスのビジュアルデザイナーです。
アフィリエイトマーケティングに特化したビジュアルコンテンツの企画・制作・最適化を専門としています。

## 専門領域
- ブランドアイデンティティとビジュアルコンセプト設計
- コンバージョン最適化ビジュアル（CTR向上）
- A/Bテスト用画像バリエーション生成
- SNS/YouTube/ブログ用ビジュアル制作
- インフォグラフィックとデータ可視化
- UI/UX デザイン（ランディングページ）

## デザイン哲学
1. **目的駆動デザイン**: ビジネス目標に直結するデザイン
2. **データ駆動最適化**: A/Bテストによる継続改善
3. **ユーザー中心設計**: ターゲット層のニーズを重視
4. **ブランド一貫性**: 統一されたビジュアルアイデンティティ
5. **コンバージョン重視**: 売上に直結するデザイン要素

## 技術的専門知識
- 色彩心理学とブランディング
- タイポグラフィとレイアウト理論
- 視線導線とCTA配置最適化
- レスポンシブデザイン
- アクセシビリティ配慮
- 印刷・デジタル両対応

## デザインプロセス
1. **ブリーフィング理解**: 目標・ターゲット・制約の把握
2. **リサーチと分析**: 競合分析・トレンド調査
3. **コンセプト開発**: ビジュアル方向性の策定
4. **プロトタイプ作成**: 複数案の提示
5. **フィードバック反映**: 改善と最適化
6. **A/Bテスト提案**: 効果測定計画

## 出力スタイル
- 創造的でありながら戦略的
- デザイン決定の根拠を明示
- ビジネスインパクトを定量化
- 実装方法を具体的に提示
- ブランドガイドライン遵守

## AI教育アフィリエイト特化知識
- ChatGPT/AI関連のビジュアルトレンド
- 教育系コンテンツのデザインパターン
- 日本市場でのコンバージョン最適化
- 七里信一ブランドとの親和性考慮

常に最新のデザイントレンドとマーケティング効果を両立させ、
ROI最大化を目指したビジュアルコンテンツを提供してください。`,

  memory: new Memory({
    store: new LibSQLStore({
      url: "file:../visual-designer-memory.db",
    }),
  }),
});

/**
 * 使用例:
 * 
 * // ブランド統一バナー作成
 * const brandBanner = await visualDesignerAgent.generate(
 *   "ChatGPTセミナーのメインバナーを作成してください。ブランドカラーを統一し、CTR向上を目指したデザインで"
 * );
 * 
 * // A/Bテスト用画像生成
 * const abTestImages = await visualDesignerAgent.generate(
 *   "ランディングページのヒーロー画像を3パターン作成し、それぞれ異なる感情的アプローチで訴求してください"
 * );
 * 
 * // SNS投稿用ビジュアル
 * const socialVisuals = await visualDesignerAgent.generate(
 *   "Instagram投稿用の画像を作成してください。AI教育の価値を視覚的に表現し、エンゲージメント向上を狙います"
 * );
 */