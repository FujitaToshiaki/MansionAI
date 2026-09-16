import puppeteer from '/home/runner/workspace/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/repl/tools/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`PASS: ${message}`);
};

async function installVoiceMocks(page) {
  await page.evaluateOnNewDocument(() => {
    const state = {
      sent: [],
      finalAudioRequests: 0,
      closingAudioRequests: 0,
      draftRequests: 0,
      saveRequests: 0,
      track: null,
      channel: null,
      closingShouldFail: new URL(location.href).searchParams.has('closingFailure'),
    };
    window.__voiceMock = state;

    const listeners = (target, type, handler) => {
      if (!target.__listeners) target.__listeners = new Map();
      const handlers = target.__listeners.get(type) ?? [];
      handlers.push(handler);
      target.__listeners.set(type, handlers);
    };
    const removeListener = (target, type, handler) => {
      const handlers = target.__listeners?.get(type) ?? [];
      target.__listeners?.set(type, handlers.filter((item) => item !== handler));
    };
    const emit = (target, type, event = {}) => {
      for (const handler of target.__listeners?.get(type) ?? []) handler(event);
    };

    class MockDataChannel {
      constructor() {
        this.readyState = 'open';
        this.__listeners = new Map();
        state.channel = this;
      }
      addEventListener(type, handler) { listeners(this, type, handler); }
      removeEventListener(type, handler) { removeListener(this, type, handler); }
      send(value) {
        state.sent.push(JSON.parse(value));
      }
      close() {
        this.readyState = 'closed';
        emit(this, 'close');
      }
    }

    class MockPeerConnection {
      constructor() {
        this.connectionState = 'connected';
        this.__listeners = new Map();
      }
      addEventListener(type, handler) { listeners(this, type, handler); }
      removeEventListener(type, handler) { removeListener(this, type, handler); }
      createDataChannel() {
        const channel = new MockDataChannel();
        setTimeout(() => emit(channel, 'open'), 0);
        return channel;
      }
      addTrack() {}
      async createOffer() { return { type: 'offer', sdp: 'v=0 mock-offer' }; }
      async setLocalDescription() {}
      async setRemoteDescription() {}
      close() { this.connectionState = 'closed'; }
    }

    window.RTCPeerConnection = MockPeerConnection;
    navigator.mediaDevices = navigator.mediaDevices ?? {};
    navigator.mediaDevices.getUserMedia = async () => {
      const track = {
        enabled: true,
        stopped: false,
        stop() {
          this.stopped = true;
        },
      };
      state.track = track;
      return { getTracks: () => [track] };
    };

    HTMLMediaElement.prototype.play = function () {
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {};
    HTMLMediaElement.prototype.load = function () {};
    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
      configurable: true,
      get() { return this.__mockSrc || ''; },
      set(value) { this.__mockSrc = value; },
    });

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/api/realtime/consultation-session')) {
        return new Response('v=0 mock-answer', {
          status: 200,
          headers: { 'content-type': 'application/sdp' },
        });
      }
      if (url.endsWith('/api/realtime/consultation-final-question')) {
        state.finalAudioRequests += 1;
        return new Response(new Blob(['mock-final-mp3'], { type: 'audio/mpeg' }), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' },
        });
      }
      if (url.endsWith('/api/realtime/consultation-closing')) {
        state.closingAudioRequests += 1;
        if (state.closingShouldFail) {
          return new Response(JSON.stringify({ error: 'mock closing audio failure' }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response(new Blob(['mock-closing-mp3'], { type: 'audio/mpeg' }), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' },
        });
      }
      if (url.endsWith('/api/consultation/report-draft')) {
        state.draftRequests += 1;
        return new Response(JSON.stringify({
          category: '報告',
          title: 'テスト報告',
          facts: '住民からの申告',
          reportedCause: '未確認',
          unknowns: 'なし',
          request: '対応を希望',
          action: '未確認',
          priority: 'medium',
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('/consultation-logs')) {
        state.saveRequests += 1;
        return new Response(JSON.stringify({ id: 'unexpected-save' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      }
      return originalFetch(input, init);
    };

    window.__emitVoiceEvent = (payload) => {
      if (!state.channel) throw new Error('data channel not ready');
      emit(state.channel, 'message', { data: JSON.stringify(payload) });
    };
    window.__endFinalQuestionAudio = () => {
      const audio = document.querySelectorAll('audio')[1];
      if (!audio?.onended) throw new Error('final audio onended handler not installed');
      audio.onended(new Event('ended'));
    };
    window.__endClosingAudio = () => {
      const audio = document.querySelectorAll('audio')[2];
      if (!audio?.onended) throw new Error('closing audio onended handler not installed');
      audio.onended(new Event('ended'));
    };
  });
}

async function emitTurn(page, id, transcript) {
  await page.evaluate((payload) => window.__emitVoiceEvent(payload), {
    type: 'conversation.item.input_audio_transcription.completed',
    item_id: id,
    transcript,
  });
  await delay(80);
}

async function runScenario({ closingFailure }) {
  const page = await browser.newPage();
  page.on('console', (message) => console.log(`[browser:${message.type()}] ${message.text()}`));
  page.on('pageerror', (error) => console.log(`[browser:error] ${error.message}`));

  try {
    const suffix = closingFailure ? '&closingFailure=1' : '';
    await installVoiceMocks(page);
    await page.goto(`http://127.0.0.1:5000/consultation/chat?condominiumId=browser-test${suffix}`, {
      waitUntil: 'networkidle0',
    });
    await page.waitForSelector('[data-testid="button-voice-report"]', { timeout: 15000 });
    await page.click('[data-testid="button-voice-report"]');
    await page.waitForFunction(() => window.__voiceMock.channel !== null, { timeout: 10000 });
    await delay(100);

    const initialSnapshot = await page.evaluate(() => ({
      responseCreates: window.__voiceMock.sent.filter((event) => event.type === 'response.create').length,
    }));
    assert(initialSnapshot.responseCreates === 1, `${closingFailure ? 'failure' : 'success'}: initial prompt uses one response.create`);

    await emitTurn(page, 'turn-1', '廊下で異音が発生しています');
    await emitTurn(page, 'turn-2', '毎晩二十二時ごろです');
    await emitTurn(page, 'turn-3', '三階付近で確認されています');
    await emitTurn(page, 'turn-4', '管理会社ではまだ原因を確認できていません');
    await page.waitForFunction(() => window.__voiceMock.finalAudioRequests === 1, { timeout: 5000 });

    const finalQuestionSnapshot = await page.evaluate(() => ({
      finalAudioRequests: window.__voiceMock.finalAudioRequests,
      trackEnabled: window.__voiceMock.track?.enabled,
      dialogCount: document.querySelectorAll('[role="dialog"]').length,
      fixedQuestionResponse: window.__voiceMock.sent.some((event) =>
        event.type === 'response.create' && JSON.stringify(event).includes('住民の方が希望する対応は何ですか？')),
    }));
    assert(finalQuestionSnapshot.finalAudioRequests === 1, `${closingFailure ? 'failure' : 'success'}: fixed final-question audio requested exactly once`);
    assert(!finalQuestionSnapshot.fixedQuestionResponse, `${closingFailure ? 'failure' : 'success'}: final question is not generated by Realtime`);
    assert(finalQuestionSnapshot.trackEnabled === false, `${closingFailure ? 'failure' : 'success'}: mic suspended during final-question playback`);
    assert(finalQuestionSnapshot.dialogCount === 0, `${closingFailure ? 'failure' : 'success'}: popup absent before final answer`);

    await page.evaluate(() => window.__endFinalQuestionAudio());
    await page.waitForFunction(() => document.body.innerText.includes('最後の回答をお待ちしています'), { timeout: 3000 });
    const awaitingSnapshot = await page.evaluate(() => ({
      trackEnabled: window.__voiceMock.track?.enabled,
      dialogCount: document.querySelectorAll('[role="dialog"]').length,
    }));
    assert(awaitingSnapshot.trackEnabled === true, `${closingFailure ? 'failure' : 'success'}: mic re-enabled after final question`);
    assert(awaitingSnapshot.dialogCount === 0, `${closingFailure ? 'failure' : 'success'}: popup absent while waiting for final answer`);

    await emitTurn(page, 'turn-final', '住民はまず原因を調査して、結果を文書で知らせてほしいです。急ぎではありません。');
    await page.waitForFunction(() => window.__voiceMock.draftRequests === 1, { timeout: 5000 });
    await page.waitForFunction(() => window.__voiceMock.closingAudioRequests === 1, { timeout: 5000 });

    const beforeClosingEnded = await page.evaluate(() => ({
      closingAudioRequests: window.__voiceMock.closingAudioRequests,
      micStopped: window.__voiceMock.track?.stopped,
      dialogCount: document.querySelectorAll('[role="dialog"]').length,
      saveRequests: window.__voiceMock.saveRequests,
    }));
    assert(beforeClosingEnded.closingAudioRequests === 1, `${closingFailure ? 'failure' : 'success'}: fixed closing audio requested once`);
    assert(beforeClosingEnded.micStopped === true, `${closingFailure ? 'failure' : 'success'}: mic stopped during closing audio`);
    assert(beforeClosingEnded.saveRequests === 0, `${closingFailure ? 'failure' : 'success'}: no save before closing audio completes`);
    if (!closingFailure) {
      assert(beforeClosingEnded.dialogCount === 0, 'success: popup absent before closing audio ended');
    }

    if (!closingFailure) {
      await page.evaluate(() => window.__endClosingAudio());
      await page.waitForFunction(() => document.querySelector('[role="dialog"]') !== null, { timeout: 5000 });
      const afterClosingEnded = await page.evaluate(() => ({
        dialogCount: document.querySelectorAll('[role="dialog"]').length,
        title: document.querySelector('[data-testid="input-report-title"]')?.value,
        warning: document.querySelector('[role="alert"]')?.textContent ?? '',
        saveRequests: window.__voiceMock.saveRequests,
      }));
      assert(afterClosingEnded.dialogCount === 1, 'success: popup present after closing audio ended');
      assert(afterClosingEnded.title === 'テスト報告', 'success: popup populated with returned draft');
      assert(!afterClosingEnded.warning, 'success: no closing warning shown');
      assert(afterClosingEnded.saveRequests === 0, 'success: no consultation log save before approval');
    } else {
      await page.waitForFunction(() => document.querySelector('[role="dialog"]') !== null, { timeout: 5000 });
      const failedClosingSnapshot = await page.evaluate(() => ({
        dialogCount: document.querySelectorAll('[role="dialog"]').length,
        title: document.querySelector('[data-testid="input-report-title"]')?.value,
        warning: document.querySelector('[role="alert"]')?.textContent ?? '',
        saveRequests: window.__voiceMock.saveRequests,
      }));
      assert(failedClosingSnapshot.dialogCount === 1, 'failure: popup present after closing audio failure');
      assert(failedClosingSnapshot.title === 'テスト報告', 'failure: draft preserved after closing audio failure');
      assert(failedClosingSnapshot.warning.includes('登録確認の音声を再生できませんでした'), 'failure: popup shows explicit closing warning');
      assert(failedClosingSnapshot.saveRequests === 0, 'failure: no consultation log save after closing audio failure');
    }
  } finally {
    await page.close();
  }
}

try {
  await runScenario({ closingFailure: false });
  await runScenario({ closingFailure: true });
  console.log('VOICE_REPORT_CLOSING_BROWSER_TEST: PASS');
} finally {
  await browser.close();
}