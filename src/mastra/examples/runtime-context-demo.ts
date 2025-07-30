/**
 * Runtime Context 使用例
 * 
 * 動的な設定によりエージェントの振る舞いを変更する例
 */

import { RuntimeContext } from '@mastra/core/di';
import { mastraV2 } from '../index-v2';
import type { ContentRuntimeContext } from '../tools/content-generator-tool-v2';

// 使用例1: 日本市場向けフォーマルコンテンツ
async function generateJapaneseContent() {
  console.log('🇯🇵 日本市場向けコンテンツ生成...\n');
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  
  const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
  runtimeContext.set('target-market', 'jp');
  runtimeContext.set('content-style', 'formal');
  runtimeContext.set('revenue-target', 'intermediate');
  runtimeContext.set('compliance-mode', 'strict');
  runtimeContext.set('language', 'ja');
  
  const response = await agent.generate(
    '七里信一ChatGPTセミナーのブログ記事を作成してください',
    { runtimeContext }
  );
  
  console.log('生成されたコンテンツ:', response.text);
}

// 使用例2: 米国市場向けカジュアルコンテンツ
async function generateUSContent() {
  console.log('🇺🇸 米国市場向けコンテンツ生成...\n');
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  
  const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
  runtimeContext.set('target-market', 'us');
  runtimeContext.set('content-style', 'casual');
  runtimeContext.set('revenue-target', 'beginner');
  runtimeContext.set('compliance-mode', 'standard');
  runtimeContext.set('language', 'en');
  
  const response = await agent.generate(
    'Create a blog post about ChatGPT Plus affiliate program',
    { runtimeContext }
  );
  
  console.log('Generated content:', response.text);
}

// 使用例3: 上級者向け技術的コンテンツ
async function generateTechnicalContent() {
  console.log('🔧 技術者向けコンテンツ生成...\n');
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  
  const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
  runtimeContext.set('target-market', 'global');
  runtimeContext.set('content-style', 'technical');
  runtimeContext.set('revenue-target', 'advanced');
  runtimeContext.set('compliance-mode', 'standard');
  runtimeContext.set('language', 'en');
  
  const response = await agent.generate(
    'Create a technical comparison of AI education platforms for advanced users',
    { runtimeContext }
  );
  
  console.log('Generated content:', response.text);
}

// 使用例4: 動的な市場切り替え
async function dynamicMarketContent() {
  console.log('🌍 動的市場対応コンテンツ...\n');
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  const markets: Array<'jp' | 'us' | 'global'> = ['jp', 'us', 'global'];
  
  for (const market of markets) {
    const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
    runtimeContext.set('target-market', market);
    runtimeContext.set('content-style', 'formal');
    runtimeContext.set('revenue-target', 'intermediate');
    runtimeContext.set('compliance-mode', 'standard');
    runtimeContext.set('language', market === 'jp' ? 'ja' : 'en');
    
    console.log(`\n--- ${market.toUpperCase()} Market ---`);
    
    const response = await agent.generate(
      market === 'jp' 
        ? 'ChatGPT Plusの紹介メールを作成' 
        : 'Create an introduction email for ChatGPT Plus',
      { runtimeContext }
    );
    
    console.log(response.text.substring(0, 200) + '...');
  }
}

// 使用例5: A/Bテストのためのバリエーション生成
async function generateABTestVariants() {
  console.log('🔬 A/Bテスト用バリエーション生成...\n');
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  const styles: Array<'formal' | 'casual' | 'technical'> = ['formal', 'casual', 'technical'];
  const variants = [];
  
  for (const style of styles) {
    const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
    runtimeContext.set('target-market', 'jp');
    runtimeContext.set('content-style', style);
    runtimeContext.set('revenue-target', 'intermediate');
    runtimeContext.set('compliance-mode', 'standard');
    runtimeContext.set('language', 'ja');
    
    const response = await agent.generate(
      '七里信一ChatGPTセミナーのTwitter投稿を作成',
      { runtimeContext }
    );
    
    variants.push({
      style,
      content: response.text,
    });
  }
  
  console.log('生成されたバリエーション:');
  variants.forEach((v, i) => {
    console.log(`\nVariant ${i + 1} (${v.style}):`);
    console.log(v.content);
  });
}

// デモの実行
export async function runRuntimeContextDemo() {
  try {
    // 1. 日本市場向け
    await generateJapaneseContent();
    
    // 2. 米国市場向け
    await generateUSContent();
    
    // 3. 技術者向け
    await generateTechnicalContent();
    
    // 4. 動的市場切り替え
    await dynamicMarketContent();
    
    // 5. A/Bテストバリエーション
    await generateABTestVariants();
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// REST APIでの使用例
export async function handleAPIRequest(request: Request) {
  // ヘッダーから地域情報を取得
  const country = request.headers.get('CF-IPCountry') || 'JP';
  const acceptLanguage = request.headers.get('Accept-Language') || 'ja';
  
  // URLパラメータから設定を取得
  const url = new URL(request.url);
  const style = url.searchParams.get('style') || 'formal';
  const level = url.searchParams.get('level') || 'intermediate';
  
  const agent = mastraV2.getAgent('affiliateAgentV2');
  const runtimeContext = new RuntimeContext<ContentRuntimeContext>();
  
  // 動的に設定
  runtimeContext.set('target-market', country === 'JP' ? 'jp' : country === 'US' ? 'us' : 'global');
  runtimeContext.set('content-style', style as any);
  runtimeContext.set('revenue-target', level as any);
  runtimeContext.set('compliance-mode', country === 'JP' ? 'strict' : 'standard');
  runtimeContext.set('language', acceptLanguage.includes('ja') ? 'ja' : 'en');
  
  const response = await agent.generate(
    '最適なアフィリエイト商品を推薦してください',
    { runtimeContext }
  );
  
  return new Response(JSON.stringify({
    content: response.text,
    context: {
      market: runtimeContext.get('target-market'),
      language: runtimeContext.get('language'),
      style: runtimeContext.get('content-style'),
    },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// スタンドアロン実行
if (require.main === module) {
  runRuntimeContextDemo();
}