# Gemini API Tools 使用例

このドキュメントでは、Mastraに追加された3つのGemini APIツールの使用方法を紹介します。

## 1. Gemini Search Tool（Google検索グラウンディング）

リアルタイムの情報を取得し、回答の正確性を向上させます。

### 基本的な使用例

```typescript
import { geminiSearchTool } from '../tools/gemini-search-tool';

// 最新のAI技術トレンドを検索
const searchResult = await geminiSearchTool.execute({
  context: {
    query: "2024年の最新AI技術トレンド ChatGPT Claude",
    groundingThreshold: 0.8,
    includeSearchResults: true,
    language: "ja"
  }
});

console.log(searchResult.response); // グラウンディングされた回答
console.log(searchResult.searchResults); // 使用された検索結果
console.log(searchResult.groundingMetadata); // メタデータ
```

### アフィリエイトマーケティングでの活用

```typescript
// 競合商品の最新情報を調査
const competitorInfo = await geminiSearchTool.execute({
  context: {
    query: "七里信一 ChatGPTセミナー 最新情報 2024年 評判",
    groundingThreshold: 0.9,
    includeSearchResults: true,
    language: "ja"
  }
});

// 英語圏の市場調査
const globalMarket = await geminiSearchTool.execute({
  context: {
    query: "AI education market trends 2024 affiliate opportunities",
    groundingThreshold: 0.7,
    includeSearchResults: true,
    language: "en"
  }
});
```

## 2. Gemini Code Execution Tool（Pythonコード実行）

データ分析と可視化を安全なサンドボックス環境で実行します。

### 基本的な使用例

```typescript
import { geminiCodeExecutionTool } from '../tools/gemini-code-execution-tool';

// 収益データの分析と可視化
const analysisResult = await geminiCodeExecutionTool.execute({
  context: {
    code: `
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# アフィリエイト収益データ
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
revenue = [270, 320, 380, 450, 500, 580]  # 万円
conversions = [45, 52, 63, 75, 83, 96]

# データフレーム作成
df = pd.DataFrame({
    'Month': months,
    'Revenue': revenue,
    'Conversions': conversions
})

# 統計情報
print("=== 収益統計 ===")
print(f"平均月収: {df['Revenue'].mean():.0f}万円")
print(f"成長率: {((df['Revenue'].iloc[-1] / df['Revenue'].iloc[0]) - 1) * 100:.1f}%")
print(f"コンバージョン単価: {(df['Revenue'].sum() / df['Conversions'].sum() * 10000):.0f}円")

# 可視化
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# 収益推移
ax1.plot(months, revenue, marker='o', linewidth=2, markersize=8)
ax1.fill_between(range(len(months)), revenue, alpha=0.3)
ax1.set_title('アフィリエイト収益推移', fontsize=14)
ax1.set_xlabel('月')
ax1.set_ylabel('収益（万円）')
ax1.grid(True, alpha=0.3)

# コンバージョン vs 収益
ax2.scatter(conversions, revenue, s=100, alpha=0.6)
ax2.set_title('コンバージョン数 vs 収益', fontsize=14)
ax2.set_xlabel('コンバージョン数')
ax2.set_ylabel('収益（万円）')

# トレンドライン
z = np.polyfit(conversions, revenue, 1)
p = np.poly1d(z)
ax2.plot(conversions, p(conversions), "r--", alpha=0.8)

plt.tight_layout()
plt.show()
    `,
    enableLibraries: ['numpy', 'pandas', 'matplotlib'],
    outputFormat: 'both',
    iterativeRefinement: true
  }
});

console.log(analysisResult.executionResult); // 統計情報
console.log(analysisResult.visualizations); // グラフ画像
```

### CSVファイルを使用した分析

```typescript
// CSVデータを含めた分析
const csvAnalysis = await geminiCodeExecutionTool.execute({
  context: {
    code: `
import pandas as pd

# CSVファイルを読み込み
df = pd.read_csv('affiliate_data.csv')

# データ概要
print("=== データ概要 ===")
print(df.info())
print("\\n=== 統計情報 ===")
print(df.describe())

# 商品別の収益集計
product_revenue = df.groupby('product')['revenue'].sum().sort_values(ascending=False)
print("\\n=== 商品別収益ランキング ===")
for product, revenue in product_revenue.items():
    print(f"{product}: {revenue:,}円")
    `,
    files: [{
      name: 'affiliate_data.csv',
      content: Buffer.from(`date,product,clicks,conversions,revenue
2024-01-01,ChatGPTセミナー,1000,50,500000
2024-01-01,AIコース,800,30,300000
2024-01-02,ChatGPTセミナー,1200,60,600000
2024-01-02,AIツール,500,20,100000`).toString('base64')
    }],
    enableLibraries: ['pandas'],
    outputFormat: 'text'
  }
});
```

## 3. Gemini Image Generation Tool（Imagen画像生成）

マーケティング用の高品質な画像を生成します。

### 基本的な使用例

```typescript
import { geminiImageGenerationTool } from '../tools/gemini-image-generation-tool';

// バナー画像の生成
const bannerResult = await geminiImageGenerationTool.execute({
  context: {
    prompt: "ChatGPTセミナーの魅力的なバナー画像、プロフェッショナルなビジネスマンがAIと対話している様子、明るく未来的な雰囲気",
    style: "digital_art",
    aspectRatio: "16:9",
    numberOfImages: 3,
    enhancePrompt: true,
    safetyLevel: "moderate"
  }
});

// 生成された画像を保存
bannerResult.images.forEach((image, index) => {
  const base64Data = image.imageBase64;
  // ファイルに保存する処理
  console.log(`Image ${index + 1} generated`);
  console.log(`Revised prompt: ${image.revisedPrompt}`);
});

console.log(`生成コスト: ${bannerResult.usage.cost}円`);
console.log(`提案:`, bannerResult.suggestions);
```

### ソーシャルメディア用画像

```typescript
// Instagram用正方形画像
const socialImage = await geminiImageGenerationTool.execute({
  context: {
    prompt: "AI教育の未来を表現する抽象的なイメージ、グラデーションカラー、モダンでミニマリスト",
    style: "minimalist",
    aspectRatio: "1:1",
    negativePrompt: "text, people, complex, cluttered",
    numberOfImages: 1,
    enhancePrompt: true
  }
});

// YouTube サムネイル
const thumbnail = await geminiImageGenerationTool.execute({
  context: {
    prompt: "ChatGPT完全攻略ガイド、驚きの表情の人物、明るい背景、プロフェッショナル",
    style: "photorealistic",
    aspectRatio: "16:9",
    numberOfImages: 2,
    safetyLevel: "strict"
  }
});
```

### 既存画像の編集

```typescript
// 背景を変更
const editedImage = await geminiImageGenerationTool.execute({
  context: {
    prompt: "背景をモダンなオフィス環境に変更、AI要素を追加",
    editMode: {
      enabled: true,
      baseImage: originalImageBase64, // 元画像のBase64
      maskImage: maskImageBase64, // マスク画像のBase64
      editPrompt: "modern office background with holographic AI displays"
    }
  }
});
```

## エージェントでの使用例

これらのツールをMastraエージェントで使用する例：

```typescript
import { createAgent } from '@mastra/core/agents';
import { google } from '@ai-sdk/google';
import { geminiSearchTool, geminiCodeExecutionTool, geminiImageGenerationTool } from '../tools';

// リサーチ＆分析エージェント
export const researchAnalystAgent = createAgent({
  id: 'research-analyst',
  name: 'リサーチアナリスト',
  description: '最新情報の調査とデータ分析を担当',
  model: google('gemini-2.5-pro'),
  tools: {
    geminiSearchTool,
    geminiCodeExecutionTool,
  },
  systemPrompt: `あなたは優秀なリサーチアナリストです。
最新の市場情報を調査し、データを分析して洞察を提供します。
常に正確で最新の情報に基づいて回答してください。`,
});

// コンテンツクリエイターエージェント（画像生成付き）
export const visualContentCreatorAgent = createAgent({
  id: 'visual-content-creator',
  name: 'ビジュアルコンテンツクリエイター',
  description: 'ビジュアルコンテンツの企画と生成',
  model: google('gemini-2.5-pro'),
  tools: {
    geminiImageGenerationTool,
    contentGeneratorTool,
  },
  systemPrompt: `あなたは創造的なビジュアルコンテンツクリエイターです。
マーケティング効果の高い画像とコンテンツを生成します。`,
});
```

## ワークフローでの統合例

```typescript
import { createWorkflow } from '@mastra/core/workflows';

// 包括的なマーケティングコンテンツ作成ワークフロー
export const comprehensiveMarketingWorkflow = createWorkflow({
  id: 'comprehensive-marketing',
  name: '包括的マーケティングワークフロー',
  steps: [
    {
      id: 'research',
      name: '市場調査',
      tool: geminiSearchTool,
      input: {
        query: '{{product}} 最新トレンド 競合分析',
        groundingThreshold: 0.8,
        language: 'ja'
      }
    },
    {
      id: 'analyze',
      name: 'データ分析',
      tool: geminiCodeExecutionTool,
      input: {
        code: `
# 前のステップの結果を分析
import json
data = json.loads('{{research.output}}')
# 分析処理...
        `,
        enableLibraries: ['pandas', 'matplotlib']
      }
    },
    {
      id: 'generate-visual',
      name: 'ビジュアル生成',
      tool: geminiImageGenerationTool,
      input: {
        prompt: '{{product}}の魅力を伝えるバナー画像',
        style: 'digital_art',
        aspectRatio: '16:9',
        numberOfImages: 3
      }
    },
    {
      id: 'create-content',
      name: 'コンテンツ作成',
      tool: contentGeneratorTool,
      input: {
        product: '{{product}}',
        contentType: 'blog',
        tone: 'professional',
        includeVisuals: '{{generate-visual.output}}'
      }
    }
  ]
});
```

## パフォーマンス最適化のヒント

1. **検索グラウンディング**
   - groundingThresholdを調整して精度とコストのバランスを取る
   - 必要な場合のみincludeSearchResultsを有効にする

2. **コード実行**
   - 大規模データ処理では効率的なアルゴリズムを使用
   - iterativeRefinementは開発時のみ有効にする

3. **画像生成**
   - numberOfImagesは必要最小限に
   - enhancePromptで品質向上
   - キャッシュを活用して同じ画像の再生成を避ける

## エラーハンドリング

```typescript
try {
  const result = await geminiSearchTool.execute({
    context: { query: "test", language: "ja" }
  });
} catch (error) {
  if (error.message.includes('rate limit')) {
    // レート制限エラーの処理
    await delay(1000);
    // リトライ
  } else if (error.message.includes('safety')) {
    // 安全性フィルターエラー
    // プロンプトを修正
  }
}
```

これらのツールを組み合わせることで、より高度で効果的なアフィリエイトマーケティング自動化が可能になります。