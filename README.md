# @whizurai/types

TypeScript type definitions for the Whizurai Platform APIs.

## Installation

```bash
npm install @whizurai/types
```

## Usage

```typescript
import { SocialScrapePlatform, SocialScrapeJobStatus } from '@whizurai/types';

const platform: SocialScrapePlatform = SocialScrapePlatform.TIKTOK;
```

## Outcome runs

Running a published outcome by slug: `RunOutcomeRequest` / `RunOutcomeResponse`
(`POST /v1/outcomes/{slug}/runs`, 202 new or 200 idempotent replay), `OutcomeRun`
(`GET /v1/outcomes/runs/{id}`), `OutcomeRunAsset` (`GET /v1/outcomes/runs/{id}/assets`)
and `ListOutcomeRunsResponse` (`GET /v1/outcomes/{slug}/runs`), in `@whizurai/types/outcomes`
(also re-exported from the root). Poll until the status is in `TERMINAL_OUTCOME_RUN_STATUSES`
(`SUCCEEDED`, `FAILED`, `CANCELLED`). Errors are `OutcomeErrorResponse`. Platform doc:
`whizai-platform/docs/outcome-launch.md`.

## Video route table

`GET /v1/model-router/video-routes` returns a `VideoRouteTable`
(`@whizurai/types/video-routes`, also re-exported from the root). It lists which video models
a requirements-routed shot can land on, per tier: `reach: 'automatic'` (the router may pick
it unnamed) or `'explicit'` (only when named). Apps that price video check their price list
against it. Platform doc: `whizai-platform/docs/api/video-routes.md`.

## Text generation and image description (gateway)

Wire types for the api-gateway's synchronous `POST /v1/generate/text` and
`POST /v1/images/describe` live in `@whizurai/types/gateway-inference` (also
re-exported from the root). Unlike the model-router endpoints below, these go
through the gateway, which takes the app from the API key and applies its fleet
policy.

```typescript
import type { GenerateTextRequest, DescribeImageRequest, PriorityClass } from '@whizurai/types';
```

- `metadata` carries scheduling only (`priority`, `timeoutMs`, `idempotencyKey`,
  `executionPolicy`); identity fields are dropped by the gateway.
- `DescribeImageRequest` takes exactly one of `image` (base64) or `imageUrl`;
  `model` names an exact model, and omitted runs the platform's `vision` alias.
- Read the served model from the response (`model`), never from the request.

## Embeddings and rerank

Wire types for `POST /v1/embeddings` and `POST /v1/rerank` live in
`@whizurai/types/inference` (also re-exported from the root). Field names match
the wire (snake_case).

```typescript
import type { EmbeddingsResponse, RerankResponse } from '@whizurai/types';
import { RECOMMENDED_EMBEDDING_MODEL } from '@whizurai/types/inference';
```

- `EmbeddingsResponse.whizai` carries provenance: `provider`, `runtime`,
  `execution`, `worker`, `model`, `model_revision`, `dimensions`, `normalized`,
  `prompt_contract`, `embedding_space`, `attributable`. Every field is optional
  — older non-fleet models (e.g. `nomic-embed-text`) return no `embedding_space`.
- **Never compare vectors across `embedding_space` values.** Two vectors are
  comparable only when both carry an `embedding_space` and the strings are
  identical. A missing space is not a wildcard. The SDKs ship
  `assertSameEmbeddingSpace` / `assert_same_embedding_space` to enforce this.
- Limits: `EMBEDDINGS_MAX_INPUTS` (128), `RERANK_MAX_DOCUMENTS` (64).
- Retrieval queries must be sent with `input_type: "query"`; indexed passages
  use `"document"` (the default). Qwen3-Embedding applies its instruction only
  to queries.
- `usage` and `whizai.worker` may be `null`; `whizai.attributable` is present on
  both embeddings and rerank provenance.

## Audio transcription

Wire types for `POST /v1/audio/transcriptions` (model-router) are in the same
module: `AudioTranscriptionRequest` (exactly one of `file`, `file_url`,
`artifact_id`), `AudioTranscriptionResponse` (`text`, `language`, `duration`,
`segments`, `provider`, `model`, `request_id`), `AudioTranscriptionPending`
(the `202 { jobId, state }` answer when `metadata.idempotencyKey` is set),
`TranscriptionSegment` and `TranscriptionResponseFormat`. There is no `whizai`
block: attribution is `provider` and `model`.

## Speech synthesis

`@whizurai/types/capabilities` exports the `speech:synthesize@v1` shapes
(`SPEECH_SYNTHESIZE`, `SpeechSynthesizeInput`, `SpeechSynthesizeResult`,
`SpeechEngine`). Engines: `kokoro` (preset `voice`, `speed`), `chatterbox`
(optional `referenceAudioArtifactId`, `exaggeration`, `cfgWeight`) and
`qwen3-tts` (`referenceAudioArtifactId` **and** `referenceText` required; no
other engine option). The platform refuses an option the engine does not take
(`invalid_option`). The result reports `referenceAudioSha256` /
`referenceTextSha256` for the reference the worker actually used (`null` when
none; never `null` for `qwen3-tts`).

## Image generation

`@whizurai/types/capabilities` exports the `image:generate@v4` input
(`IMAGE_GENERATE`, `ImageGenerateInput`, `ImageGenerateReference`). v4 adds an
optional reference image: one of `referenceImageUrl`, `referenceImageArtifactId`
or `referenceImageBase64` + `referenceImageContentType`, with `referenceStrength`
(0.05-0.95). It is honoured only where the app's images run on the local fleet,
where the render starts from it (img2img); anywhere else it is refused, never
ignored. The image artifact's `metadata.reference` reports what the render
started from (`{ sha256, strength }`, or `null`).

## Documentation

See [Whizurai Documentation](https://github.com/whizurai/docs) for full API reference.

## License

MIT

