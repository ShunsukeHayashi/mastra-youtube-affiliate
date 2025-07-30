# Mastra Multi-Agent Platform

AIエージェントとワークフローを活用した統合プラットフォーム。アフィリエイトマーケティング、YouTube運用、天気情報などの多様な機能を提供します。

## 🚀 主な機能

### 📊 アフィリエイトマーケティング
- **製品分析**: AI教育製品の技術的・市場的分析
- **コンテンツ生成**: ブログ、Twitter、メール、YouTube台本の自動生成
- **収益最適化**: ROI計算と最適化提案
- **マルチエージェント連携**: 市場分析、コンテンツ作成、最適化、関係構築の専門エージェント

### 🎬 YouTube運用自動化
- **チャンネル分析**: パフォーマンスメトリクスとトレンド分析
- **コンセプト設計**: SEOキーワードに基づく30のチャンネルコンセプト案生成
- **マーケティング支援**: サムネイル・タイトル生成、A/Bテスト提案
- **台本生成**: 長尺動画（10-20分）とShorts（60秒）の完全な台本作成

### 🌤️ 天気情報サービス
- リアルタイム天気データ取得
- 天候に応じたアクティビティ提案

### 🔧 技術統合
- **MCP Tools**: IDE診断、Jupyter実行、Lark連携、Difyワークフロー
- **AgentNetwork**: 複数エージェントの動的ルーティング
- **RuntimeContext**: マルチマーケット対応、動的設定

## 📋 前提条件

- Node.js >= 20.9.0
- YouTube Data API キー（YouTube機能使用時）
- 各種APIキー（必要に応じて）

## 🛠️ インストール

```bash
# リポジトリのクローン
git clone <your-repo-url>
cd affiliate

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

## 🚀 起動方法

```bash
# 開発モード
npm run dev

# ビルド
npm run build

# 本番モード
npm start
```

## 🏗️ プロジェクト構造

```
src/mastra/
├── agents/               # AIエージェント
│   ├── affiliate-agent.ts
│   ├── youtube-*.ts      # YouTube関連エージェント
│   └── ...
├── tools/                # 実行可能なツール
│   ├── content-generator-tool.ts
│   ├── youtube-*.ts      # YouTube関連ツール
│   └── mcp-tools/        # MCP統合ツール
├── workflows/            # 自動化ワークフロー
│   ├── affiliate-workflow.ts
│   ├── youtube-*.ts      # YouTubeワークフロー
│   └── ...
├── networks/             # エージェントネットワーク
└── index.ts             # Mastra設定
```

## 🎯 使用例

### アフィリエイトマーケティング

```javascript
// 製品分析とコンテンツ生成
const result = await affiliateWorkflow.execute({
  productName: "ChatGPT Plus",
  targetAudience: "AI初心者",
  contentTypes: ["blog", "twitter", "email"]
});
```

### YouTube運用

```javascript
// チャンネルコンセプト設計
const concepts = await youtubeConceptDesignWorkflow.execute({
  businessName: "AI教育チャンネル",
  productDescription: "AIツールの使い方を教える",
  targetConceptCount: 30
});

// 動画台本生成
const script = await youtubeScriptGenerationWorkflow.execute({
  videoTitle: "ChatGPTで業務効率3倍にする方法",
  videoType: "long", // または "shorts"
  targetAudience: "ビジネスパーソン",
  mainMessage: "AIで仕事を効率化",
  callToAction: "チャンネル登録してください"
});
```

## 🔑 環境変数

```env
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# AI Models
OPENAI_API_KEY=your_openai_api_key

# Lark (Optional)
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret

# Dify (Optional)
DIFY_API_URL=your_dify_api_url
DIFY_API_KEY=your_dify_api_key
```

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Mastra.ai](https://mastra.ai) - AIエージェントオーケストレーションプラットフォーム
- Google Gemini 2.0 Flash - AI言語モデル
- YouTube Data API v3 - YouTube統合