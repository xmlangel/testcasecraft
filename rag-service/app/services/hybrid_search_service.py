"""Hybrid Search Service combining Vector Search and BM25 Keyword Search"""
from typing import List, Dict, Any, Optional
import logging
from rank_bm25 import BM25Okapi
import numpy as np

logger = logging.getLogger(__name__)


class HybridSearchService:
    """
    Hybrid search combining vector similarity and BM25 keyword search

    Features:
    - Vector search: Semantic similarity using embeddings
    - BM25 search: Keyword-based statistical ranking
    - Reciprocal Rank Fusion (RRF): Combine results from both methods
    - Korean text optimization: Proper tokenization for Korean

    Benefits:
    - Better recall: Vector search captures semantic meaning
    - Better precision: BM25 captures exact keyword matches
    - Balanced results: RRF combines strengths of both approaches
    """

    def __init__(self):
        """Initialize hybrid search service"""
        self.bm25_index = None
        self.documents = []
        self.document_ids = []

        logger.info("HybridSearchService initialized")

    def tokenize_korean(self, text: str) -> List[str]:
        """
        Tokenize Korean text for BM25

        For production, consider using:
        - KoNLPy (Mecab, Okt, Komoran)
        - kiwipiepy (fast Korean morphological analyzer)

        For now, use simple whitespace + character tokenization
        """
        # Simple tokenization: split by whitespace and keep each character for Korean
        words = text.lower().split()

        # For Korean text, also split into characters to capture partial matches
        korean_chars = []
        for word in words:
            # Keep the word as-is
            korean_chars.append(word)

            # Also add individual characters for Korean words
            if any('\uac00' <= c <= '\ud7a3' for c in word):  # Korean character range
                korean_chars.extend(list(word))

        return korean_chars

    def tokenize_simple(self, text: str) -> List[str]:
        """Simple whitespace tokenization (fallback)"""
        return text.lower().split()

    def build_bm25_index(
        self,
        documents: List[Dict[str, Any]],
        text_field: str = "text",
        use_korean_tokenizer: bool = True
    ):
        """
        Build BM25 index from documents

        Args:
            documents: List of document dicts
            text_field: Field name containing text to index
            use_korean_tokenizer: Use Korean-aware tokenization
        """
        try:
            self.documents = documents
            self.document_ids = [doc.get("id", idx) for idx, doc in enumerate(documents)]

            # Extract and tokenize texts
            tokenized_corpus = []
            for doc in documents:
                text = doc.get(text_field, "")
                if use_korean_tokenizer:
                    tokens = self.tokenize_korean(text)
                else:
                    tokens = self.tokenize_simple(text)
                tokenized_corpus.append(tokens)

            # Build BM25 index
            self.bm25_index = BM25Okapi(tokenized_corpus)

            logger.info(f"BM25 index built for {len(documents)} documents")

        except Exception as e:
            logger.error(f"Error building BM25 index: {str(e)}")
            raise

    def search_bm25(
        self,
        query: str,
        top_k: int = 10,
        use_korean_tokenizer: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search using BM25

        Args:
            query: Search query
            top_k: Number of top results to return
            use_korean_tokenizer: Use Korean-aware tokenization

        Returns:
            List of documents with BM25 scores
        """
        try:
            if self.bm25_index is None:
                logger.warning("BM25 index not built yet")
                return []

            # Tokenize query
            if use_korean_tokenizer:
                query_tokens = self.tokenize_korean(query)
            else:
                query_tokens = self.tokenize_simple(query)

            # Get BM25 scores
            scores = self.bm25_index.get_scores(query_tokens)

            # Get top K indices
            top_indices = np.argsort(scores)[::-1][:top_k]

            # Build results
            results = []
            for idx in top_indices:
                doc = self.documents[idx].copy()
                doc["bm25_score"] = float(scores[idx])
                doc["score"] = doc["bm25_score"]
                results.append(doc)

            logger.info(f"BM25 search returned {len(results)} results (top score: {results[0]['bm25_score']:.4f})")
            return results

        except Exception as e:
            logger.error(f"Error in BM25 search: {str(e)}")
            return []

    def reciprocal_rank_fusion(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
        k: int = 60,
        vector_weight: float = 0.5,
        bm25_weight: float = 0.5,
        id_field: str = "id"
    ) -> List[Dict[str, Any]]:
        """
        Combine vector and BM25 results using Reciprocal Rank Fusion (RRF)

        RRF formula: score(d) = sum(1 / (k + rank(d)))

        Args:
            vector_results: Results from vector search
            bm25_results: Results from BM25 search
            k: RRF constant (default: 60)
            vector_weight: Weight for vector search (0-1)
            bm25_weight: Weight for BM25 search (0-1)
            id_field: Field name for document ID

        Returns:
            Fused and ranked list of documents
        """
        try:
            # Build RRF scores
            rrf_scores = {}

            # Process vector results
            for rank, doc in enumerate(vector_results, start=1):
                doc_id = doc.get(id_field, str(doc.get("text", "")[:50]))
                rrf_score = vector_weight / (k + rank)

                if doc_id not in rrf_scores:
                    rrf_scores[doc_id] = {
                        "doc": doc,
                        "rrf_score": 0.0,
                        "vector_rank": None,
                        "bm25_rank": None,
                        "vector_score": None,
                        "bm25_score": None
                    }

                rrf_scores[doc_id]["rrf_score"] += rrf_score
                rrf_scores[doc_id]["vector_rank"] = rank
                rrf_scores[doc_id]["vector_score"] = doc.get("score", 0.0)

            # Process BM25 results
            for rank, doc in enumerate(bm25_results, start=1):
                doc_id = doc.get(id_field, str(doc.get("text", "")[:50]))
                rrf_score = bm25_weight / (k + rank)

                if doc_id not in rrf_scores:
                    rrf_scores[doc_id] = {
                        "doc": doc,
                        "rrf_score": 0.0,
                        "vector_rank": None,
                        "bm25_rank": None,
                        "vector_score": None,
                        "bm25_score": None
                    }

                rrf_scores[doc_id]["rrf_score"] += rrf_score
                rrf_scores[doc_id]["bm25_rank"] = rank
                rrf_scores[doc_id]["bm25_score"] = doc.get("bm25_score", 0.0)

            # Sort by RRF score
            sorted_results = sorted(
                rrf_scores.values(),
                key=lambda x: x["rrf_score"],
                reverse=True
            )

            # Build final result list
            fused_results = []
            for item in sorted_results:
                doc = item["doc"].copy()
                doc["rrf_score"] = item["rrf_score"]
                doc["vector_rank"] = item["vector_rank"]
                doc["bm25_rank"] = item["bm25_rank"]
                doc["vector_score"] = item["vector_score"]
                doc["bm25_score"] = item["bm25_score"]
                doc["score"] = item["rrf_score"]  # Use RRF score as main score
                fused_results.append(doc)

            logger.info(
                f"RRF fusion completed: "
                f"{len(vector_results)} vector + {len(bm25_results)} BM25 "
                f"-> {len(fused_results)} fused results"
            )

            return fused_results

        except Exception as e:
            logger.error(f"Error in reciprocal rank fusion: {str(e)}")
            # Fallback to vector results
            return vector_results

    def hybrid_search(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 10,
        vector_weight: float = 0.6,
        bm25_weight: float = 0.4,
        use_korean_tokenizer: bool = True,
        vector_scores: Optional[List[float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining vector and BM25

        Args:
            query: Search query
            documents: List of documents (should have vector scores if vector_scores not provided)
            top_k: Number of top results to return
            vector_weight: Weight for vector search (0-1)
            bm25_weight: Weight for BM25 search (0-1)
            use_korean_tokenizer: Use Korean-aware tokenization
            vector_scores: Optional pre-computed vector scores

        Returns:
            Hybrid search results with RRF scores
        """
        try:
            # Build BM25 index
            self.build_bm25_index(documents, use_korean_tokenizer=use_korean_tokenizer)

            # Get BM25 results
            bm25_results = self.search_bm25(query, top_k=top_k * 2, use_korean_tokenizer=use_korean_tokenizer)

            # Prepare vector results
            if vector_scores is not None:
                # Attach vector scores to documents
                for idx, doc in enumerate(documents):
                    if idx < len(vector_scores):
                        doc["score"] = vector_scores[idx]

            # Sort by vector score for vector results
            vector_results = sorted(documents, key=lambda x: x.get("score", 0.0), reverse=True)[:top_k * 2]

            # Fuse results
            fused_results = self.reciprocal_rank_fusion(
                vector_results=vector_results,
                bm25_results=bm25_results,
                vector_weight=vector_weight,
                bm25_weight=bm25_weight
            )

            # Return top K
            return fused_results[:top_k]

        except Exception as e:
            logger.error(f"Error in hybrid search: {str(e)}")
            # Fallback to documents sorted by existing score
            return sorted(documents, key=lambda x: x.get("score", 0.0), reverse=True)[:top_k]


# Global instance (singleton pattern)
_hybrid_search_service_instance = None


def get_hybrid_search_service() -> HybridSearchService:
    """Get singleton instance of HybridSearchService"""
    global _hybrid_search_service_instance
    if _hybrid_search_service_instance is None:
        _hybrid_search_service_instance = HybridSearchService()
    return _hybrid_search_service_instance
