"""Korean-optimized Chunking Service with Sentence Splitting"""
from typing import List, Dict, Any, Optional
import logging
import re

logger = logging.getLogger(__name__)


class KoreanChunkingService:
    """
    Korean-optimized chunking service with sentence-level splitting

    Features:
    - Korean sentence boundary detection
    - Morpheme-aware splitting (respects word boundaries)
    - Proper handling of Korean punctuation (。, ., ?, !, etc.)
    - Optimized chunk sizes for Korean text density
    """

    def __init__(self):
        """Initialize Korean chunking service"""
        self.kss_available = False

        # Try to import kss (Korean Sentence Splitter)
        try:
            import kss
            self.kss = kss
            self.kss_available = True
            logger.info("KSS (Korean Sentence Splitter) available")
        except ImportError:
            logger.warning("KSS not available, using regex-based sentence splitting")
            self.kss = None

        logger.info("KoreanChunkingService initialized")

    def split_sentences_kss(self, text: str) -> List[str]:
        """
        Split text into sentences using KSS library

        Args:
            text: Input text

        Returns:
            List of sentences
        """
        if not self.kss_available:
            return self.split_sentences_regex(text)

        try:
            sentences = self.kss.split_sentences(text)
            logger.info(f"KSS split {len(text)} chars into {len(sentences)} sentences")
            return sentences
        except Exception as e:
            logger.error(f"KSS splitting error: {str(e)}, falling back to regex")
            return self.split_sentences_regex(text)

    def split_sentences_regex(self, text: str) -> List[str]:
        """
        Split text into sentences using regex patterns (fallback)

        Handles:
        - Korean periods (。)
        - Western periods (.)
        - Question marks (?)
        - Exclamation marks (!)
        - Ellipsis (...)
        """
        # Korean sentence ending patterns
        patterns = [
            r'([^.!?\n]+[.!?。]+)',  # Sentence ending with punctuation
            r'([^.!?\n]+\n)',  # Newline as sentence boundary
        ]

        sentences = []
        remaining = text

        # Primary split: period/question/exclamation
        parts = re.split(r'([.!?。]+)', remaining)

        current_sentence = ""
        for i, part in enumerate(parts):
            if not part.strip():
                continue

            current_sentence += part

            # If this is punctuation and next part exists, complete the sentence
            if re.match(r'[.!?。]+', part):
                sentences.append(current_sentence.strip())
                current_sentence = ""

        # Add remaining text as final sentence
        if current_sentence.strip():
            sentences.append(current_sentence.strip())

        # Filter out empty sentences
        sentences = [s for s in sentences if s.strip()]

        logger.info(f"Regex split {len(text)} chars into {len(sentences)} sentences")
        return sentences

    def create_sentence_based_chunks(
        self,
        text: str,
        target_chunk_size: int = 1200,
        overlap_sentences: int = 1,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Create chunks based on sentence boundaries

        Args:
            text: Input text
            target_chunk_size: Target chunk size in characters
            overlap_sentences: Number of sentences to overlap between chunks
            metadata: Base metadata to attach

        Returns:
            List of chunk objects
        """
        try:
            if not text or not text.strip():
                logger.warning("Empty text provided for sentence-based chunking")
                return []

            # Split into sentences
            sentences = self.split_sentences_kss(text)

            if not sentences:
                logger.warning("No sentences extracted from text")
                return []

            # Group sentences into chunks
            chunks = []
            current_chunk = []
            current_size = 0

            for sentence in sentences:
                sentence_size = len(sentence)

                # If adding this sentence exceeds target, save current chunk
                if current_chunk and (current_size + sentence_size) > target_chunk_size:
                    chunks.append(current_chunk[:])

                    # Keep last N sentences for overlap
                    if overlap_sentences > 0:
                        current_chunk = current_chunk[-overlap_sentences:]
                        current_size = sum(len(s) for s in current_chunk)
                    else:
                        current_chunk = []
                        current_size = 0

                # Add sentence to current chunk
                current_chunk.append(sentence)
                current_size += sentence_size

            # Add final chunk
            if current_chunk:
                chunks.append(current_chunk)

            # Build chunk objects
            chunk_objects = []
            for idx, sentence_list in enumerate(chunks):
                chunk_text = " ".join(sentence_list)

                chunk_metadata = metadata.copy() if metadata else {}
                chunk_metadata.update({
                    "chunk_index": idx,
                    "chunk_size": len(chunk_text),
                    "sentence_count": len(sentence_list),
                    "chunking_method": "sentence_based",
                    "language": "korean"
                })

                chunk_objects.append({
                    "index": idx,
                    "text": chunk_text,
                    "metadata": chunk_metadata
                })

            logger.info(
                f"Created {len(chunk_objects)} sentence-based chunks "
                f"from {len(sentences)} sentences "
                f"(avg {len(text) / len(chunk_objects):.0f} chars/chunk)"
            )

            return chunk_objects

        except Exception as e:
            logger.error(f"Error creating sentence-based chunks: {str(e)}")
            raise

    def create_morpheme_aware_chunks(
        self,
        text: str,
        target_chunk_size: int = 1200,
        overlap_size: int = 180
    ) -> List[Dict[str, Any]]:
        """
        Create chunks with morpheme awareness (word boundary preservation)

        This ensures Korean words are not split in the middle

        Args:
            text: Input text
            target_chunk_size: Target chunk size in characters
            overlap_size: Overlap size in characters

        Returns:
            List of chunk objects
        """
        try:
            if not text or not text.strip():
                return []

            # Split by whitespace to get words
            words = text.split()

            chunks = []
            current_chunk_words = []
            current_size = 0

            for word in words:
                word_size = len(word) + 1  # +1 for space

                # If adding this word exceeds target, save current chunk
                if current_chunk_words and (current_size + word_size) > target_chunk_size:
                    chunk_text = " ".join(current_chunk_words)
                    chunks.append(chunk_text)

                    # Calculate overlap in words
                    overlap_words = []
                    overlap_chars = 0
                    for w in reversed(current_chunk_words):
                        if overlap_chars + len(w) + 1 <= overlap_size:
                            overlap_words.insert(0, w)
                            overlap_chars += len(w) + 1
                        else:
                            break

                    current_chunk_words = overlap_words
                    current_size = overlap_chars

                # Add word to current chunk
                current_chunk_words.append(word)
                current_size += word_size

            # Add final chunk
            if current_chunk_words:
                chunk_text = " ".join(current_chunk_words)
                chunks.append(chunk_text)

            # Build chunk objects
            chunk_objects = []
            for idx, chunk_text in enumerate(chunks):
                chunk_objects.append({
                    "index": idx,
                    "text": chunk_text,
                    "metadata": {
                        "chunk_index": idx,
                        "chunk_size": len(chunk_text),
                        "chunking_method": "morpheme_aware",
                        "language": "korean"
                    }
                })

            logger.info(f"Created {len(chunk_objects)} morpheme-aware chunks")
            return chunk_objects

        except Exception as e:
            logger.error(f"Error creating morpheme-aware chunks: {str(e)}")
            raise

    def create_hybrid_korean_chunks(
        self,
        text: str,
        target_chunk_size: int = 1200,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Create chunks using hybrid approach optimized for Korean

        Combines:
        1. Sentence boundary detection
        2. Morpheme awareness (word boundaries)
        3. Paragraph structure preservation

        Args:
            text: Input text
            target_chunk_size: Target chunk size
            metadata: Base metadata

        Returns:
            List of chunk objects
        """
        try:
            # Split by paragraphs first
            paragraphs = text.split('\n\n')

            all_chunks = []
            chunk_index = 0

            for para_idx, paragraph in enumerate(paragraphs):
                if not paragraph.strip():
                    continue

                para_size = len(paragraph)

                # Small paragraph: keep as one chunk
                if para_size <= target_chunk_size * 1.2:
                    chunk_metadata = metadata.copy() if metadata else {}
                    chunk_metadata.update({
                        "chunk_index": chunk_index,
                        "chunk_size": para_size,
                        "paragraph_index": para_idx,
                        "chunking_method": "hybrid_korean",
                        "chunk_type": "paragraph"
                    })

                    all_chunks.append({
                        "index": chunk_index,
                        "text": paragraph,
                        "metadata": chunk_metadata
                    })
                    chunk_index += 1

                # Large paragraph: split by sentences
                else:
                    sentence_chunks = self.create_sentence_based_chunks(
                        paragraph,
                        target_chunk_size=target_chunk_size,
                        overlap_sentences=1,
                        metadata=metadata
                    )

                    for chunk in sentence_chunks:
                        chunk["index"] = chunk_index
                        chunk["metadata"]["chunk_index"] = chunk_index
                        chunk["metadata"]["paragraph_index"] = para_idx
                        chunk["metadata"]["chunking_method"] = "hybrid_korean"
                        chunk["metadata"]["chunk_type"] = "sentence_group"
                        all_chunks.append(chunk)
                        chunk_index += 1

            logger.info(f"Created {len(all_chunks)} hybrid Korean chunks from {len(paragraphs)} paragraphs")
            return all_chunks

        except Exception as e:
            logger.error(f"Error creating hybrid Korean chunks: {str(e)}")
            raise


# Dependency injection
def get_korean_chunking_service() -> KoreanChunkingService:
    """Get KoreanChunkingService instance"""
    return KoreanChunkingService()
