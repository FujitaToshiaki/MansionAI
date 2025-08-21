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
}`;

    const contents = [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      "この議事録画像からテキストを正確に抽出してください。手書き部分も含めて全て読み取り、JSONフォーマットで返してください。"
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
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
      },
      contents: contents,
    });

    const rawJson = response.text;
    console.log(`Gemini OCR Raw JSON: ${rawJson}`);

    if (rawJson) {
      const result: OCRResult = JSON.parse(rawJson);
      return {
        text: result.text || '',
        accuracy: Math.max(80, Math.min(100, result.accuracy || 90)),
        lowConfidenceRegions: result.lowConfidenceRegions || []
      };
    } else {
      throw new Error("Empty response from Gemini model");
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