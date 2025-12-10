"""OCR processor for handling image processing and text extraction."""

from typing import Any, Dict, List

from .gemini_client import GeminiOCRClient


class OCRProcessor:
    """Processor for OCR operations using Gemini API."""

    def __init__(self, gemini_client: GeminiOCRClient):
        """Initialize OCR processor with Gemini client."""
        self.gemini_client = gemini_client

    async def process_image(
        self, image_data: bytes, mime_type: str
    ) -> Dict[str, Any]:
        """Process a single image for OCR.

        Args:
            image_data: Raw image bytes
            mime_type: MIME type of the image

        Returns:
            OCR result dictionary
        """
        return await self.gemini_client.extract_text_from_image(image_data, mime_type)

    async def process_multiple_images(
        self, images: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Process multiple images for OCR.

        Args:
            images: List of image data dictionaries

        Returns:
            List of OCR results
        """
        return await self.gemini_client.extract_text_from_multiple_images(images)

    def calculate_overall_accuracy(self, results: List[Dict[str, Any]]) -> float:
        """Calculate overall accuracy from multiple OCR results.

        Args:
            results: List of OCR result dictionaries

        Returns:
            Average accuracy score
        """
        if not results:
            return 0.0

        total_accuracy = sum(r.get("accuracy", 0) for r in results)
        return total_accuracy / len(results)

    def combine_text(
        self, results: List[Dict[str, Any]], separator: str = "\n\n--- ページ区切り ---\n\n"
    ) -> str:
        """Combine text from multiple OCR results.

        Args:
            results: List of OCR result dictionaries
            separator: Text separator between pages

        Returns:
            Combined text string
        """
        texts = [r.get("text", "") for r in results]
        return separator.join(texts)

    def get_all_low_confidence_regions(
        self, results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Get all low confidence regions from multiple results.

        Args:
            results: List of OCR result dictionaries

        Returns:
            List of all low confidence regions with page numbers
        """
        all_regions = []

        for i, result in enumerate(results):
            for region in result.get("low_confidence_regions", []):
                all_regions.append({
                    "page_number": i + 1,
                    **region
                })

        return all_regions
