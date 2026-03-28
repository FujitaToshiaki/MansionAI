# Puppeteer フルページスクリーンショット取得ガイド

Replit環境でPuppeteer（puppeteer-core）を使い、Webアプリの全画面スクリーンショットを確実に取得するための手順書です。  
Recharts等のSVGチャート、`overflow-hidden` レイアウト、Radix UIタブ切り替えなど、よくあるハマりポイントとその解決策を網羅しています。

---

## 1. 前提環境

| 項目 | 値 |
|------|-----|
| ランタイム | Node.js + TypeScript（tsx） |
| ブラウザ | Chromium（Nix store経由） |
| パッケージ | `puppeteer-core`（`puppeteer`ではなくcore版を使用） |

### Chromiumパスの確認

Replit環境ではChromiumがNix storeに配置されています。パスはプロジェクトごとに異なる場合があるため、以下で確認してください。

```bash
which chromium || ls /nix/store/*/bin/chromium 2>/dev/null | head -1
```

---

## 2. 基本テンプレート

```typescript
import puppeteer, { Page } from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://0.0.0.0:5000'; // アプリのURL
const OUTPUT_DIR = path.resolve('docs/screenshots');
const VP_W = 1500; // スクリーンショットの幅

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: '<Chromiumパス>', // 上記コマンドで確認したパス
    headless: 'new',  // ★ 必ず 'new' を指定（後述）
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
}
```

---

## 3. フルページスクリーンショットの正しい撮り方

### 問題: `fullPage: true` だとSVGチャートが消える

Puppeteerの `fullPage: true` オプションでは、内部的にページ全体をキャプチャするために特殊な処理が入ります。これがSVGの `clipPath` 要素と干渉し、Rechartsなどのチャートライブラリで描画されたグラフが空白になることがあります。

### 解決策: ビューポートをコンテンツ高さに合わせて `fullPage: false` で撮影

```typescript
async function removeClipPaths(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('[clip-path]').forEach(el =>
      el.removeAttribute('clip-path')
    );
  });
}

async function measureContentHeight(page: Page): Promise<number> {
  const h = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) {
      // overflow-hidden を解除して本来の高さを計測
      (main as HTMLElement).style.overflow = 'visible';
      (main as HTMLElement).style.height = 'auto';
      let el: HTMLElement | null = main.parentElement;
      while (el) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el = el.parentElement;
      }
    }
    return main
      ? main.scrollHeight + main.getBoundingClientRect().top + 40
      : document.body.scrollHeight + 40;
  });
  return Math.max(900, h);
}

async function takeScreenshot(page: Page, filePath: string) {
  // 1. コンテンツ高さを計測
  const h = await measureContentHeight(page);

  // 2. ビューポートをコンテンツサイズに設定
  await page.setViewport({ width: VP_W, height: h });

  // 3. リサイズイベントを発火（ResponsiveContainer等の再描画を促す）
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
  });
  await new Promise(r => setTimeout(r, 2500));

  // 4. SVGのclipPathを除去（ヘッドレスChromiumの描画問題対策）
  await removeClipPaths(page);
  await new Promise(r => setTimeout(r, 500));

  // 5. fullPage: false で撮影（ビューポート全体 = ページ全体）
  await page.screenshot({ path: filePath, fullPage: false });
}
```

---

## 4. よくある課題と解決策

### 課題1: `overflow-hidden` レイアウトでコンテンツが切れる

**症状**: SPAで `h-screen overflow-hidden` のレイアウトを使っている場合、`scrollHeight` がビューポート高さと同じ値を返し、下部のコンテンツが切れる。

**原因**: `overflow: hidden` により、ブラウザはスクロール可能な高さを報告しない。

**解決策**: 計測前に `overflow` と `height` のスタイルを動的に解除する。

```typescript
// main要素とその全親要素のoverflow/heightを解除
const main = document.querySelector('main');
if (main) {
  (main as HTMLElement).style.overflow = 'visible';
  (main as HTMLElement).style.height = 'auto';
  let el = main.parentElement;
  while (el) {
    el.style.overflow = 'visible';
    el.style.height = 'auto';
    el = el.parentElement;
  }
}
```

---

### 課題2: Recharts（ResponsiveContainer）のグラフが空白

**症状**: スクリーンショット上でグラフ領域が真っ白になる。DOMを調べるとSVG要素は存在し、パスデータも正しい。

**原因**: 2つの原因が複合している。

1. **clipPath問題**: ヘッドレスChromiumのSVGレンダラーが `clipPath` 参照を正しく描画しないケースがある。`fullPage: true` 使用時に特に顕著。
2. **ResponsiveContainer問題**: `ResponsiveContainer` は `ResizeObserver` を使ってサイズを決定する。ビューポート外（below the fold）にある場合、高さ0で描画されることがある。

**解決策**:

```typescript
// A. ページロード時に十分な高さのビューポートを設定
//    （チャートが最初からビューポート内に入るようにする）
await page.setViewport({ width: 1500, height: 2500 });
await page.goto(url, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 4000)); // チャート描画を待つ

// B. clipPathを除去
await page.evaluate(() => {
  document.querySelectorAll('[clip-path]').forEach(el =>
    el.removeAttribute('clip-path')
  );
});

// C. fullPage: false で撮影
await page.screenshot({ path: filePath, fullPage: false });
```

---

### 課題3: Radix UIタブの切り替えが効かない

**症状**: `page.evaluate(() => document.querySelector('[data-testid="tab-xxx"]').click())` でタブをクリックしても、タブが切り替わらない。

**原因**: Radix UIのタブコンポーネントは、JavaScriptの `HTMLElement.click()` ではなく、ブラウザネイティブのクリックイベント（PointerEvent等）を必要とする。`page.evaluate` 内での `.click()` はDOMレベルのクリックであり、Radix UIが期待するイベントシーケンスと一致しない。

**解決策**: Puppeteerの `page.click()` を使用する（ネイティブのマウスイベントが発火される）。

```typescript
// NG: evaluate内のclick
await page.evaluate(() => {
  (document.querySelector('[data-testid="tab-xxx"]') as HTMLElement).click();
});

// OK: Puppeteerのpage.click
await page.click('[data-testid="tab-xxx"]');
```

---

### 課題4: 動的コンテンツの表示待ち

**症状**: ページ遷移後すぐにスクリーンショットを撮ると、データがロードされていない。

**解決策**: `networkidle2` + 固定待ち時間の組み合わせ。

```typescript
// ページ遷移
await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

// APIレスポンス後のReact再レンダリング + チャート描画を待つ
await new Promise(r => setTimeout(r, 4000));
```

待ち時間の目安：
| コンテンツ種別 | 推奨待ち時間 |
|---------------|-------------|
| テキスト・テーブルのみ | 1500ms |
| 単純なチャート | 3000ms |
| 複雑なチャート + 地図 | 4000-6000ms |
| タブ切り替え後 | 1500ms |

---

### 課題5: `headless: true` vs `headless: 'new'`

**症状**: 古いヘッドレスモード（`headless: true`）ではSVGの描画に問題が出ることがある。

**解決策**: 新しいヘッドレスモード（`headless: 'new'`）を使用する。Chromium 112以降で利用可能。完全なChromiumレンダリングパイプラインを使用するため、描画の互換性が向上する。

```typescript
const browser = await puppeteer.launch({
  headless: 'new',  // 'true' ではなく 'new' を指定
  // ...
});
```

---

## 5. 完全な撮影フロー（推奨パターン）

```typescript
async function captureFullPage(page: Page, url: string, outputPath: string) {
  // Step 1: 大きなビューポートでページをロード
  await page.setViewport({ width: VP_W, height: 2500 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 4000));

  // Step 2: overflow解除して実際のコンテンツ高さを計測
  const height = await measureContentHeight(page);

  // Step 3: ビューポートをコンテンツ高さに設定
  await page.setViewport({ width: VP_W, height: height });

  // Step 4: リサイズイベント発火（チャート再描画）
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await new Promise(r => setTimeout(r, 3000));

  // Step 5: SVG clipPath除去
  await removeClipPaths(page);
  await new Promise(r => setTimeout(r, 500));

  // Step 6: 撮影（fullPage: false）
  await page.screenshot({ path: outputPath, fullPage: false });
}
```

### タブ切り替え時のフロー

```typescript
async function captureTab(page: Page, tabSelector: string, outputPath: string) {
  // Step 1: Puppeteerネイティブのclickでタブ切り替え
  await page.click(tabSelector);
  await new Promise(r => setTimeout(r, 1500));

  // Step 2-6: 上記と同じ計測→撮影フロー
  const height = await measureContentHeight(page);
  await page.setViewport({ width: VP_W, height: height });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await new Promise(r => setTimeout(r, 2500));
  await removeClipPaths(page);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: outputPath, fullPage: false });
}
```

---

## 6. ロール切り替え（複数ロールのアプリ向け）

localStorageでロールを管理しているアプリの場合：

```typescript
async function setRole(page: Page, role: string) {
  await page.evaluate((r: string) => {
    localStorage.setItem('app-role-key', JSON.stringify({
      state: { role: r },
      version: 0
    }));
  }, role);
}

// 使い方
await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
await setRole(page, 'ADMIN');
// この後のページ遷移からロールが反映される
```

---

## 7. バッチ実行とタイムアウト対策

Replit環境のbashコマンドには2分（120秒）のタイムアウト制限があります。全画面を一括で撮ろうとするとタイムアウトする場合があるため、バッチに分割して実行します。

```typescript
// バッチごとにブラウザを起動・終了する
async function runBatch(name: string, fn: () => Promise<void>) {
  console.log(`=== ${name} ===`);
  await fn();
}

await runBatch('Batch 1: Dashboard pages', async () => { /* ... */ });
await runBatch('Batch 2: Detail pages', async () => { /* ... */ });
```

実行コマンド：
```bash
npx tsx scripts/take-screenshots.ts
```

---

## 8. 結果検証（マニフェスト照合）

撮影漏れを防ぐため、期待するファイル名のリストと照合します。

```typescript
const EXPECTED_FILES = [
  'page1.png',
  'page2.png',
  // ...
];

const existing = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
const missing = EXPECTED_FILES.filter(name => !existing.includes(name));

if (missing.length > 0) {
  console.error(`MISSING ${missing.length} screenshots:`);
  missing.forEach(m => console.error(`  - ${m}`));
  process.exit(1);
}
console.log(`All ${EXPECTED_FILES.length} screenshots verified.`);
```

---

## 9. チェックリスト

新しいプロジェクトでスクリーンショットを撮る前に確認してください。

- [ ] Chromiumのパスを確認した
- [ ] `puppeteer-core` をインストールした
- [ ] `headless: 'new'` を指定している
- [ ] ビューポートを十分な高さ（2500px程度）で初期ロードしている
- [ ] `overflow-hidden` の解除ロジックを入れている
- [ ] `clipPath` 除去ロジックを入れている
- [ ] `fullPage: false` で撮影している
- [ ] Radix UI等のタブは `page.click()` を使っている
- [ ] チャート描画の待ち時間を十分に取っている（3-4秒）
- [ ] 期待ファイルのマニフェスト照合を入れている
