"""Knowledge search utilities."""

from typing import List, Dict, Any
import re


class KnowledgeSearcher:
    """Searcher for knowledge base queries.
    
    Currently implements text-based search.
    Vector search with embeddings can be added later.
    """

    def __init__(self):
        """Initialize searcher."""
        pass

    def search_text(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search documents using text matching.
        
        Args:
            query: Search query
            documents: List of document dictionaries
            limit: Maximum number of results
            
        Returns:
            List of matching documents with scores
        """
        results = []
        query_lower = query.lower()
        query_terms = self._tokenize(query)
        
        for doc in documents:
            content = doc.get("content", "")
            title = doc.get("title", "")
            
            # Calculate relevance score
            score = self._calculate_relevance(
                query_lower, query_terms, content, title
            )
            
            if score > 0:
                results.append({
                    **doc,
                    "score": score
                })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return results[:limit]

    def search_chunks(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search chunks using text matching.
        
        Args:
            query: Search query
            chunks: List of chunk dictionaries
            limit: Maximum number of results
            
        Returns:
            List of matching chunks with scores
        """
        results = []
        query_lower = query.lower()
        query_terms = self._tokenize(query)
        
        for chunk in chunks:
            content = chunk.get("content", "")
            
            # Calculate relevance score
            score = self._calculate_chunk_relevance(
                query_lower, query_terms, content
            )
            
            if score > 0:
                results.append({
                    **chunk,
                    "score": score,
                    "highlight": self._highlight_matches(content, query_terms)
                })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return results[:limit]

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into terms.
        
        Args:
            text: Text to tokenize
            
        Returns:
            List of terms
        """
        # Simple tokenization for Japanese and English
        # Remove punctuation and split on whitespace
        text = re.sub(r'[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]', ' ', text)
        terms = text.lower().split()
        
        # Also extract Japanese character sequences
        japanese_pattern = r'[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]+'
        japanese_terms = re.findall(japanese_pattern, text)
        
        return list(set(terms + japanese_terms))

    def _calculate_relevance(
        self,
        query_lower: str,
        query_terms: List[str],
        content: str,
        title: str
    ) -> float:
        """Calculate relevance score for a document.
        
        Args:
            query_lower: Lowercase query string
            query_terms: Tokenized query terms
            content: Document content
            title: Document title
            
        Returns:
            Relevance score
        """
        score = 0.0
        content_lower = content.lower()
        title_lower = title.lower()
        
        # Exact match in title (highest weight)
        if query_lower in title_lower:
            score += 10.0
        
        # Exact match in content
        if query_lower in content_lower:
            score += 5.0
        
        # Term matches
        for term in query_terms:
            if term in title_lower:
                score += 3.0
            
            # Count occurrences in content
            count = content_lower.count(term)
            score += min(count * 0.5, 5.0)  # Cap at 5 points per term
        
        return score

    def _calculate_chunk_relevance(
        self,
        query_lower: str,
        query_terms: List[str],
        content: str
    ) -> float:
        """Calculate relevance score for a chunk.
        
        Args:
            query_lower: Lowercase query string
            query_terms: Tokenized query terms
            content: Chunk content
            
        Returns:
            Relevance score
        """
        score = 0.0
        content_lower = content.lower()
        
        # Exact match
        if query_lower in content_lower:
            score += 5.0
        
        # Term matches
        for term in query_terms:
            count = content_lower.count(term)
            score += min(count * 1.0, 5.0)
        
        # Proximity bonus: terms appearing close together
        if len(query_terms) > 1:
            proximity_score = self._calculate_proximity(content_lower, query_terms)
            score += proximity_score
        
        return score

    def _calculate_proximity(
        self,
        content: str,
        terms: List[str],
        window_size: int = 100
    ) -> float:
        """Calculate proximity score for terms appearing close together.
        
        Args:
            content: Text content
            terms: List of search terms
            window_size: Character window to check for proximity
            
        Returns:
            Proximity score
        """
        score = 0.0
        
        for i, term in enumerate(terms):
            pos = content.find(term)
            while pos != -1:
                # Check if other terms appear within window
                window_start = max(0, pos - window_size)
                window_end = min(len(content), pos + len(term) + window_size)
                window = content[window_start:window_end]
                
                for other_term in terms[i+1:]:
                    if other_term in window:
                        score += 1.0
                
                pos = content.find(term, pos + 1)
        
        return min(score, 5.0)  # Cap proximity bonus

    def _highlight_matches(
        self,
        content: str,
        terms: List[str],
        context_size: int = 50
    ) -> str:
        """Create highlighted excerpt showing matches.
        
        Args:
            content: Full content
            terms: Search terms to highlight
            context_size: Characters of context around matches
            
        Returns:
            Highlighted excerpt
        """
        content_lower = content.lower()
        highlights = []
        
        for term in terms:
            pos = content_lower.find(term)
            if pos != -1:
                start = max(0, pos - context_size)
                end = min(len(content), pos + len(term) + context_size)
                
                excerpt = content[start:end]
                if start > 0:
                    excerpt = "..." + excerpt
                if end < len(content):
                    excerpt = excerpt + "..."
                
                highlights.append(excerpt)
        
        return " | ".join(highlights[:3]) if highlights else content[:200]
