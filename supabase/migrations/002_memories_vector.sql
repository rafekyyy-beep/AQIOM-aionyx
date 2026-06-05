-- تفعيل pgvector للتشابه الدلالي
CREATE EXTENSION IF NOT EXISTS vector;

-- تحديث جدول الذاكرة لدعم embedding
ALTER TABLE public.memories 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- إنشاء دالة للبحث بالتشابه الدلالي
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  key TEXT,
  value TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.key,
    memories.value,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.embedding IS NOT NULL
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- إنشاء فهرس للتشابه
CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
