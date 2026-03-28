import puppeteer, { Page, Browser } from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROMIUM_PATH = '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome';
const BASE_URL = 'http://0.0.0.0:5000';
const OUTPUT_DIR = path.resolve('docs/screenshots');
const VP_W = 1500;
const CONDO_ID = 'a7af9126-67ff-47d9-9c24-cf4054aeb63c';

const BATCH = parseInt(process.argv[2] ?? '1', 10);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: 'new' as any,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

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

async function capturePage(page: Page, url: string, filePath: string, waitMs = 3000) {
  console.log(`  → ${url}`);
  await page.setViewport({ width: VP_W, height: 2500 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, waitMs));

  const h = await measureContentHeight(page);
  await page.setViewport({ width: VP_W, height: h });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await new Promise(r => setTimeout(r, 2500));
  await removeClipPaths(page);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✓ saved: ${path.basename(filePath)}`);
}

async function captureTab(page: Page, tabValue: string, filePath: string) {
  try {
    await page.click(`[data-value="${tabValue}"], button[value="${tabValue}"]`);
  } catch {
    await page.evaluate((v) => {
      const btn = [...document.querySelectorAll('[role="tab"]')]
        .find(el => el.getAttribute('data-value') === v || el.textContent?.trim().includes(v));
      (btn as HTMLElement | undefined)?.click();
    }, tabValue);
  }
  await new Promise(r => setTimeout(r, 1500));

  const h = await measureContentHeight(page);
  await page.setViewport({ width: VP_W, height: h });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await new Promise(r => setTimeout(r, 2500));
  await removeClipPaths(page);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✓ tab [${tabValue}]: ${path.basename(filePath)}`);
}

function out(name: string) {
  return path.join(OUTPUT_DIR, `${name}.png`);
}

async function batch1(browser: Browser) {
  console.log('\n=== Batch 1: マンション一覧 + 物件詳細 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/condominiums`, out('01_condominium_list'));

  await capturePage(page, `${BASE_URL}/condominiums/${CONDO_ID}`, out('02_condominium_detail_basic'));

  await captureTab(page, 'members', out('03_condominium_detail_members'));
  await captureTab(page, 'committees', out('04_condominium_detail_committees'));
  await captureTab(page, 'notes', out('05_condominium_detail_notes'));
  await captureTab(page, 'files', out('06_condominium_detail_files'));

  await page.close();
}

async function batch2(browser: Browser) {
  console.log('\n=== Batch 2: 問合せ管理 + 議案管理 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/consultation/chat?condominiumId=${CONDO_ID}`, out('07_consultation_chat'));
  await capturePage(page, `${BASE_URL}/consultation/history?condominiumId=${CONDO_ID}`, out('08_consultation_history'));

  await capturePage(page, `${BASE_URL}/proposals/list?condominiumId=${CONDO_ID}`, out('09_proposals_list'));
  await capturePage(page, `${BASE_URL}/proposals/generate?condominiumId=${CONDO_ID}`, out('10_proposals_generate'));
  await capturePage(page, `${BASE_URL}/proposals/edit?condominiumId=${CONDO_ID}`, out('11_proposals_edit'));

  await page.close();
}

async function batch3(browser: Browser) {
  console.log('\n=== Batch 3: 議事録管理 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/minutes/list?condominiumId=${CONDO_ID}`, out('12_minutes_list'));
  await capturePage(page, `${BASE_URL}/minutes/import?condominiumId=${CONDO_ID}`, out('13_minutes_import'));
  await capturePage(page, `${BASE_URL}/minutes/generate?condominiumId=${CONDO_ID}`, out('14_minutes_generate'));
  await capturePage(page, `${BASE_URL}/minutes/actions?condominiumId=${CONDO_ID}`, out('15_minutes_actions'));

  await page.close();
}

async function batch4(browser: Browser) {
  console.log('\n=== Batch 4: 長期修繕計画管理 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/longterm/dashboard?condominiumId=${CONDO_ID}`, out('16_longterm_dashboard'), 4000);
  await capturePage(page, `${BASE_URL}/longterm/items?condominiumId=${CONDO_ID}`, out('17_longterm_items'));
  await capturePage(page, `${BASE_URL}/longterm/history?condominiumId=${CONDO_ID}`, out('18_longterm_history'));
  await capturePage(page, `${BASE_URL}/longterm/simulation?condominiumId=${CONDO_ID}`, out('19_longterm_simulation'), 4000);
  await capturePage(page, `${BASE_URL}/longterm/analysis?condominiumId=${CONDO_ID}`, out('20_longterm_analysis'), 4000);

  await page.close();
}

async function batch5(browser: Browser) {
  console.log('\n=== Batch 5: 規約改訂 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/condominiums/${CONDO_ID}/regulation-analysis`, out('21_regulation_analysis'));
  await capturePage(page, `${BASE_URL}/condominiums/${CONDO_ID}/ai-revision`, out('22_ai_revision'));
  await capturePage(page, `${BASE_URL}/condominiums/${CONDO_ID}/knowledge`, out('23_knowledge_base'));
  await capturePage(page, `${BASE_URL}/condominiums/${CONDO_ID}/wiki`, out('24_regulation_wiki'));
  await capturePage(page, `${BASE_URL}/revision-years?condominiumId=${CONDO_ID}`, out('25_revision_years'));

  await page.close();
}

async function batch6(browser: Browser) {
  console.log('\n=== Batch 6: 管理適正評価 ===');
  const page = await browser.newPage();

  await capturePage(page, `${BASE_URL}/evaluation/check?condominiumId=${CONDO_ID}`, out('26_evaluation_check'));
  await capturePage(page, `${BASE_URL}/evaluation/score?condominiumId=${CONDO_ID}`, out('27_evaluation_score'));
  await capturePage(page, `${BASE_URL}/evaluation/history?condominiumId=${CONDO_ID}`, out('28_evaluation_history'));

  await page.close();
}

const BATCHES: Record<number, (b: Browser) => Promise<void>> = {
  1: batch1,
  2: batch2,
  3: batch3,
  4: batch4,
  5: batch5,
  6: batch6,
};

(async () => {
  const fn = BATCHES[BATCH];
  if (!fn) {
    console.error(`Invalid batch number: ${BATCH}. Use 1-6.`);
    process.exit(1);
  }

  const browser = await launchBrowser();
  try {
    await fn(browser);
    console.log(`\nBatch ${BATCH} complete.`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
