"""Korean Reranker Service for RAG Search Quality Improvement"""
from typing import List, Dict, Any, Tuple
import logging
from sentence_transformers import CrossEncoder
import numpy as np

logger = logging.getLogger(__name__)


class RerankerService:
    """
    Reranker service for improving search result quality

    Uses CrossEncoder to re-score and re-rank initial retrieval results
    by analyzing query-document pairs simultaneously.

    Benefits:
    - More accurate relevance scoring than vector similarity alone
    - Query-aware ranking (not just embedding similarity)
    - Reduced false positives from initial retrieval
    """

    def __init__(self, model_name: str = None):
        """
        Initialize reranker service

        Args:
            model_name: CrossEncoder model name
                - Default: "Dongjin-kr/ko-reranker" (Korean-optimized)
                - Alternative: "cross-encoder/ms-marco-MiniLM-L-6-v2" (multilingual)
        """
        self.model_name = model_name or "cross-encoder/ms-marco-MiniLM-L-6-v2"  # Use multilingual by default
        self.model = None

        logger.info(f"RerankerService initialized with model: {self.model_name}")

    def load_model(self):
        """Load the reranker model (lazy loading)"""
        if self.model is None:
            try:
                logger.info(f"Loading reranker model: {self.model_name}")
                self.model = CrossEncoder(self.model_name)
                logger.info(f"Reranker model loaded successfully: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to load reranker model {self.model_name}: {str(e)}")
                logger.info("Falling back to multilingual model: cross-encoder/ms-marco-MiniLM-L-6-v2")
                self.model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
                self.model = CrossEncoder(self.model_name)

    def rerank(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = None,
        score_threshold: float = None
    ) -> List[Dict[str, Any]]:
        """
        Rerank documents based on query-document relevance

        Args:
            query: Search query
            documents: List of document dicts with 'text' and optional 'score' fields
            top_k: Return top K documents after reranking (None = all)
            score_threshold: Minimum reranker score to include (None = no filter)

        Returns:
            Reranked list of documents with updated 'reranker_score' field
        """
        try:
            if not documents:
                logger.warning("No documents provided for reranking")
                return []

            self.load_model()

            # Prepare query-document pairs
            pairs = []
            for doc in documents:
                doc_text = doc.get("text", "")
                if not doc_text:
                    logger.warning(f"Empty document text at index {documents.index(doc)}")
                    doc_text = doc.get("content", "")  # Fallback to 'content' field

                pairs.append([query, doc_text])

            # Get reranker scores
            logger.info(f"Reranking {len(pairs)} documents for query: {query[:50]}...")
            scores = self.model.predict(pairs)

            # Attach reranker scores to documents
            for idx, doc in enumerate(documents):
                doc["reranker_score"] = float(scores[idx])

                # Keep original vector similarity score if exists
                if "score" in doc and "vector_score" not in doc:
                    doc["vector_score"] = doc["score"]

                # Update main score to reranker score
                doc["score"] = doc["reranker_score"]

            # Sort by reranker score (descending)
            reranked_docs = sorted(documents, key=lambda x: x["reranker_score"], reverse=True)

            # Apply score threshold filter
            if score_threshold is not None:
                reranked_docs = [
                    doc for doc in reranked_docs
                    if doc["reranker_score"] >= score_threshold
                ]
                logger.info(f"Filtered to {len(reranked_docs)} documents above threshold {score_threshold}")

            # Apply top_k limit
            if top_k is not None:
                reranked_docs = reranked_docs[:top_k]
                logger.info(f"Limited to top {top_k} documents")

            logger.info(
                f"Reranking completed: {len(documents)} -> {len(reranked_docs)} documents "
                f"(top score: {reranked_docs[0]['reranker_score']:.4f})"
            )

            return reranked_docs

        except Exception as e:
            logger.error(f"Error during reranking: {str(e)}")
            # Fallback: return original documents without reranking
            logger.warning("Returning original document order due to reranking error")
            return documents

    def compute_relevance_scores(
        self,
        query: str,
        documents: List[str]
    ) -> List[float]:
        """
        Compute relevance scores for query-document pairs

        Args:
            query: Search query
            documents: List of document texts

        Returns:
            List of relevance scores (higher = more relevant)
        """
        try:
            self.load_model()

            pairs = [[query, doc] for doc in documents]
            scores = self.model.predict(pairs)

            return scores.tolist()

        except Exception as e:
            logger.error(f"Error computing relevance scores: {str(e)}")
            return [0.0] * len(documents)

    def get_best_match(
        self,
        query: str,
        documents: List[str]
    ) -> Tuple[int, float]:
        """
        Get the best matching document index and score

        Args:
            query: Search query
            documents: List of document texts

        Returns:
            Tuple of (best_index, best_score)
        """
        try:
            scores = self.compute_relevance_scores(query, documents)

            if not scores:
                return -1, 0.0

            best_idx = int(np.argmax(scores))
            best_score = float(scores[best_idx])

            logger.info(f"Best match: index={best_idx}, score={best_score:.4f}")
            return best_idx, best_score

        except Exception as e:
            logger.error(f"Error getting best match: {str(e)}")
            return -1, 0.0


# Global instance (singleton pattern)
_reranker_service_instance = None


def get_reranker_service() -> RerankerService:
    """Get singleton instance of RerankerService"""
    global _reranker_service_instance
    if _reranker_service_instance is None:
        _reranker_service_instance = RerankerService()
    return _reranker_service_instance
