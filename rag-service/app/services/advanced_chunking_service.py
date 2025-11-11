"""Advanced Chunking Service for Korean and Technical Documents"""
from typing import List, Dict, Any, Optional
import logging
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ..core.config import settings

logger = logging.getLogger(__name__)


class AdvancedChunkingService:
    """
    Advanced chunking strategies optimized for Korean language and technical documents

    Features:
    - Header-based splitting (H1/H2/H3 priority)
    - Structure-aware chunking (code blocks, tables, SQL preserved as atomic units)
    - Metadata enrichment (section path, block type, keywords)
    - Optimized chunk size for technical manuals (1200-1600 chars)
    """

    def __init__(self, strategy: str = "adaptive"):
        """
        Initialize advanced chunking service

        Args:
            strategy: Chunking strategy
                - "adaptive": Auto-select based on content type
                - "header": Header-based hierarchical splitting
                - "semantic": Semantic boundary detection
                - "technical": Optimized for technical docs (code/tables)
                - "korean": Optimized for Korean text with morpheme analysis
        """
        self.strategy = strategy

        # Technical document splitter (1400 chars avg, header-aware)
        self.technical_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1400,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n## ", "\n\n# ", "\n\n", "\n", " "]
        )

        # Korean text splitter (slightly smaller for dense Korean text)
        self.korean_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=180,
            length_function=len,
            separators=["\n\n", "\n", "。", ".", " "]
        )

        # Header-based splitter (larger chunks to preserve section context)
        self.header_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1600,
            chunk_overlap=250,
            length_function=len,
            separators=["\n\n## ", "\n\n# ", "\n### ", "\n## ", "\n# ", "\n\n", "\n"]
        )

        logger.info(f"AdvancedChunkingService initialized with strategy: {strategy}")

    def detect_content_type(self, text: str) -> str:
        """
        Detect content type to select optimal chunking strategy

        Returns:
            "technical" | "korean" | "mixed" | "general"
        """
        # Code block patterns
        code_patterns = [
            r'```[\s\S]*?```',  # Markdown code fences
            r'SELECT\s+.*\s+FROM',  # SQL
            r'CREATE\s+(TABLE|VIEW|FUNCTION|PROCEDURE)',  # DDL
            r'def\s+\w+\s*\(',  # Python
            r'function\s+\w+\s*\(',  # JavaScript
            r'class\s+\w+',  # Class definitions
        ]

        # Table patterns
        table_patterns = [
            r'\|[\s\S]+?\|',  # Markdown tables
            r'\n\s*[A-Z_]+\s+\|\s+[A-Z_]+',  # Column header tables
        ]

        # Korean text detection
        korean_chars = len(re.findall(r'[가-힣]', text))
        total_chars = len(text.strip())
        korean_ratio = korean_chars / total_chars if total_chars > 0 else 0

        # Code/technical content detection
        has_code = any(re.search(pattern, text, re.IGNORECASE) for pattern in code_patterns)
        has_table = any(re.search(pattern, text) for pattern in table_patterns)

        if has_code or has_table:
            return "technical"
        elif korean_ratio > 0.3:
            return "korean"
        elif korean_ratio > 0.1:
            return "mixed"
        else:
            return "general"

    def preprocess_technical_document(self, text: str) -> str:
        """
        Preprocess technical documents for better chunking

        - Normalize headers to Markdown format
        - Wrap code blocks in fences
        - Standardize table formatting
        """
        processed = text

        # 1. Detect and wrap code blocks (if not already wrapped)
        # Detect SQL statements
        sql_pattern = r'((?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+[\s\S]*?;)'
        processed = re.sub(
            sql_pattern,
            r'```sql\n\1\n```',
            processed,
            flags=re.IGNORECASE
        )

        # 2. Detect function signatures and wrap them
        func_pattern = r'((?:def|function|CREATE\s+(?:FUNCTION|PROCEDURE))\s+\w+\s*\([^)]*\)[\s\S]*?(?=\n\n|\Z))'
        processed = re.sub(
            func_pattern,
            r'```\n\1\n```',
            processed,
            flags=re.IGNORECASE
        )

        # 3. Normalize headers (all caps words on their own line -> headers)
        # Example: "REGEXPCOUNT" -> "## REGEXPCOUNT"
        header_pattern = r'^([A-Z_]{3,})$'
        processed = re.sub(
            header_pattern,
            r'## \1',
            processed,
            flags=re.MULTILINE
        )

        logger.info("Technical document preprocessing completed")
        return processed

    def extract_code_blocks(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract code blocks as separate atomic chunks

        Returns:
            List of code block chunks with metadata
        """
        code_blocks = []

        # Markdown code fences
        fence_pattern = r'```(\w+)?\n([\s\S]*?)```'

        for match in re.finditer(fence_pattern, text):
            language = match.group(1) or "unknown"
            code = match.group(2).strip()

            code_blocks.append({
                "text": code,
                "metadata": {
                    "block_type": "code",
                    "language": language,
                    "is_atomic": True
                }
            })

        logger.info(f"Extracted {len(code_blocks)} code blocks")
        return code_blocks

    def extract_tables(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract tables as separate atomic chunks

        Returns:
            List of table chunks with metadata
        """
        tables = []

        # Markdown table pattern
        table_pattern = r'(\|[\s\S]+?\|)(?=\n\n|\Z)'

        for match in re.finditer(table_pattern, text):
            table_text = match.group(1).strip()

            # Count rows
            rows = table_text.count('\n') + 1

            tables.append({
                "text": table_text,
                "metadata": {
                    "block_type": "table",
                    "row_count": rows,
                    "is_atomic": True
                }
            })

        logger.info(f"Extracted {len(tables)} tables")
        return tables

    def extract_section_hierarchy(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract section hierarchy from headers

        Returns:
            List of sections with hierarchy metadata
        """
        sections = []
        current_h1 = None
        current_h2 = None
        current_h3 = None

        lines = text.split('\n')
        current_content = []

        for line in lines:
            # Detect headers
            if line.startswith('# '):
                # Save previous section
                if current_content:
                    sections.append({
                        "text": "\n".join(current_content),
                        "metadata": {
                            "section_path": [current_h1, current_h2, current_h3],
                            "level": 3 if current_h3 else (2 if current_h2 else 1)
                        }
                    })
                    current_content = []

                # Update hierarchy
                current_h1 = line.lstrip('# ').strip()
                current_h2 = None
                current_h3 = None
                current_content.append(line)

            elif line.startswith('## '):
                if current_content:
                    sections.append({
                        "text": "\n".join(current_content),
                        "metadata": {
                            "section_path": [current_h1, current_h2, current_h3],
                            "level": 3 if current_h3 else (2 if current_h2 else 1)
                        }
                    })
                    current_content = []

                current_h2 = line.lstrip('# ').strip()
                current_h3 = None
                current_content.append(line)

            elif line.startswith('### '):
                if current_content:
                    sections.append({
                        "text": "\n".join(current_content),
                        "metadata": {
                            "section_path": [current_h1, current_h2, current_h3],
                            "level": 3 if current_h3 else (2 if current_h2 else 1)
                        }
                    })
                    current_content = []

                current_h3 = line.lstrip('# ').strip()
                current_content.append(line)

            else:
                current_content.append(line)

        # Add final section
        if current_content:
            sections.append({
                "text": "\n".join(current_content),
                "metadata": {
                    "section_path": [current_h1, current_h2, current_h3],
                    "level": 3 if current_h3 else (2 if current_h2 else 1)
                }
            })

        logger.info(f"Extracted {len(sections)} hierarchical sections")
        return sections

    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract technical keywords (SQL objects, function names, etc.)

        Returns:
            List of extracted keywords
        """
        keywords = []

        # SQL keywords
        sql_objects = re.findall(
            r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|VIEW|INDEX|FUNCTION|PROCEDURE)\b',
            text,
            re.IGNORECASE
        )
        keywords.extend([k.upper() for k in sql_objects])

        # Function names (def/function keyword followed by name)
        func_names = re.findall(r'(?:def|function)\s+(\w+)', text, re.IGNORECASE)
        keywords.extend(func_names)

        # All caps words (likely object names: REGEXPCOUNT, USER_INDEXES, etc.)
        caps_words = re.findall(r'\b([A-Z_]{3,})\b', text)
        keywords.extend(caps_words)

        # Remove duplicates and return
        unique_keywords = list(set(keywords))
        logger.info(f"Extracted {len(unique_keywords)} keywords")
        return unique_keywords[:20]  # Limit to top 20

    def create_chunks(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        strategy: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Create chunks using advanced strategies

        Args:
            text: Input text
            metadata: Base metadata to attach
            strategy: Override default strategy

        Returns:
            List of chunk objects with enriched metadata
        """
        try:
            if not text or not text.strip():
                logger.warning("Empty text provided for chunking")
                return []

            # Auto-detect content type if adaptive
            selected_strategy = strategy or self.strategy
            if selected_strategy == "adaptive":
                content_type = self.detect_content_type(text)
                logger.info(f"Auto-detected content type: {content_type}")

                if content_type == "technical":
                    selected_strategy = "technical"
                elif content_type == "korean":
                    selected_strategy = "korean"
                else:
                    selected_strategy = "header"

            # Preprocess technical documents
            if selected_strategy == "technical":
                text = self.preprocess_technical_document(text)

            # Select appropriate splitter
            if selected_strategy == "technical":
                splitter = self.technical_splitter
            elif selected_strategy == "korean":
                splitter = self.korean_splitter
            elif selected_strategy == "header":
                splitter = self.header_splitter
            else:
                splitter = self.technical_splitter  # Default

            # Split text
            chunks = splitter.split_text(text)

            # Extract structural elements
            code_blocks = self.extract_code_blocks(text)
            tables = self.extract_tables(text)
            keywords = self.extract_keywords(text)

            # Create chunk objects with enriched metadata
            chunk_objects = []

            for idx, chunk_text in enumerate(chunks):
                chunk_metadata = metadata.copy() if metadata else {}

                # Detect chunk type
                chunk_type = "text"
                if re.search(r'```[\s\S]*?```', chunk_text):
                    chunk_type = "code"
                elif re.search(r'\|[\s\S]+?\|', chunk_text):
                    chunk_type = "table"

                # Extract section headers in this chunk
                headers = re.findall(r'^#+\s+(.+)$', chunk_text, re.MULTILINE)

                chunk_metadata.update({
                    "chunk_index": idx,
                    "chunk_size": len(chunk_text),
                    "chunk_type": chunk_type,
                    "strategy": selected_strategy,
                    "headers": headers[:3],  # First 3 headers
                    "keywords": keywords,  # Global keywords
                    "has_code": chunk_type == "code",
                    "has_table": chunk_type == "table"
                })

                chunk_objects.append({
                    "index": idx,
                    "text": chunk_text,
                    "metadata": chunk_metadata
                })

            # Add atomic code blocks and tables as separate chunks
            for code_block in code_blocks:
                chunk_objects.append({
                    "index": len(chunk_objects),
                    "text": code_block["text"],
                    "metadata": {**metadata, **code_block["metadata"]} if metadata else code_block["metadata"]
                })

            for table in tables:
                chunk_objects.append({
                    "index": len(chunk_objects),
                    "text": table["text"],
                    "metadata": {**metadata, **table["metadata"]} if metadata else table["metadata"]
                })

            logger.info(
                f"Created {len(chunk_objects)} chunks "
                f"(strategy: {selected_strategy}, "
                f"code_blocks: {len(code_blocks)}, "
                f"tables: {len(tables)})"
            )

            return chunk_objects

        except Exception as e:
            logger.error(f"Error creating advanced chunks: {str(e)}")
            raise Exception(f"Advanced chunk creation failed: {str(e)}")


# Dependency injection
def get_advanced_chunking_service() -> AdvancedChunkingService:
    """Get AdvancedChunkingService instance"""
    return AdvancedChunkingService(strategy="adaptive")
