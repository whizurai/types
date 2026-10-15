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

## Documentation

See [Whizurai Documentation](https://github.com/whizurai/docs) for full API reference.

## License

MIT

