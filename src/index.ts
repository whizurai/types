/**
 * @whizurai/types
 *
 * TypeScript type definitions for Whizurai Platform APIs
 */

export * from './social-ingest';
export * from './trends';
export * from './run-presentation';

// Direct inference (POST /v1/embeddings, POST /v1/rerank, POST /v1/audio/transcriptions)
export * from './inference';

// Gateway inference (POST /v1/generate/text, POST /v1/images/describe)
export * from './gateway-inference';

// Video route table (GET /v1/model-router/video-routes)
export * from './video-routes';

// Outcome runs (POST /v1/outcomes/{slug}/runs, GET /v1/outcomes/runs/{id}[/assets|/workspace|/events|/invocations/{invocationId}], POST /v1/outcomes/runs/{id}/commands, GET /v1/outcomes/{slug}/runs)
export * from './outcomes';

// Capability types
export * as Capabilities from './capabilities';
export * from './capabilities/contextual-rerank';
