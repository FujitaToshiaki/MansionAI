"""Gemini API client for OCR processing."""

import base64
import json
from typing import Any, Dict, List

import google.generativeai as genai


class GeminiOCRClient:
    """Client for Gemini API OCR operations."""

    # System prompt for Japanese OCR (from original gemini.ts)
    SYSTEM_PROMPT = """あなたは日本語の議事録や文書を正確にOCR処理する専門家です。
以下の点に注意して画像からテキストを抽出してください：

1. 日本語テキストを正確に読み取る
2. 手書き文字も含めて認識する
3. 表形式のデータは構造を保持する
4. 元の文書のレイアウト（改行、インデント、空白）を可能な限り保持する
5. 読み取りにくい部分は低信頼度領域として報告する
6. 数字、日付、金額は特に正確に読み取る
7. 議事録特有の形式（議題番号、決議事項など）を認識する

出力はJSON形式で、以下の構造で返してください：
- text: 抽出されたテキスト全文
- accuracy: 全体の読み取り精度（0-100の数値）
- lowConfidenceRegions: 低信頼度領域の配列（各要素にtext, confidence, coordinatesを含む）"""

    def __init__(self, api_key: str):
        """Initialize Gemini client with API key."""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def extract_text_from_image(
        self, image_data: bytes, mime_type: str
    ) -> Dict[str, Any]:
        """Extract text from an image using Gemini Vision API.

        Args:
            image_data: Raw image bytes
            mime_type: MIME type of the image (e.g., 'image/jpeg')

        Returns:
            Dictionary containing:
                - text: Extracted text
                - accuracy: Confidence score (0-100)
                - low_confidence_regions: List of uncertain regions
        """
        try:
            # Encode image to base64
            base64_image = base64.b64encode(image_data).decode("utf-8")

            # Create the prompt
            prompt = (
                self.SYSTEM_PROMPT
                + "\n\n"
                + "この議事録画像からテキストを正確に抽出してください。"
                + "元の文書の空白、改行、インデント、表形式を完全に保持し、"
                + "手書き部分も含めて全て読み取り、JSONフォーマットで返してください。"
            )

            # Create image part
            image_part = {
                "inline_data": {
                    "data": base64_image,
                    "mime_type": mime_type,
                }
            }

            # Generate content
            response = self.model.generate_content(
                [image_part, prompt],
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema={
                        "type": "object",
                        "properties": {
                            "text": {"type": "string"},
                            "accuracy": {"type": "number"},
                            "lowConfidenceRegions": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "text": {"type": "string"},
                                        "confidence": {"type": "number"},
                                        "coordinates": {
                                            "type": "object",
                                            "properties": {
                                                "x": {"type": "number"},
                                                "y": {"type": "number"},
                                                "width": {"type": "number"},
                                                "height": {"type": "number"},
                                            },
                                            "required": ["x", "y", "width", "height"],
                                        },
                                    },
                                    "required": ["text", "confidence", "coordinates"],
                                },
                            },
                        },
                        "required": ["text", "accuracy", "lowConfidenceRegions"],
                    },
                ),
            )

            # Parse response
            result = json.loads(response.text)

            # Convert camelCase to snake_case for consistency
            return {
                "text": result.get("text", ""),
                "accuracy": result.get("accuracy", 0),
                "low_confidence_regions": [
                    {
                        "text": region.get("text", ""),
                        "confidence": region.get("confidence", 0),
                        "coordinates": region.get("coordinates", {}),
                    }
                    for region in result.get("lowConfidenceRegions", [])
                ],
            }

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            # Try to extract text from non-JSON response
            if hasattr(response, "text"):
                return {
                    "text": response.text,
                    "accuracy": 70,
                    "low_confidence_regions": [],
                }
            raise

        except Exception as e:
            print(f"Gemini API error: {e}")
            raise

    async def extract_text_from_multiple_images(
        self, images: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Extract text from multiple images.

        Args:
            images: List of dictionaries with 'data' (bytes) and 'mime_type' keys

        Returns:
            List of OCR results for each image
        """
        results = []

        for i, image in enumerate(images):
            try:
                print(f"Processing image {i + 1}/{len(images)} with Gemini...")
                result = await self.extract_text_from_image(
                    image["data"], image["mime_type"]
                )
                results.append(result)

                # Add delay to avoid rate limiting (if processing multiple images)
                if i < len(images) - 1:
                    import asyncio
                    await asyncio.sleep(0.5)

            except Exception as e:
                print(f"Error processing image {i + 1} with Gemini: {e}")
                results.append({
                    "text": f"[Gemini OCR処理エラー: ページ {i + 1}]",
                    "accuracy": 0,
                    "low_confidence_regions": [],
                })

        return results
