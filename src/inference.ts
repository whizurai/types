/**
 * Direct inference: embeddings, rerank and audio transcription.
 *
 * Wire shapes for the model-router public endpoints `POST /v1/embeddings`,
 * `POST /v1/rerank` and `POST /v1/audio/transcriptions`. These are served by model-router directly
 * (e.g. `https://model-router.<env>.whizur.ai`), not by the api-gateway. Field names are kept exactly as they appear on the wire
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
  /** Worker identity, or `null`/absent when not attributable. */
  worker?: InferenceWorker | null;
  /** Resolved model id (the alias target, not the alias). */
  model?: string;
  /** Exact model revision, or `null` when the runtime cannot report one. */
  model_revision?: string | null;
  /** Prompt/instruction contract the server applied (e.g. `qwen3-embed-instruct-v1`). */
  prompt_contract?: string;
  /** `false` when the gateway could not establish which worker/model served the request. */
  attributable?: boolean;
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
  /**
   * `query` for retrieval queries, `document` (default) for indexed passages.
   * Qwen3-Embedding applies its retrieval instruction only to `query` inputs.
   */
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
}

export interface EmbeddingsResponse {
  object: 'list';
  data: EmbeddingData[];
  model: string;
  usage?: InferenceUsage | null;
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

/** Rerank provenance (includes `attributable`). */
export type RerankProvenance = InferenceProvenance;

export interface RerankResponse {
  id: string;
  model: string;
  /** Sorted by `relevance_score`, descending. */
  results: RerankResult[];
  usage?: InferenceUsage | null;
  whizai?: RerankProvenance;
}

// =============================================================================
// AUDIO TRANSCRIPTION — POST /v1/audio/transcriptions
// =============================================================================
//
// Served by model-router (`AudioTranscriptionRequest` /
// `AudioTranscriptionResponse` in services/model-router/src/models.py).
// The response model has no `whizai` or `execution` block: attribution is
// limited to `provider` and `model`.

/** Output format. The server default is `verbose_json` (with segments). */
export type TranscriptionResponseFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

/** Timestamp granularity levels. Server default `['segment']`. */
export type TranscriptionTimestampGranularity = 'word' | 'segment';

/** Wire request body. Exactly one of `file`, `file_url`, `artifact_id`. */
export interface AudioTranscriptionRequest {
  /** Base64-encoded audio (a `data:` URL is accepted). */
  file?: string;
  /** URL of the audio file. */
  file_url?: string;
  /**
   * A platform artifact holding the audio, ownership-checked against the
   * caller's app. Requires fleet dispatch; cannot expire while queued.
   */
  artifact_id?: string;
  /** Whisper model. Unset = the provider's own whisper (the fleet's is `whisper-large-v3-turbo`). */
  model?: string;
  /** Unset = the router chooses. Pinning a provider fails closed if it is unavailable. */
  provider?: string;
  /** `auto` (or unset) lets the router choose. */
  backend?: string;
  /** ISO-639-1 code (e.g. `en`). Auto-detected when unset. */
  language?: string;
  /** Style/vocabulary hint, at most 224 characters. */
  prompt?: string;
  response_format?: TranscriptionResponseFormat;
  /** 0..1. Server default 0. */
  temperature?: number;
  timestamp_granularities?: TranscriptionTimestampGranularity[];
  /**
   * Execution controls, as on chat: `executionPolicy`, `priority`,
   * `idempotencyKey`, `deadlineSeconds`, `timeoutMs`. Tenancy comes from the
   * authenticated key.
   */
  metadata?: Record<string, unknown>;
}

export interface TranscriptionSegment {
  text: string;
  /** Seconds. */
  start: number;
  /** Seconds. */
  end: number;
  /** 0..1 (converted from Whisper's `avg_logprob`), or `null`/absent when unknown. */
  confidence?: number | null;
}

/** `200` body of `POST /v1/audio/transcriptions`. */
export interface AudioTranscriptionResponse {
  /** Full transcribed text. */
  text: string;
  /** Detected or requested ISO-639-1 code. */
  language?: string | null;
  /** Audio duration in seconds. */
  duration?: number | null;
  /** Present for `verbose_json`. */
  segments?: TranscriptionSegment[] | null;
  /** Provider that served it (model-router `ProviderType`, e.g. `vllm`, `openai`). */
  provider: string;
  /** Model that served it. */
  model: string;
  request_id: string;
}

/**
 * `202` body: with `metadata.idempotencyKey`, a transcription still owed after
 * the router's wait returns this. Re-send the same request to re-attach.
 */
export interface AudioTranscriptionPending {
  jobId: string;
  state: string;
}
