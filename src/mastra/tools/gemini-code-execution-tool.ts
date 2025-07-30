import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from '@ai-sdk/google';

/**
 * Gemini Code Execution Tool - Python実行サンドボックス
 * 
 * このツールは、Gemini APIの組み込みCode Execution機能を活用して、
 * Pythonコードを安全なサンドボックス環境で実行し、データ分析や
 * 可視化を行います。
 */
export const geminiCodeExecutionTool = createTool({
  id: 'gemini-code-execution',
  description: 'Gemini APIのCode Execution機能でPythonコードを実行し、データ分析や可視化を実行',
  inputSchema: z.object({
    code: z.string().describe('実行するPythonコード'),
    files: z.array(z.object({
      name: z.string().describe('ファイル名'),
      content: z.string().describe('ファイルの内容（Base64エンコード）'),
    })).optional().describe('実行環境に追加するファイル'),
    outputFormat: z.enum(['text', 'image', 'both']).default('both').describe('出力形式'),
    enableLibraries: z.array(z.enum([
      'numpy',
      'pandas', 
      'matplotlib',
      'seaborn',
      'scikit-learn',
      'requests',
      'beautifulsoup4',
    ])).default(['numpy', 'pandas', 'matplotlib']).describe('使用するライブラリ'),
    iterativeRefinement: z.boolean().default(true).describe('エラー時の自動修正'),
  }),
  outputSchema: z.object({
    executionResult: z.string().describe('実行結果のテキスト出力'),
    visualizations: z.array(z.object({
      type: z.string().describe('可視化のタイプ（plot, chart, etc）'),
      imageBase64: z.string().describe('画像のBase64エンコード'),
      caption: z.string().optional().describe('画像の説明'),
    })).optional().describe('生成された可視化'),
    refinements: z.array(z.object({
      iteration: z.number(),
      error: z.string(),
      fix: z.string(),
    })).optional().describe('修正履歴'),
    metadata: z.object({
      executionTime: z.number().describe('実行時間（ミリ秒）'),
      memoryUsage: z.number().optional().describe('メモリ使用量（MB）'),
      librariesUsed: z.array(z.string()).describe('使用されたライブラリ'),
    }).describe('実行メタデータ'),
  }),
  execute: async ({ context }) => {
    const { code, files, outputFormat, enableLibraries, iterativeRefinement } = context;

    try {
      // Gemini 2.0+ モデルを使用（Code Execution対応）
      const model = google('gemini-2.0-flash', {
        // Code Execution機能を有効化
        tools: [{ 
          code_execution: {}
        }],
      });

      // コード実行プロンプトを構築
      const codePrompt = buildCodeExecutionPrompt(
        code,
        files,
        enableLibraries,
        outputFormat
      );

      // モデルを実行
      const startTime = Date.now();
      const response = await model.generateText({
        prompt: codePrompt,
        temperature: 0.1, // コード実行は正確性重視
        maxTokens: 4000,
      });
      const executionTime = Date.now() - startTime;

      // レスポンスから実行結果を解析
      const executionData = parseCodeExecutionResponse(response);
      
      // エラーがある場合、iterativeRefinementが有効なら修正を試みる
      let refinements = [];
      if (executionData.error && iterativeRefinement) {
        const refinementResult = await refineCode(
          model,
          code,
          executionData.error,
          enableLibraries
        );
        refinements = refinementResult.refinements;
        if (refinementResult.success) {
          executionData.result = refinementResult.result;
          executionData.visualizations = refinementResult.visualizations;
        }
      }

      return {
        executionResult: executionData.result || 'No output generated',
        visualizations: executionData.visualizations,
        refinements: refinements.length > 0 ? refinements : undefined,
        metadata: {
          executionTime,
          memoryUsage: executionData.memoryUsage,
          librariesUsed: detectUsedLibraries(code, enableLibraries),
        },
      };
    } catch (error) {
      console.error('Gemini Code Execution Error:', error);
      
      return {
        executionResult: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        visualizations: undefined,
        refinements: undefined,
        metadata: {
          executionTime: 0,
          librariesUsed: [],
        },
      };
    }
  },
});

/**
 * コード実行用のプロンプトを構築
 */
function buildCodeExecutionPrompt(
  code: string,
  files?: Array<{ name: string; content: string }>,
  libraries?: string[],
  outputFormat?: string
): string {
  let prompt = 'Execute the following Python code:\n\n';

  // ファイルがある場合、サンドボックスに追加する指示
  if (files && files.length > 0) {
    prompt += 'First, create these files in the execution environment:\n';
    files.forEach(file => {
      prompt += `\nFile: ${file.name}\n`;
      prompt += `Content (Base64): ${file.content}\n`;
    });
    prompt += '\n';
  }

  // 使用可能なライブラリを明示
  if (libraries && libraries.length > 0) {
    prompt += `Available libraries: ${libraries.join(', ')}\n\n`;
  }

  // コードを追加
  prompt += '```python\n';
  prompt += code;
  prompt += '\n```\n\n';

  // 出力形式の指示
  if (outputFormat === 'image') {
    prompt += 'Focus on generating visualizations using matplotlib.\n';
  } else if (outputFormat === 'text') {
    prompt += 'Provide text output only, no visualizations.\n';
  } else {
    prompt += 'Provide both text output and any relevant visualizations.\n';
  }

  prompt += 'Execute the code and show all outputs including prints, plots, and any errors.';

  return prompt;
}

/**
 * コード実行レスポンスを解析
 */
function parseCodeExecutionResponse(response: any): {
  result?: string;
  visualizations?: Array<{
    type: string;
    imageBase64: string;
    caption?: string;
  }>;
  error?: string;
  memoryUsage?: number;
} {
  const result: any = {
    result: '',
    visualizations: [],
  };

  // テキスト結果を抽出
  if (response.text) {
    // コード実行結果を解析
    const outputMatch = response.text.match(/Output:\s*([\s\S]*?)(?=Visualization:|Error:|$)/i);
    if (outputMatch) {
      result.result = outputMatch[1].trim();
    }

    // エラーを検出
    const errorMatch = response.text.match(/Error:\s*([\s\S]*?)(?=Output:|Visualization:|$)/i);
    if (errorMatch) {
      result.error = errorMatch[1].trim();
    }
  }

  // 実験的なプロバイダーメタデータから詳細情報を取得
  if (response.experimental_providerMetadata?.google?.codeExecutionResult) {
    const execResult = response.experimental_providerMetadata.google.codeExecutionResult;
    
    // 実行出力
    if (execResult.output) {
      result.result = execResult.output;
    }
    
    // 生成された画像
    if (execResult.images && execResult.images.length > 0) {
      result.visualizations = execResult.images.map((img: any, index: number) => ({
        type: 'matplotlib_plot',
        imageBase64: img.base64Data,
        caption: img.mimeType === 'image/png' ? `Plot ${index + 1}` : `Image ${index + 1}`,
      }));
    }
    
    // メモリ使用量
    if (execResult.memoryUsage) {
      result.memoryUsage = execResult.memoryUsage / (1024 * 1024); // バイトからMBに変換
    }
  }

  return result;
}

/**
 * エラーが発生した場合にコードを修正
 */
async function refineCode(
  model: any,
  originalCode: string,
  error: string,
  libraries: string[]
): Promise<{
  success: boolean;
  result?: string;
  visualizations?: any[];
  refinements: Array<{
    iteration: number;
    error: string;
    fix: string;
  }>;
}> {
  const refinements = [];
  let currentCode = originalCode;
  let iteration = 0;
  const maxIterations = 3;

  while (iteration < maxIterations) {
    iteration++;
    
    // エラー修正プロンプト
    const fixPrompt = `
The following Python code produced an error:

\`\`\`python
${currentCode}
\`\`\`

Error: ${error}

Please fix the code to resolve this error. Available libraries: ${libraries.join(', ')}

Provide the corrected code:
`;

    try {
      const fixResponse = await model.generateText({
        prompt: fixPrompt,
        temperature: 0.1,
        maxTokens: 2000,
      });

      // 修正されたコードを抽出
      const codeMatch = fixResponse.text.match(/```python\n([\s\S]*?)\n```/);
      if (!codeMatch) {
        break;
      }

      const fixedCode = codeMatch[1];
      const fixDescription = fixResponse.text.split('```')[0].trim();

      refinements.push({
        iteration,
        error: error.substring(0, 200),
        fix: fixDescription.substring(0, 200),
      });

      // 修正されたコードを再実行
      const retryPrompt = buildCodeExecutionPrompt(fixedCode, undefined, libraries, 'both');
      const retryResponse = await model.generateText({
        prompt: retryPrompt,
        temperature: 0.1,
        maxTokens: 4000,
      });

      const retryData = parseCodeExecutionResponse(retryResponse);
      
      if (!retryData.error) {
        return {
          success: true,
          result: retryData.result,
          visualizations: retryData.visualizations,
          refinements,
        };
      }

      // 新しいエラーで続行
      currentCode = fixedCode;
      error = retryData.error;
    } catch (e) {
      console.error('Refinement error:', e);
      break;
    }
  }

  return {
    success: false,
    refinements,
  };
}

/**
 * 使用されたライブラリを検出
 */
function detectUsedLibraries(code: string, enabledLibraries: string[]): string[] {
  const usedLibraries: string[] = [];
  
  const libraryPatterns = {
    'numpy': /import numpy|from numpy|np\./,
    'pandas': /import pandas|from pandas|pd\./,
    'matplotlib': /import matplotlib|from matplotlib|plt\./,
    'seaborn': /import seaborn|from seaborn|sns\./,
    'scikit-learn': /import sklearn|from sklearn/,
    'requests': /import requests|from requests/,
    'beautifulsoup4': /from bs4|import bs4|BeautifulSoup/,
  };

  enabledLibraries.forEach(lib => {
    if (libraryPatterns[lib] && libraryPatterns[lib].test(code)) {
      usedLibraries.push(lib);
    }
  });

  return usedLibraries;
}

/**
 * 使用例:
 * 
 * // データ分析の例
 * const result = await geminiCodeExecutionTool.execute({
 *   context: {
 *     code: `
 * import pandas as pd
 * import matplotlib.pyplot as plt
 * 
 * # データ作成
 * data = {
 *   'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
 *   'Revenue': [270, 320, 380, 450, 500]
 * }
 * df = pd.DataFrame(data)
 * 
 * # 統計情報
 * print("Revenue Statistics:")
 * print(df['Revenue'].describe())
 * 
 * # 可視化
 * plt.figure(figsize=(10, 6))
 * plt.bar(df['Month'], df['Revenue'])
 * plt.title('Monthly Revenue Growth')
 * plt.xlabel('Month')
 * plt.ylabel('Revenue (万円)')
 * plt.show()
 *     `,
 *     enableLibraries: ['pandas', 'matplotlib'],
 *     outputFormat: 'both'
 *   }
 * });
 * 
 * console.log(result.executionResult); // 統計情報
 * console.log(result.visualizations); // グラフ画像
 * 
 * // ファイルを使用した分析
 * const fileAnalysis = await geminiCodeExecutionTool.execute({
 *   context: {
 *     code: `
 * import pandas as pd
 * 
 * # CSVファイルを読み込み
 * df = pd.read_csv('sales_data.csv')
 * print(df.head())
 * print(f"Total Revenue: {df['revenue'].sum():,.0f}円")
 *     `,
 *     files: [{
 *       name: 'sales_data.csv',
 *       content: Buffer.from('date,product,revenue\n2024-01-01,ChatGPTセミナー,500000\n2024-01-02,AIコース,300000').toString('base64')
 *     }],
 *     enableLibraries: ['pandas']
 *   }
 * });
 */