import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Lark Docs MCPツール
 * Larkドキュメントでのコンテンツ作成と管理
 */
export const larkDocsTool = createTool({
  id: 'mcp-lark-docs',
  description: 'Larkドキュメントでアフィリエイトコンテンツを作成・管理',
  inputSchema: z.object({
    action: z.enum([
      'create_document',
      'update_document',
      'get_document',
      'create_from_template',
      'export_document',
      'collaborate',
    ]),
    docId: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    template: z.enum(['blog', 'report', 'guide', 'email', 'landing_page']).optional(),
    format: z.enum(['markdown', 'html', 'pdf', 'docx']).optional(),
    collaborators: z.array(z.object({
      email: z.string(),
      permission: z.enum(['read', 'write', 'admin']),
    })).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    docId: z.string().optional(),
    url: z.string().optional(),
    content: z.string().optional(),
    exportPath: z.string().optional(),
    metadata: z.object({
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      author: z.string().optional(),
      wordCount: z.number().optional(),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const { action, docId, title, content, template, format, collaborators } = context;
    
    switch (action) {
      case 'create_document':
        return createAffiliateDocument(title!, content!, template);
        
      case 'update_document':
        return updateDocument(docId!, content!);
        
      case 'get_document':
        return getDocument(docId!);
        
      case 'create_from_template':
        return createFromTemplate(template!, title!);
        
      case 'export_document':
        return exportDocument(docId!, format!);
        
      case 'collaborate':
        return setupCollaboration(docId!, collaborators!);
        
      default:
        throw new Error('Invalid action');
    }
  },
});

async function createAffiliateDocument(title: string, content: string, template?: string): Promise<any> {
  // アフィリエイトドキュメント作成
  const docId = `doc_${Date.now()}`;
  const docUrl = `https://lark.com/docs/${docId}`;
  
  const documentTemplates = {
    blog: {
      structure: `# ${title}

## はじめに
[導入文をここに記載]

## 主要ポイント
1. ポイント1
2. ポイント2
3. ポイント3

## 詳細解説
${content}

## まとめ
[結論と行動喚起]

## 関連リンク
- [七里信一ChatGPTセミナー](https://example.com)
- [お問い合わせ](https://example.com/contact)
`,
      wordCount: 1500,
    },
    report: {
      structure: `# ${title}

## エグゼクティブサマリー
[主要な発見と推奨事項]

## 分析結果
### 収益分析
${content}

### パフォーマンス指標
- KPI 1: [値]
- KPI 2: [値]
- KPI 3: [値]

## 推奨アクション
1. アクション1
2. アクション2
3. アクション3

## 付録
[詳細データ]
`,
      wordCount: 2000,
    },
  };
  
  const selectedTemplate = template ? documentTemplates[template] : documentTemplates.blog;
  
  return {
    success: true,
    docId,
    url: docUrl,
    content: selectedTemplate.structure,
    metadata: {
      createdAt: new Date().toISOString(),
      author: 'ハヤシシュンスケ',
      wordCount: selectedTemplate.wordCount,
    },
  };
}

async function updateDocument(docId: string, newContent: string): Promise<any> {
  // ドキュメント更新
  return {
    success: true,
    docId,
    url: `https://lark.com/docs/${docId}`,
    metadata: {
      updatedAt: new Date().toISOString(),
      wordCount: newContent.length,
    },
  };
}

async function getDocument(docId: string): Promise<any> {
  // ドキュメント取得
  const sampleContent = `# ChatGPTセミナー完全レビュー

## 概要
七里信一氏のChatGPTセミナーは、AI時代のビジネス成功法則を学ぶ最高の機会です。

## 主な学習内容
1. プロンプトエンジニアリングの基礎
2. ビジネス応用の実例
3. 収益化の具体的手法

## 受講者の声
「このセミナーで月収が3倍になりました」- 田中様
「AIの可能性を最大限に引き出せるようになりました」- 佐藤様

## 特別オファー
今なら限定価格でご提供中！
[詳細はこちら](https://example.com/offer)
`;
  
  return {
    success: true,
    docId,
    url: `https://lark.com/docs/${docId}`,
    content: sampleContent,
    metadata: {
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-15T14:30:00Z',
      author: 'ハヤシシュンスケ',
      wordCount: 350,
    },
  };
}

async function createFromTemplate(template: string, title: string): Promise<any> {
  // テンプレートからドキュメント作成
  const templates = {
    blog: {
      title: `【2024年最新】${title}`,
      sections: [
        '導入：読者の課題提起',
        '解決策の提示',
        '具体的な実践方法',
        '成功事例の紹介',
        'CTA：次のステップへの誘導',
      ],
      estimatedTime: '2-3時間',
    },
    report: {
      title: `${title} - 月次レポート`,
      sections: [
        'エグゼクティブサマリー',
        'KPI分析',
        'トレンドと洞察',
        '改善提案',
        '次月の計画',
      ],
      estimatedTime: '3-4時間',
    },
    guide: {
      title: `完全ガイド：${title}`,
      sections: [
        '基礎知識',
        'ステップバイステップ手順',
        'よくある質問',
        'トラブルシューティング',
        'リソースリンク',
      ],
      estimatedTime: '4-5時間',
    },
    email: {
      title: `【重要】${title}`,
      sections: [
        '件名の最適化',
        'パーソナライゼーション',
        '価値提供',
        'ソーシャルプルーフ',
        'CTA配置',
      ],
      estimatedTime: '1時間',
    },
    landing_page: {
      title: title,
      sections: [
        'ヘッドライン',
        'サブヘッドライン',
        'ベネフィット',
        '社会的証明',
        'FAQ',
        'CTA',
      ],
      estimatedTime: '2-3時間',
    },
  };
  
  const selectedTemplate = templates[template];
  const docId = `doc_${Date.now()}`;
  
  const content = `# ${selectedTemplate.title}

${selectedTemplate.sections.map((section, index) => 
  `## ${index + 1}. ${section}\n[ここに内容を記載]\n`
).join('\n')}

---
*推定作成時間: ${selectedTemplate.estimatedTime}*
`;
  
  return {
    success: true,
    docId,
    url: `https://lark.com/docs/${docId}`,
    content,
    metadata: {
      createdAt: new Date().toISOString(),
      template,
      estimatedTime: selectedTemplate.estimatedTime,
    },
  };
}

async function exportDocument(docId: string, format: string): Promise<any> {
  // ドキュメントエクスポート
  const exportPaths = {
    markdown: `/exports/${docId}.md`,
    html: `/exports/${docId}.html`,
    pdf: `/exports/${docId}.pdf`,
    docx: `/exports/${docId}.docx`,
  };
  
  const exportSettings = {
    markdown: {
      preserveFormatting: true,
      includeMetadata: true,
    },
    html: {
      includeStyles: true,
      responsive: true,
    },
    pdf: {
      pageSize: 'A4',
      margins: 'normal',
      includeTableOfContents: true,
    },
    docx: {
      compatibility: 'latest',
      trackChanges: false,
    },
  };
  
  return {
    success: true,
    docId,
    exportPath: exportPaths[format],
    metadata: {
      exportedAt: new Date().toISOString(),
      format,
      settings: exportSettings[format],
    },
  };
}

async function setupCollaboration(docId: string, collaborators: any[]): Promise<any> {
  // コラボレーション設定
  const permissions = {
    read: 'ドキュメントの閲覧のみ',
    write: '編集とコメント',
    admin: '完全な管理権限',
  };
  
  const collaborationSettings = {
    allowComments: true,
    trackChanges: true,
    versionHistory: true,
    autoSave: true,
    realTimeCollaboration: true,
  };
  
  const invitations = collaborators.map(collab => ({
    email: collab.email,
    permission: collab.permission,
    permissionDescription: permissions[collab.permission],
    invitedAt: new Date().toISOString(),
    status: 'pending',
  }));
  
  return {
    success: true,
    docId,
    url: `https://lark.com/docs/${docId}`,
    metadata: {
      collaborators: invitations,
      settings: collaborationSettings,
      sharingUrl: `https://lark.com/docs/${docId}/share`,
    },
  };
}