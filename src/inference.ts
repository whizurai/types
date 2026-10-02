/**
 * Direct inference: embeddings and rerank.
 *
 * Wire shapes for the model-router public endpoints `POST /v1/embeddings` and
 * `POST /v1/rerank`. Field names are kept exactly as they appear on the wire
 * (snake_case) so these types can be used to type raw responses.
 *
 * Provenance (`whizai`) is optional everywhere: older, non-fleet embedding
 * models (e.g. `nomic-embed-text`) answer without it, and every field inside
 * it may be absent on a given deployment. Treat a missing `embedding_space`
 * as "not comparable with anything", never as a wildcard.
 *
 * @module @whizurai/types/inference
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Pinned alias for the recommended fleet embedding model. */
export const RECOMMENDED_EMBEDDING_MODEL = 'embedding-qwen3-0.6b-v1';

/** Pinned alias for the recommended fleet rerank model. */
export const RECOMMENDED_RERANK_MODEL = 'rerank-qwen3-0.6b-v1';

/** Maximum number of inputs accepted by a single `POST /v1/embeddings` call. */
export const EMBEDDINGS_MAX_INPUTS = 128;

/** Maximum number of documents accepted by a single `POST /v1/rerank` call. */
export const RERANK_MAX_DOCUMENTS = 64;

// =============================================================================
// SHARED
// =============================================================================

/** Token usage, when the runtime reports it. */
export interface InferenceUsage {
  prompt_tokens?: number;
  total_tokens?: number;
  [key: string]: unknown;
}

/** The worker that executed a request, when the gateway can attribute it. */
export interface InferenceWorker {
  id: string;
  name: string;
}

/**
 * Execution attribution common to embeddings and rerank responses.
 * Every field is optional because attribution coverage differs per runtime.
 */
export interface InferenceProvenance {
  /** Provider adapter that served the request (e.g. `spark`, `ollama`). */
  provider?: string;
  /** Serving runtime (e.g. `vllm`, `tensorfold`, `ollama`). */
  runtime?: string;
  /** Where it executed (e.g. `local`, `cloud`). */
  execution?: string;
  /** Worker identity, when known. */
  worker?: InferenceWorker;
  /** Resolved model id (the alias target, not the alias). */
  model?: string;
  /** Exact model revision, or `null` when the runtime cannot report one. */
  model_revision?: string | null;
  /** Prompt/instruction contract the server applied (e.g. `qwen3-embed-instruct-v1`). */
  prompt_contract?: string;
}

// =============================================================================
// EMBEDDINGS — POST /v1/embeddings
// =============================================================================

/** Whether the inputs are search queries or documents being indexed. */
export type EmbeddingInputType = 'query' | 'document';

export interface EmbeddingsRequest {
  /** Model id or pinned alias. Required: the vector space is always a deliberate choice. */
  model: string;
  /** One string or up to {@link EMBEDDINGS_MAX_INPUTS} strings. */
  input: string | string[];
  /** Default `document`. Instruction-tuned models embed queries differently. */
  input_type?: EmbeddingInputType;
  /** Optional task instruction (only applied to `query` inputs by instruct models). */
  instruction?: string;
}

export interface EmbeddingData {
  object: 'embedding';
  /** Position of the corresponding input. */
  index: number;
  embedding: number[];
}

export interface EmbeddingProvenance extends InferenceProvenance {
  /** Vector dimensionality. */
  dimensions?: number;
  /** Whether vectors are L2-normalized (cosine == dot product). */
  normalized?: boolean;
  /**
   * Identity of the vector space, e.g.
   * `qwen3-embedding-0.6b:97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3:1024:normalized:qwen3-embed-instruct-v1`
   * (`model:revision:dimensions:normalization:prompt_contract`).
   *
   * Vectors are only comparable when their `embedding_space` strings are
   * identical. Absent on older, non-fleet models.
   */
  embedding_space?: string;
  /** `false` when the gateway could not establish which worker/model served the request. */
  attributable?: boolean;
}

export interface EmbeddingsResponse {
  object: 'list';
  data: EmbeddingData[];
  model: string;
  usage?: InferenceUsage;
  whizai?: EmbeddingProvenance;
}

// =============================================================================
// RERANK — POST /v1/rerank
// =============================================================================

export interface RerankRequest {
  /** Model id or pinned alias. */
  model: string;
  query: string;
  /** 1..{@link RERANK_MAX_DOCUMENTS} documents. */
  documents: string[];
  /** Return only the best `top_n` results. */
  top_n?: number;
  /** Optional task instruction. */
  instruction?: string;
}

export interface RerankResult {
  /** Position of the document in the request's `documents`. */
  index: number;
  relevance_score: number;
}

export type RerankProvenance = InferenceProvenance;

export interface RerankResponse {
  id: string;
  model: string;
  /** Sorted by `relevance_score`, descending. */
  results: RerankResult[];
  usage?: InferenceUsage;
  whizai?: RerankProvenance;
}
