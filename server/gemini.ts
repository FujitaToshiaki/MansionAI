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
      model: "gemini-2.5-pro",
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

    if (!rawJson || rawJson.trim() === '') {
      console.error('Empty response from Gemini model, retrying with simpler prompt...');
      
      // Retry with a simpler prompt for difficult images
      const simpleResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          "この画像に含まれるすべてのテキストを正確に読み取って、そのまま文字として出力してください。"
        ],
      });

      const simpleText = simpleResponse.text || '';
      return {
        text: simpleText,
        accuracy: simpleText ? 85 : 0,
        lowConfidenceRegions: []
      };
    }

    try {
      const result: OCRResult = JSON.parse(rawJson);
      return {
        text: result.text || '',
        accuracy: Math.max(80, Math.min(100, result.accuracy || 90)),
        lowConfidenceRegions: result.lowConfidenceRegions || []
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response, using raw text:', parseError);
      // If JSON parsing fails, use the raw response as text
      return {
        text: rawJson,
        accuracy: 75,
        lowConfidenceRegions: []
      };
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing image ${i + 1} with Gemini:`, error);
      
      // Try a simple retry for failed images
      try {
        console.log(`Retrying image ${i + 1} with basic OCR...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer before retry
        
        const retryResult = await extractTextFromImage(imageBuffers[i].buffer, imageBuffers[i].mimeType);
        results.push(retryResult);
      } catch (retryError) {
        console.error(`Retry failed for image ${i + 1}:`, retryError);
        // Provide fallback result for failed OCR
        results.push({
          text: `[画像 ${i + 1}: OCR処理に失敗しました。手動でテキストを入力してください]`,
          accuracy: 0,
          lowConfidenceRegions: []
        });
      }
    }
  }
  
  return results;
}