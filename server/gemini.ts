import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

    const systemPrompt = `あなたは日本語議事録専門のOCRシステムです。画像から正確にテキストを抽出してください。

要求事項:
1. 画像中のすべてのテキストを正確に抽出
2. 手書き文字も含めて読み取り
3. 元の文書の空白、改行、インデントを完全に保持
4. 表形式やレイアウトの構造を維持
5. 日付、時刻、名前、議題などを正確に識別
6. 読み取り困難な箇所は[?]で表記
7. 空白文字（スペース、タブ）は元のまま保持

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
}`;

    const contents = [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      "この議事録画像からテキストを正確に抽出してください。元の文書の空白、改行、インデント、表形式を完全に保持し、手書き部分も含めて全て読み取り、JSONフォーマットで返してください。"
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: systemPrompt + "\n\n" + "この議事録画像からテキストを正確に抽出してください。元の文書の空白、改行、インデント、表形式を完全に保持し、手書き部分も含めて全て読み取り、JSONフォーマットで返してください。"
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            text: { type: "string" },
            accuracy: { type: "number" },
            lowConfidenceRegions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  confidence: { type: "number" },
                  coordinates: {
                    type: "object",
                    properties: {
                      x: { type: "number" },
                      y: { type: "number" },
                      width: { type: "number" },
                      height: { type: "number" }
                    },
                    required: ["x", "y", "width", "height"]
                  }
                },
                required: ["text", "confidence", "coordinates"]
              }
            }
          },
          required: ["text", "accuracy", "lowConfidenceRegions"]
        }
      }
    });

    const rawJson = response.text;
    console.log(`Gemini OCR Raw JSON: ${rawJson}`);

    if (!rawJson) {
      console.error('Empty response from Gemini');
      throw new Error("Empty response from Gemini model");
    }

    try {
      const result: OCRResult = JSON.parse(rawJson);
      return {
        text: result.text || '',
        accuracy: Math.max(80, Math.min(100, result.accuracy || 90)),
        lowConfidenceRegions: result.lowConfidenceRegions || []
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      console.error('Raw response was:', rawJson);
      
      // Fallback: try to extract text manually if JSON parsing fails
      if (rawJson.includes('"text"')) {
        const textMatch = rawJson.match(/"text":\s*"([^"]*(?:\\.[^"]*)*)"/);
        if (textMatch) {
          return {
            text: textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
            accuracy: 85,
            lowConfidenceRegions: []
          };
        }
      }
      
      throw new Error("Failed to parse Gemini response");
    }

  } catch (error) {
    console.error('Gemini OCR error:', error);
    throw new Error('OCR処理中にエラーが発生しました: ' + (error as Error).message);
  }
}

export async function extractTextFromMultipleImages(imageBuffers: Array<{buffer: Buffer, mimeType: string}>): Promise<OCRResult[]> {
  const results: OCRResult[] = [];
  
  for (let i = 0; i < imageBuffers.length; i++) {
    try {
      console.log(`Processing image ${i + 1}/${imageBuffers.length} with Gemini...`);
      const result = await extractTextFromImage(imageBuffers[i].buffer, imageBuffers[i].mimeType);
      results.push(result);
      
      // Add a small delay to avoid rate limiting
      if (i < imageBuffers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error processing image ${i + 1} with Gemini:`, error);
      // Provide fallback result for failed OCR
      results.push({
        text: `[Gemini OCR処理エラー: ページ ${i + 1}]`,
        accuracy: 0,
        lowConfidenceRegions: []
      });
    }
  }
  
  return results;
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

  const prompt = `あなたはマンション管理のプロフェッショナルです。提供された会議情報・メモをもとに、正式なマンション管理用の議事録を作成してください。

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
- 出席者情報はそのまま使用する

以下の情報をもとに正式な議事録を作成してください。

【会議種別】${meetingType}
【開催日】${meetingDate}
【開催場所】${location}
【出席者】${participants || "記録なし"}

【会議メモ】
${notes || "メモなし"}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text ?? "";
}