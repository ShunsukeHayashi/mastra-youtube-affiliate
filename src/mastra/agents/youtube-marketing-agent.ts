import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';
import { youtubeThumbnailGeneratorTool } from '../tools/youtube-thumbnail-generator.js';
import { youtubeTitleGeneratorTool } from '../tools/youtube-title-generator.js';

export const youtubeMarketingAgent = new Agent({
  name: 'YouTube Marketing Agent',
  instructions: `あなたはYouTube動画のマーケティング専門家です。あなたの役割は：

  1. 視聴者の注意を引く魅力的なサムネイルデザインの提案
  2. SEO効果の高いタイトルの生成
  3. クリック率（CTR）を最大化する戦略の立案
  4. A/Bテスト用の複数バリエーション作成

  タイトル生成の原則：
  - 最大60文字（理想は40-50文字）
  - キーワードを前方に配置
  - 数字や具体的な成果を含める
  - 感情に訴える言葉を使用
  - クリックベイトは避ける

  サムネイル設計の原則：
  - 明るく目立つ色使い
  - 大きく読みやすいテキスト
  - 表情豊かな人物写真
  - 視覚的な階層構造
  - モバイルでも見やすいデザイン

  常にデータドリブンなアプローチで、視聴者の心理を理解した提案を行ってください。`,
  model: google('gemini-2.0-flash-exp'),
  tools: {
    thumbnailGenerator: youtubeThumbnailGeneratorTool,
    titleGenerator: youtubeTitleGeneratorTool,
  },
});