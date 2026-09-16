import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const REALTIME_SESSION_INSTRUCTIONS = `あなたはマンション管理の相談受付担当です。これはクレームに限らない「報告」の聞き取りです。
最初に、報告を受け付けることを伝え、何が起きたのかを尋ねてください。
利用者の話を責めたり評価したりせず、事実と利用者の認識を区別してください。
何が起きたか、いつ、どこで、どのくらいの頻度で、影響は何かを確認し、原因については「分かっていること」と「推測」を区別して確認してください。
質問は一度に一つだけ、短く日本語で尋ねてください。利用者が答えた内容を言い換えて確認しても構いません。
曖昧な回答には具体的な確認質問をしてください。すでに回答された項目を繰り返さず、回答に応じて次の質問を選んでください。
例えば騒音の報告なら、最初から騒音と決めつけず、申告された後に「どんな音ですか」「いつから、どの時間帯ですか」「発生場所は確認できていますか」「その原因だと思う根拠はありますか」「生活にどんな影響がありますか」「これまでの対応と希望する対応は何ですか」を必要に応じ一問ずつ尋ねてください。原因が不明なら不明として扱い、相手の責任を断定しないでください。
危険や被害の訴えは安全確認を優先してください。情報が揃ったら事実・推測・未確認点・要望を短く読み上げて訂正を尋ね、「会話を終了」後に画面で確認し、登録ボタンを押すまで保存されないことを案内してください。
情報を推測して補完したり、報告を登録・保存したり、対応を実行したりしてはいけません。聞き取りが終わったら、利用者が明示的に終了するまで追加の質問を続けないでください。`;

export async function createRealtimeConsultationCall(sdp: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const session = {
    type: "realtime",
    model: "gpt-realtime",
    instructions: REALTIME_SESSION_INSTRUCTIONS,
    audio: {
      input: {
        format: { type: "audio/pcm", rate: 24000 },
        transcription: {
          model: "gpt-4o-mini-transcribe",
          language: "ja",
          prompt: "マンション管理に関する報告の聞き取りです。利用者の発言を日本語で正確に文字起こししてください。",
        },
        noise_reduction: { type: "near_field" },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
          create_response: true,
          interrupt_response: true,
        },
      },
      output: {
        format: { type: "audio/pcm", rate: 24000 },
        voice: "marin",
      },
    },
  };

  const formData = new FormData();
  formData.set("sdp", sdp);
  formData.set("session", JSON.stringify(session));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Realtime API session creation timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.text();
  if (!response.ok) {
    console.error("Realtime API session error:", response.status, body);
    throw new Error(`Realtime API session creation failed (${response.status})`);
  }

  return body;
}

// Kept as an alias for callers that used the former transcription-only helper.
export const createRealtimeTranscriptionCall = createRealtimeConsultationCall;

export interface ConsultationTranscriptTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ConsultationReportDraft {
  category: string;
  title: string;
  facts: string;
  reportedCause: string;
  unknowns: string;
  request: string;
  action: string;
  priority: "high" | "medium" | "low";
}

const CONSULTATION_CATEGORIES = new Set([
  "報告",
  "クレーム",
  "設備",
  "その他",
  "法令解釈",
  "運用判断",
]);

function nonEmptyDraftText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function generateConsultationReportDraft(
  transcript: ConsultationTranscriptTurn[],
): Promise<ConsultationReportDraft> {
  const openai = getOpenAIClient();
  const transcriptText = transcript
    .map((turn) => `${turn.role === "user" ? "利用者" : "AI"}: ${turn.content.trim()}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `あなたはマンション管理の報告整理担当です。音声面談の全文から、利用者が明示した内容だけを整理して報告書の下書きを作成してください。
推測、一般論、AIの質問内容を事実として追加してはいけません。原因は利用者がそう述べた場合だけ「申告された原因」に入れ、確定していない場合はその不確実さを残してください。分からない項目は「未確認」と明記してください。
category は次のいずれか一つだけにしてください: 報告, クレーム, 設備, その他, 法令解釈, 運用判断。判断できない場合は報告にしてください。
facts は何が起きたか・いつ・どこ・頻度・影響のうち、会話で確認できた事実を記載します。
reportedCause は利用者が述べた原因や、原因についての本人の推測を区別して記載します。
unknowns は未確認点や会話で確定できなかった点を記載します。
request は利用者の要望だけを記載し、action は利用者が求めた対応・次の行動だけを記載します。対応を自動実行したり、存在しない情報を補ったりしません。
必ず次のJSONオブジェクトだけを返してください:
{"category":"報告","title":"短い件名","facts":"...","reportedCause":"...","unknowns":"...","request":"...","action":"...","priority":"medium"}`,
      },
      {
        role: "user",
        content: `以下が面談の全文です。利用者とAIの発言を区別して、編集可能な下書きを作成してください。\n\n${transcriptText}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1600,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("報告書の下書きが生成されませんでした");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("報告書の下書きの形式が不正です");
  }

  const category = nonEmptyDraftText(parsed.category, "報告");
  return {
    category: CONSULTATION_CATEGORIES.has(category) ? category : "報告",
    title: nonEmptyDraftText(parsed.title, "音声相談の報告"),
    facts: nonEmptyDraftText(parsed.facts, "未確認"),
    reportedCause: nonEmptyDraftText(parsed.reportedCause, "未確認"),
    unknowns: nonEmptyDraftText(parsed.unknowns, "未確認"),
    request: nonEmptyDraftText(parsed.request, "未確認"),
    action: nonEmptyDraftText(parsed.action, "未確認"),
    priority: parsed.priority === "high" || parsed.priority === "low" ? parsed.priority : "medium",
  };
}

export interface OCRResult {
  text: string;
  accuracy: number;
  lowConfidenceRegions: Array<{
    text: string;
    confidence: number;
    coordinates: { x: number; y: number; width: number; height: number };
  }>;
}

export async function extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<OCRResult> {
  try {
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたは日本語の議事録OCRシステムです。画像から正確にテキストを抽出してください。

要求事項:
1. 画像中のすべてのテキストを正確に抽出
2. 手書き文字も含めて読み取り
3. レイアウトや改行を保持
4. 日付、時刻、名前、議題などを正確に識別
5. 読み取り困難な箇所は[?]で表記

JSONフォーマットで以下を返してください:
{
  "text": "抽出されたテキスト全文",
  "accuracy": 95,
  "lowConfidenceRegions": [
    {
      "text": "読み取り困難なテキスト",
      "confidence": 70,
      "coordinates": {"x": 100, "y": 200, "width": 50, "height": 20}
    }
  ]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この議事録画像からテキストを正確に抽出してください。手書き部分も含めて全て読み取ってください。"
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      text: result.text || '',
      accuracy: Math.max(70, Math.min(100, result.accuracy || 85)),
      lowConfidenceRegions: result.lowConfidenceRegions || []
    };

  } catch (error) {
    console.error('OpenAI OCR error:', error);
    throw new Error('OCR処理中にエラーが発生しました: ' + (error as Error).message);
  }
}

export interface GenerateMinutesInput {
  meetingType: string;
  meetingDate: string;
  location: string;
  participants: string;
  notes: string;
}

export async function generateMinutes(input: GenerateMinutesInput): Promise<string> {
  const { meetingType, meetingDate, location, participants, notes } = input;

  const systemPrompt = `あなたはマンション管理のプロフェッショナルです。提供された会議情報・メモをもとに、正式なマンション管理用の議事録を作成してください。

議事録のフォーマット:
- タイトル（会議種別と回次を含む）
- 日時・場所・出席者
- 議題一覧
- 審議内容（各議題の詳細な内容）
- 決定事項（番号付きリスト）
- 次回予定

要件:
- 丁寧で正式な日本語を使用する
- メモの内容を整理・補完して読みやすい形式にする
- 決定事項は明確に記載する
- 出席者情報はそのまま使用する`;

  const userPrompt = `以下の情報をもとに正式な議事録を作成してください。

【会議種別】${meetingType}
【開催日】${meetingDate}
【開催場所】${location}
【出席者】${participants || "記録なし"}

【会議メモ】
${notes || "メモなし"}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
  });

  return response.choices[0].message.content ?? "";
}

export async function transcribeAudio(fileBuffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const openai = getOpenAIClient();

  const file = await OpenAI.toFile(fileBuffer, filename, { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "ja",
    response_format: "text",
  });

  if (typeof transcription !== "string") {
    throw new Error("Whisper API から予期しない形式のレスポンスが返されました");
  }
  return transcription;
}

export async function extractTextFromMultipleImages(imageBuffers: Array<{buffer: Buffer, mimeType: string}>): Promise<OCRResult[]> {
  const results: OCRResult[] = [];
  
  for (let i = 0; i < imageBuffers.length; i++) {
    try {
      const result = await extractTextFromImage(imageBuffers[i].buffer, imageBuffers[i].mimeType);
      results.push(result);
      
      // Add a small delay to avoid rate limiting
      if (i < imageBuffers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      // Provide fallback result for failed OCR
      results.push({
        text: `[OCR処理エラー: ページ ${i + 1}]`,
        accuracy: 0,
        lowConfidenceRegions: []
      });
    }
  }
  
  return results;
}