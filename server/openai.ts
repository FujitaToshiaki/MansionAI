import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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