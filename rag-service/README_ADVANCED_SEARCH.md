# 📚 Advanced Search Methods for RAG Service

## 🎯 Overview

This document describes the advanced search methods implemented for improving Korean language RAG (Retrieval-Augmented Generation) search quality.

이 문서는 한국어 RAG 검색 품질 향상을 위해 구현된 고급 검색 방법들을 설명합니다.

---

## 🚀 New Features

### 1. **Advanced Chunking Service** (고급 청킹 서비스)

**Location**: `app/services/advanced_chunking_service.py`

**Features**:
- **Header-based splitting**: Prioritizes Markdown headers (H1/H2/H3) as chunk boundaries
- **Structure-aware chunking**: Preserves code blocks, tables, and SQL queries as atomic units
- **Metadata enrichment**: Adds section paths, block types, and keyword indexing
- **Adaptive strategy**: Auto-detects content type and selects optimal chunking method

**Chunking Strategies**:
- `adaptive`: Auto-select based on content type
- `header`: Header-based hierarchical splitting
- `semantic`: Semantic boundary detection
- `technical`: Optimized for technical docs (code/tables)
- `korean`: Optimized for Korean text

**Recommended Settings**:
```python
chunk_size = 1400  # For technical documents
chunk_overlap = 200
separators = ["\n\n## ", "\n\n# ", "\n\n", "\n", " "]
```

---

### 2. **Korean Chunking Service** (한국어 청킹 서비스)

**Location**: `app/services/korean_chunking_service.py`

**Features**:
- **Korean sentence splitting**: Uses KSS (Korean Sentence Splitter) or regex fallback
- **Morpheme-aware splitting**: Respects Korean word boundaries
- **Hybrid approach**: Combines paragraph structure + sentence splitting

**Methods**:
- `create_sentence_based_chunks()`: Split by Korean sentences
- `create_morpheme_aware_chunks()`: Preserve word boundaries
- `create_hybrid_korean_chunks()`: Paragraph + sentence hybrid

---

### 3. **Hybrid Search Service** (하이브리드 검색 서비스)

**Location**: `app/services/hybrid_search_service.py`

**Features**:
- **Vector search**: Semantic similarity using embeddings
- **BM25 search**: Keyword-based statistical ranking
- **Reciprocal Rank Fusion (RRF)**: Combines both methods
- **Korean tokenization**: Optimized for Korean text

**Benefits**:
- Better recall: Vector search captures semantic meaning
- Better precision: BM25 captures exact keyword matches
- Balanced results: RRF combines strengths of both

**Usage Example**:
```python
from app.services.hybrid_search_service import get_hybrid_search_service

hybrid_service = get_hybrid_search_service()
results = hybrid_service.hybrid_search(
    query="검색 쿼리",
    documents=documents,
    top_k=10,
    vector_weight=0.6,
    bm25_weight=0.4,
    use_korean_tokenizer=True
)
```

---

### 4. **Reranker Service** (재순위 서비스)

**Location**: `app/services/reranker_service.py`

**Features**:
- **CrossEncoder-based reranking**: Analyzes query-document pairs simultaneously
- **Improved relevance scoring**: More accurate than vector similarity alone
- **Query-aware ranking**: Considers both query and document context

**Supported Models**:
- `cross-encoder/ms-marco-MiniLM-L-6-v2` (default, multilingual)
- `Dongjin-kr/ko-reranker` (Korean-optimized, if available)

**Usage Example**:
```python
from app.services.reranker_service import get_reranker_service

reranker = get_reranker_service()
reranked_results = reranker.rerank(
    query="검색 쿼리",
    documents=initial_results,
    top_k=10,
    score_threshold=0.5
)
```

---

## 📡 API Endpoints

### Advanced Search Endpoint

**URL**: `POST /api/v1/search/advanced`

**Request Schema**:
```json
{
  "query_text": "검색할 텍스트",
  "project_id": "uuid-string",
  "search_method": "hybrid_rerank",
  "similarity_threshold": 0.6,
  "max_results": 10,
  "vector_weight": 0.6,
  "bm25_weight": 0.4,
  "use_reranker": true,
  "reranker_top_k": 10
}
```

**Search Methods**:
- `vector`: Pure vector similarity search (벡터 검색)
- `bm25`: Pure keyword-based BM25 search (BM25 검색)
- `hybrid`: Hybrid (vector + BM25 with RRF) (하이브리드)
- `hybrid_rerank`: Hybrid + Reranker (하이브리드 + 재순위) ⭐ **Recommended**

**Response Schema**:
```json
{
  "query": "검색할 텍스트",
  "total_results": 5,
  "results": [
    {
      "embedding_id": "uuid",
      "document_id": "uuid",
      "file_name": "document.pdf",
      "project_id": "uuid",
      "chunk_index": 0,
      "chunk_text": "검색된 텍스트 내용...",
      "chunk_metadata": {...},
      "similarity_score": 0.95,
      "source_type": "document",
      "vector_score": 0.92,
      "bm25_score": 0.85,
      "reranker_score": 0.95,
      "rrf_score": 0.88,
      "vector_rank": 1,
      "bm25_rank": 2
    }
  ],
  "similarity_threshold": 0.6,
  "max_results": 10
}
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env` or Docker environment:

```bash
# Document Parser (for chunking)
DOCUMENT_PARSER=pymupdf4llm  # Options: upstage, pymupdf4llm, pymupdf, pypdf2, auto

# Embedding Model
EMBEDDING_MODEL=paraphrase-multilingual-mpnet-base-v2

# Search Thresholds
SIMILARITY_THRESHOLD=0.6
MAX_SEARCH_RESULTS=10
```

### Docker Compose

The advanced search services are automatically available when running:

```bash
cd dev-docker
docker-compose up -d
```

---

## 📊 Performance Comparison

### Search Method Comparison

| Method | Semantic | Keyword | Speed | Korean Support | Recommended Use Case |
|--------|----------|---------|-------|----------------|---------------------|
| **vector** | ✅ High | ❌ Low | ⚡ Fast | ⭐⭐⭐ | General semantic search |
| **bm25** | ❌ Low | ✅ High | ⚡ Fast | ⭐⭐ | Exact keyword matching |
| **hybrid** | ✅ High | ✅ High | 🐢 Medium | ⭐⭐⭐⭐ | Balanced recall/precision |
| **hybrid_rerank** | ✅ Very High | ✅ High | 🐢 Slow | ⭐⭐⭐⭐⭐ | **Best quality (recommended)** |

### Chunking Strategy Comparison

| Strategy | Technical Docs | Korean Text | Code Preservation | Section Hierarchy |
|----------|----------------|-------------|-------------------|-------------------|
| **technical** | ✅ Excellent | ⭐⭐⭐ | ✅ Yes | ✅ Yes |
| **korean** | ⭐⭐⭐ | ✅ Excellent | ❌ No | ⭐⭐ |
| **header** | ✅ Excellent | ⭐⭐⭐ | ⭐⭐ | ✅ Yes |
| **adaptive** | ✅ Auto-select | ✅ Auto-select | ✅ Auto-select | ✅ Auto-select |

---

## 🧪 Testing

### Test Advanced Search

```bash
# Install dependencies
cd rag-service
pip install -r requirements.txt

# Start services
cd ../dev-docker
docker-compose up -d

# Test endpoint (from another terminal)
curl -X POST "http://localhost:8001/api/v1/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "테스트케이스 작성 방법",
    "search_method": "hybrid_rerank",
    "max_results": 5
  }'
```

---

## 📚 References

### Research Papers & Articles

1. **RAG Chunking Optimization**: [SelectStar Blog - RAG Chunking](https://selectstar.ai/blog/insight/rag-chunking-ko/)
2. **Korean Reranker**: [AWS Blog - Korean Reranker for RAG](https://aws.amazon.com/ko/blogs/tech/korean-reranker-rag/)
3. **Hybrid Search**: [kt cloud - RAG Parsing & Preprocessing](https://tech.ktcloud.com/entry/2025-09-ktcloud-ai-rag-parsing-전처리-최적화)
4. **BM25 Algorithm**: [Reciprocal Rank Fusion](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)

### Libraries Used

- **sentence-transformers**: Embedding generation and CrossEncoder reranking
- **rank-bm25**: BM25 keyword search algorithm
- **kss**: Korean Sentence Splitter
- **langchain**: Text splitting utilities

---

## 🔍 Troubleshooting

### Issue: Reranker model loading fails

**Solution**: The service automatically falls back to multilingual model if Korean-specific model is not available.

### Issue: BM25 search returns no results

**Solution**: Check if `use_korean_tokenizer=True` is set. Korean text requires special tokenization.

### Issue: Chunking creates too many small chunks

**Solution**: Increase `chunk_size` parameter:
```python
chunk_size = 1400  # For technical documents
chunk_size = 1200  # For Korean text
```

---

## 🎓 Best Practices

### 1. **Choose the Right Search Method**

- **Quick search**: Use `vector` for speed
- **Keyword matching**: Use `bm25` for exact terms
- **Best quality**: Use `hybrid_rerank` for Korean text

### 2. **Optimize Chunk Size**

- **Technical manuals**: 1200-1600 characters
- **Korean text**: 800-1200 characters
- **Mixed content**: Use `adaptive` strategy

### 3. **Tune Hybrid Weights**

```python
# For semantic-heavy queries (concepts, meanings)
vector_weight = 0.7
bm25_weight = 0.3

# For keyword-heavy queries (exact terms, names)
vector_weight = 0.4
bm25_weight = 0.6

# Balanced (recommended for Korean)
vector_weight = 0.6
bm25_weight = 0.4
```

### 4. **Use Reranker for Final Ranking**

Always use `use_reranker=True` when:
- Query is in Korean
- High precision is critical
- Performance is acceptable (adds ~100-300ms)

---

## 📝 Changelog

### Version 1.0.0 (2025-01-09)

**New Features**:
- ✨ Advanced chunking service with header/structure awareness
- ✨ Korean-optimized chunking with sentence splitting
- ✨ Hybrid search (Vector + BM25 with RRF)
- ✨ Reranker service for improved ranking
- ✨ Advanced search API endpoint with multiple methods

**Improvements**:
- 📈 Improved Korean text search quality
- 📈 Better handling of technical documentation
- 📈 Enriched metadata for chunks

**Dependencies**:
- ➕ Added `rank-bm25==0.2.2`
- ➕ Added `kss==6.0.2`

---

## 📧 Contact & Support

For questions or issues, please refer to the main project documentation or create an issue in the repository.

프로젝트 메인 문서를 참조하거나 저장소에 이슈를 생성해주세요.
