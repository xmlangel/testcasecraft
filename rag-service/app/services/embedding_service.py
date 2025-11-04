"""Embedding Service using Sentence Transformers"""
from typing import List, Dict, Any
import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from ..core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings using Sentence Transformers"""

    def __init__(self, model_name: str = None):
        """
        Initialize embedding model

        Args:
            model_name: Model name for Sentence Transformers.
                       Default: paraphrase-multilingual-mpnet-base-v2 (768 dimensions)
        """
        self.model_name = model_name or "paraphrase-multilingual-mpnet-base-v2"
        self.model = None
        self.embedding_dim = 768  # Dimension for paraphrase-multilingual-mpnet-base-v2

        logger.info(f"EmbeddingService initialized with model: {self.model_name}")

    def load_model(self):
        """Load the embedding model (lazy loading)"""
        if self.model is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Model loaded successfully: {self.model_name}")

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single text

        Args:
            text: Input text to generate embedding

        Returns:
            Embedding vector as list of floats (768 dimensions)
        """
        try:
            self.load_model()

            if not text or not text.strip():
                logger.warning("Empty text provided for embedding generation")
                return [0.0] * self.embedding_dim

            # Generate embedding
            embedding = self.model.encode(text, convert_to_numpy=True)

            # Convert to list and ensure correct dimensions
            embedding_list = embedding.tolist()

            logger.info(f"Generated embedding for text (length: {len(text)} chars, vector dim: {len(embedding_list)})")
            return embedding_list

        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise Exception(f"Embedding generation failed: {str(e)}")

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch processing)

        Args:
            texts: List of input texts

        Returns:
            List of embedding vectors
        """
        try:
            self.load_model()

            if not texts:
                logger.warning("Empty text list provided for batch embedding generation")
                return []

            # Filter out empty texts
            valid_texts = [text if text and text.strip() else " " for text in texts]

            # Generate embeddings in batch
            embeddings = self.model.encode(valid_texts, convert_to_numpy=True, show_progress_bar=True)

            # Convert to list of lists
            embeddings_list = [emb.tolist() for emb in embeddings]

            logger.info(f"Generated {len(embeddings_list)} embeddings (batch mode)")
            return embeddings_list

        except Exception as e:
            logger.error(f"Error generating batch embeddings: {str(e)}")
            raise Exception(f"Batch embedding generation failed: {str(e)}")

    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Compute cosine similarity between two embeddings

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity score (0-1)
        """
        try:
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)

            # Cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)

            if norm1 == 0 or norm2 == 0:
                return 0.0

            similarity = dot_product / (norm1 * norm2)

            # Convert from [-1, 1] to [0, 1]
            similarity_normalized = (similarity + 1) / 2

            return float(similarity_normalized)

        except Exception as e:
            logger.error(f"Error computing similarity: {str(e)}")
            return 0.0


# Global instance (singleton pattern)
_embedding_service_instance = None


def get_embedding_service() -> EmbeddingService:
    """Get singleton instance of EmbeddingService"""
    global _embedding_service_instance
    if _embedding_service_instance is None:
        _embedding_service_instance = EmbeddingService()
    return _embedding_service_instance
