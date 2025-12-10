"""Document chunking utilities for RAG."""

from typing import List, Optional
import re


class DocumentChunker:
    """Chunker for splitting documents into smaller pieces for RAG.
    
    Uses the same chunking parameters as the original knowledgeService.ts:
    - CHUNK_SIZE = 2000
    - CHUNK_OVERLAP = 400
    """

    def __init__(self, chunk_size: int = 2000, chunk_overlap: int = 400):
        """Initialize chunker with size and overlap parameters.
        
        Args:
            chunk_size: Maximum size of each chunk in characters
            chunk_overlap: Number of overlapping characters between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, content: str) -> List[str]:
        """Split document content into chunks.
        
        Args:
            content: Full document text
            
        Returns:
            List of text chunks
        """
        if not content:
            return []
        
        # Clean content
        content = self._clean_content(content)
        
        # If content is smaller than chunk size, return as single chunk
        if len(content) <= self.chunk_size:
            return [content]
        
        chunks = []
        start = 0
        
        while start < len(content):
            # Calculate end position
            end = start + self.chunk_size
            
            # If this is not the last chunk, try to find a good break point
            if end < len(content):
                # Try to break at paragraph boundary
                paragraph_break = content.rfind("\n\n", start, end)
                if paragraph_break > start + self.chunk_size // 2:
                    end = paragraph_break + 2
                else:
                    # Try to break at sentence boundary
                    sentence_break = self._find_sentence_break(content, start, end)
                    if sentence_break > start + self.chunk_size // 2:
                        end = sentence_break
                    else:
                        # Try to break at word boundary
                        word_break = content.rfind(" ", start, end)
                        if word_break > start + self.chunk_size // 2:
                            end = word_break + 1
            
            # Extract chunk
            chunk = content[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.chunk_overlap
            
            # Ensure we make progress
            if start <= chunks[-1] if chunks else 0:
                start = end
        
        return chunks

    def _clean_content(self, content: str) -> str:
        """Clean document content.
        
        Args:
            content: Raw document text
            
        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = re.sub(r' {2,}', ' ', content)
        
        # Normalize line endings
        content = content.replace('\r\n', '\n')
        content = content.replace('\r', '\n')
        
        return content.strip()

    def _find_sentence_break(self, content: str, start: int, end: int) -> int:
        """Find a good sentence break point.
        
        Args:
            content: Full document text
            start: Start position
            end: End position
            
        Returns:
            Position of sentence break, or start if not found
        """
        # Japanese sentence endings
        japanese_endings = ['。', '！', '？', '」', '』']
        
        # English sentence endings
        english_endings = ['. ', '! ', '? ']
        
        best_break = start
        
        # Search backwards from end
        for i in range(end - 1, start + self.chunk_size // 2, -1):
            char = content[i]
            
            # Check Japanese endings
            if char in japanese_endings:
                best_break = i + 1
                break
            
            # Check English endings
            if i < len(content) - 1:
                two_char = content[i:i+2]
                if two_char in english_endings:
                    best_break = i + 2
                    break
        
        return best_break

    def chunk_with_metadata(
        self, content: str, document_id: str, document_title: str
    ) -> List[dict]:
        """Split document and include metadata with each chunk.
        
        Args:
            content: Full document text
            document_id: ID of the source document
            document_title: Title of the source document
            
        Returns:
            List of chunk dictionaries with content and metadata
        """
        chunks = self.chunk_document(content)
        
        return [
            {
                "content": chunk,
                "chunk_index": i,
                "metadata": {
                    "document_id": document_id,
                    "document_title": document_title,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "chunk_size": len(chunk)
                }
            }
            for i, chunk in enumerate(chunks)
        ]


class RecursiveChunker(DocumentChunker):
    """Recursive character text splitter similar to LangChain's implementation."""

    def __init__(
        self,
        chunk_size: int = 2000,
        chunk_overlap: int = 400,
        separators: Optional[List[str]] = None
    ):
        """Initialize recursive chunker.
        
        Args:
            chunk_size: Maximum size of each chunk
            chunk_overlap: Number of overlapping characters
            separators: List of separators to try, in order of preference
        """
        super().__init__(chunk_size, chunk_overlap)
        
        self.separators = separators or [
            "\n\n",  # Paragraph
            "\n",    # Line
            "。",    # Japanese period
            ".",     # English period
            " ",     # Space
            ""       # Character
        ]

    def chunk_document(self, content: str) -> List[str]:
        """Split document using recursive approach.
        
        Args:
            content: Full document text
            
        Returns:
            List of text chunks
        """
        return self._split_text(content, self.separators)

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        """Recursively split text using separators.
        
        Args:
            text: Text to split
            separators: List of separators to try
            
        Returns:
            List of text chunks
        """
        final_chunks = []
        
        # Get the appropriate separator
        separator = separators[-1]
        new_separators = []
        
        for i, sep in enumerate(separators):
            if sep == "":
                separator = sep
                break
            if sep in text:
                separator = sep
                new_separators = separators[i + 1:]
                break
        
        # Split by separator
        if separator:
            splits = text.split(separator)
        else:
            splits = list(text)
        
        # Process splits
        good_splits = []
        
        for split in splits:
            if len(split) < self.chunk_size:
                good_splits.append(split)
            else:
                # Recursively split large chunks
                if good_splits:
                    merged = self._merge_splits(good_splits, separator)
                    final_chunks.extend(merged)
                    good_splits = []
                
                if new_separators:
                    other_chunks = self._split_text(split, new_separators)
                    final_chunks.extend(other_chunks)
                else:
                    final_chunks.append(split)
        
        # Merge remaining good splits
        if good_splits:
            merged = self._merge_splits(good_splits, separator)
            final_chunks.extend(merged)
        
        return final_chunks

    def _merge_splits(self, splits: List[str], separator: str) -> List[str]:
        """Merge small splits into larger chunks.
        
        Args:
            splits: List of text splits
            separator: Separator to use when joining
            
        Returns:
            List of merged chunks
        """
        merged = []
        current_chunk = []
        current_length = 0
        
        for split in splits:
            split_length = len(split)
            
            if current_length + split_length + len(separator) > self.chunk_size:
                if current_chunk:
                    merged.append(separator.join(current_chunk))
                
                # Handle overlap
                while current_length > self.chunk_overlap:
                    if current_chunk:
                        current_chunk.pop(0)
                        current_length = sum(len(s) for s in current_chunk)
                        current_length += len(separator) * (len(current_chunk) - 1)
                    else:
                        break
            
            current_chunk.append(split)
            current_length += split_length + len(separator)
        
        if current_chunk:
            merged.append(separator.join(current_chunk))
        
        return merged
