import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from '@ai-sdk/google';

/**
 * Gemini Image Generation Tool - Imagen画像生成
 * 
 * このツールは、Gemini APIのImagen機能を活用して、
 * テキストプロンプトから高品質な画像を生成し、
 * アフィリエイトマーケティングのビジュアルコンテンツを作成します。
 */
export const geminiImageGenerationTool = createTool({
  id: 'gemini-image-generation',
  description: 'Gemini APIのImagen機能でテキストから高品質な画像を生成',
  inputSchema: z.object({
    prompt: z.string().describe('画像生成プロンプト'),
    negativePrompt: z.string().optional().describe('生成しない要素の指定'),
    style: z.enum([
      'photorealistic',
      'digital_art', 
      'oil_painting',
      'watercolor',
      'sketch',
      'anime',
      'isometric',
      'pixel_art',
      'minimalist',
    ]).default('photorealistic').describe('画像スタイル'),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).default('16:9').describe('アスペクト比'),
    numberOfImages: z.number().min(1).max(4).default(1).describe('生成する画像数'),
    editMode: z.object({
      enabled: z.boolean().default(false),
      baseImage: z.string().optional().describe('編集元画像（Base64）'),
      maskImage: z.string().optional().describe('編集マスク画像（Base64）'),
      editPrompt: z.string().optional().describe('編集指示'),
    }).optional().describe('画像編集モード'),
    enhancePrompt: z.boolean().default(true).describe('プロンプトの自動改善'),
    safetyLevel: z.enum(['strict', 'moderate', 'relaxed']).default('moderate').describe('安全性レベル'),
  }),
  outputSchema: z.object({
    images: z.array(z.object({
      imageBase64: z.string().describe('生成された画像（Base64）'),
      revisedPrompt: z.string().optional().describe('改善されたプロンプト'),
      metadata: z.object({
        width: z.number(),
        height: z.number(),
        format: z.string(),
        model: z.string(),
      }).describe('画像メタデータ'),
    })).describe('生成された画像リスト'),
    usage: z.object({
      promptTokens: z.number(),
      generationTime: z.number().describe('生成時間（秒）'),
      cost: z.number().optional().describe('推定コスト（円）'),
    }).describe('使用状況'),
    suggestions: z.array(z.string()).optional().describe('改善提案'),
  }),
  execute: async ({ context }) => {
    const { 
      prompt, 
      negativePrompt, 
      style, 
      aspectRatio, 
      numberOfImages,
      editMode,
      enhancePrompt,
      safetyLevel
    } = context;

    try {
      // Imagen 3モデルを使用（最新の画像生成モデル）
      const model = google('imagen-3', {
        // 画像生成の応答モダリティを設定
        responseModalities: ['IMAGE'],
      });

      // プロンプトを構築（スタイルと要件を組み込む）
      const enhancedPrompt = buildImagePrompt(
        prompt,
        style,
        negativePrompt,
        enhancePrompt
      );

      // 画像サイズを計算
      const dimensions = calculateDimensions(aspectRatio);

      const startTime = Date.now();
      const results = [];

      // 編集モードの場合
      if (editMode?.enabled && editMode.baseImage) {
        const editResult = await performImageEdit(
          model,
          editMode.baseImage,
          editMode.maskImage,
          editMode.editPrompt || prompt,
          style
        );
        results.push(editResult);
      } else {
        // 新規生成モード
        for (let i = 0; i < numberOfImages; i++) {
          const imagePrompt = i > 0 
            ? `${enhancedPrompt} (variation ${i + 1})`
            : enhancedPrompt;

          const response = await model.generateImage({
            prompt: imagePrompt,
            n: 1,
            size: dimensions,
            safetySettings: mapSafetyLevel(safetyLevel),
          });

          if (response.images && response.images.length > 0) {
            const image = response.images[0];
            results.push({
              imageBase64: image.base64,
              revisedPrompt: response.revisedPrompt || imagePrompt,
              metadata: {
                width: dimensions.width,
                height: dimensions.height,
                format: 'png',
                model: 'imagen-3',
              },
            });
          }
        }
      }

      const generationTime = (Date.now() - startTime) / 1000;

      // 使用状況とコスト計算
      const usage = {
        promptTokens: estimateTokens(enhancedPrompt),
        generationTime,
        cost: calculateImageGenerationCost(numberOfImages, dimensions),
      };

      // アフィリエイトマーケティング向けの提案
      const suggestions = generateMarketingSuggestions(prompt, style, results);

      return {
        images: results,
        usage,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    } catch (error) {
      console.error('Gemini Image Generation Error:', error);
      
      // エラー時のフォールバック
      return {
        images: [],
        usage: {
          promptTokens: 0,
          generationTime: 0,
        },
        suggestions: [
          'エラーが発生しました。プロンプトを簡潔にして再試行してください。',
          '安全性フィルターに引っかかる可能性があります。内容を調整してください。',
        ],
      };
    }
  },
});

/**
 * 画像生成プロンプトを構築
 */
function buildImagePrompt(
  basePrompt: string,
  style: string,
  negativePrompt?: string,
  enhance?: boolean
): string {
  let prompt = basePrompt;

  // スタイル固有の修飾子を追加
  const styleModifiers = {
    photorealistic: 'ultra realistic, high detail, professional photography, 8k resolution',
    digital_art: 'digital painting, concept art, trending on artstation, highly detailed',
    oil_painting: 'oil on canvas, masterpiece, classical painting style, brush strokes visible',
    watercolor: 'watercolor painting, soft colors, artistic, paper texture',
    sketch: 'pencil sketch, line art, black and white, detailed drawing',
    anime: 'anime style, manga art, vibrant colors, cel shaded',
    isometric: 'isometric view, 3D render, clean design, geometric',
    pixel_art: '8-bit pixel art, retro gaming style, limited color palette',
    minimalist: 'minimalist design, simple, clean, modern, negative space',
  };

  if (enhance && styleModifiers[style]) {
    prompt = `${prompt}, ${styleModifiers[style]}`;
  }

  // アフィリエイトマーケティング向けの追加要素
  if (enhance && basePrompt.toLowerCase().includes('marketing')) {
    prompt += ', professional, trustworthy, engaging, conversion-optimized';
  }

  // ネガティブプロンプトの処理
  if (negativePrompt) {
    prompt += ` --no ${negativePrompt}`;
  }

  return prompt;
}

/**
 * アスペクト比から画像サイズを計算
 */
function calculateDimensions(aspectRatio: string): { width: number; height: number; size: string } {
  const dimensions = {
    '1:1': { width: 1024, height: 1024, size: '1024x1024' },
    '16:9': { width: 1792, height: 1024, size: '1792x1024' },
    '9:16': { width: 1024, height: 1792, size: '1024x1792' },
    '4:3': { width: 1024, height: 768, size: '1024x768' },
    '3:4': { width: 768, height: 1024, size: '768x1024' },
  };

  return dimensions[aspectRatio] || dimensions['16:9'];
}

/**
 * 画像編集を実行
 */
async function performImageEdit(
  model: any,
  baseImage: string,
  maskImage?: string,
  editPrompt?: string,
  style?: string
): Promise<any> {
  try {
    const editRequest = {
      image: baseImage,
      prompt: editPrompt,
      mask: maskImage,
      n: 1,
    };

    const response = await model.editImage(editRequest);

    if (response.images && response.images.length > 0) {
      return {
        imageBase64: response.images[0].base64,
        revisedPrompt: `Edited: ${editPrompt}`,
        metadata: {
          width: 1024, // デフォルト値
          height: 1024,
          format: 'png',
          model: 'imagen-3-edit',
        },
      };
    }
  } catch (error) {
    console.error('Image edit error:', error);
    throw error;
  }
}

/**
 * 安全性レベルをマップ
 */
function mapSafetyLevel(level: string): any {
  const safetyMappings = {
    strict: {
      harmCategory: 'BLOCK_ALL',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    moderate: {
      harmCategory: 'BLOCK_SOME',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    relaxed: {
      harmCategory: 'BLOCK_FEW',
      threshold: 'BLOCK_HIGH_AND_ABOVE',
    },
  };

  return safetyMappings[level] || safetyMappings.moderate;
}

/**
 * トークン数を推定
 */
function estimateTokens(text: string): number {
  // 簡易的な推定: 1トークン ≈ 4文字
  return Math.ceil(text.length / 4);
}

/**
 * 画像生成コストを計算（推定）
 */
function calculateImageGenerationCost(numberOfImages: number, dimensions: any): number {
  // Imagen APIの推定コスト（実際の価格は異なる可能性があります）
  const baseCost = 0.02; // $0.02 per image
  const resolutionMultiplier = (dimensions.width * dimensions.height) / (1024 * 1024);
  const yenRate = 150; // USD to JPY

  return numberOfImages * baseCost * resolutionMultiplier * yenRate;
}

/**
 * マーケティング向けの提案を生成
 */
function generateMarketingSuggestions(prompt: string, style: string, results: any[]): string[] {
  const suggestions = [];

  // プロンプトの内容に基づく提案
  if (prompt.toLowerCase().includes('banner') || prompt.toLowerCase().includes('ad')) {
    suggestions.push('CTAボタンを追加して、クリック率を向上させましょう');
    suggestions.push('ブランドカラーを使用して、認知度を高めましょう');
  }

  if (prompt.toLowerCase().includes('social') || prompt.toLowerCase().includes('sns')) {
    suggestions.push('プラットフォーム別のサイズバリエーションを作成しましょう');
    suggestions.push('テキストオーバーレイ用のスペースを確保しましょう');
  }

  if (style === 'photorealistic' && results.length > 0) {
    suggestions.push('A/Bテスト用に複数のバリエーションを生成しました');
  }

  if (prompt.toLowerCase().includes('product')) {
    suggestions.push('商品の特徴が明確に伝わるアングルを選択しましょう');
    suggestions.push('使用シーンを含めると、購買意欲が高まります');
  }

  // 一般的な提案
  suggestions.push('生成された画像は、著作権フリーで商用利用可能です');

  return suggestions;
}

/**
 * 使用例:
 * 
 * // バナー画像生成
 * const bannerResult = await geminiImageGenerationTool.execute({
 *   context: {
 *     prompt: "ChatGPTセミナーの魅力的なバナー画像、プロフェッショナルなビジネスマンがAIと対話している様子",
 *     style: "digital_art",
 *     aspectRatio: "16:9",
 *     numberOfImages: 3,
 *     enhancePrompt: true,
 *     safetyLevel: "moderate"
 *   }
 * });
 * 
 * console.log(bannerResult.images.length); // 3つのバリエーション
 * console.log(bannerResult.suggestions); // マーケティング提案
 * 
 * // ソーシャルメディア用画像
 * const socialResult = await geminiImageGenerationTool.execute({
 *   context: {
 *     prompt: "AI教育の未来を表現する抽象的なイメージ、明るく希望的な雰囲気",
 *     style: "minimalist",
 *     aspectRatio: "1:1",
 *     negativePrompt: "dark, complex, cluttered",
 *     numberOfImages: 1
 *   }
 * });
 * 
 * // 既存画像の編集
 * const editResult = await geminiImageGenerationTool.execute({
 *   context: {
 *     prompt: "背景をよりプロフェッショナルなオフィス環境に変更",
 *     editMode: {
 *       enabled: true,
 *       baseImage: "base64_encoded_image_data",
 *       maskImage: "base64_encoded_mask_data",
 *       editPrompt: "modern office background with AI elements"
 *     }
 *   }
 * });
 */