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

## Documentation

See [Whizurai Documentation](https://github.com/whizurai/docs) for full API reference.

## License

MIT

