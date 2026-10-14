/**
 * Image Segment Capability Types
 *
 * Platform capability `image:segment@v1`: cut an object out of a photo, by
 * describing it in words (SAM 3) or by pointing at it (SAM 2), on the local
 * fleet. Mirrors `ImageSegmentInput` / `ImageSegmentResult` in the platform's
 * `docs/api/openapi.yaml`; the contract is documented in the platform repo
 * (`context/capabilities/image-segmentation.md`).
 *
 * Properties callers can rely on:
 *  - The engine is part of the output's meaning and is never substituted: an
 *    unavailable engine fails the run. Nothing falls back to another engine or to
 *    a hosted provider.
 *  - A prompt that matches nothing FAILS the run (`segmentation/no_instances`);
 *    it never resolves to an empty mask.
 *  - Every `served*` field is what the executing worker reported, never what was
 *    requested. Unknown is `null`, never a default.
 *
 * @module @whizurai/types/capabilities/image-segment
 */

/** `sam3` is prompted by a text concept; `sam2` by points and/or a box. */
export type ImageSegmentEngine = 'sam3' | 'sam2';

/** What a request may ask to be returned. Both when unspecified. */
export type ImageSegmentOutputName = 'mask' | 'cutout';

/** Fleet queue class. `interactive` is deliberately not accepted. */
export type ImageSegmentPriority = 'production' | 'batch' | 'backfill';

/**
 * Input for `image:segment@v1`. Unknown fields are rejected, and an option for
 * the other engine is a 400 naming the field.
 *
 * Send exactly one of `imageUrl` and `imageArtifactId`.
 */
export interface ImageSegmentInput {
  engine: ImageSegmentEngine;

  /** An http(s) URL the platform copies into its own storage. Private hosts are refused. */
  imageUrl?: string;

  /** An image artifact owned by the calling app. */
  imageArtifactId?: string;

  /** sam3: REQUIRED concept to segment, 1-200 characters, e.g. "a dog". sam2: not accepted. */
  text?: string;

  /** sam2: 1-16 `[x, y]` pixel positions in the source image. sam3: not accepted. */
  points?: Array<[number, number]>;

  /** sam2: 1 foreground, 0 background; one per point. Defaults to all 1. */
  pointLabels?: Array<0 | 1>;

  /** `[x1, y1, x2, y2]` in source pixels, with 0 <= x1 < x2 and 0 <= y1 < y2. sam2: alone or with points. sam3: optional guidance. */
  box?: [number, number, number, number];

  /** sam3 only, 0-1. Default 0.3. */
  scoreThreshold?: number;

  /** 1-50. How many of the highest-scoring objects are merged into the outputs. Default 20. */
  maxInstances?: number;

  outputs?: ImageSegmentOutputName[];

  priority?: ImageSegmentPriority;
}

/** One stored PNG. The URL is a bearer capability: do not forward API credentials to it. */
export interface ImageSegmentFile {
  url: string;
  storageKey: string;
  contentType: 'image/png';
  sizeBytes: number;
  /** Lowercase hex SHA-256 of the file. */
  sha256: string;
  /** The source image's size after EXIF orientation. */
  width: number;
  height: number;
}

export interface ImageSegmentInstance {
  /**
   * sam3: the model's confidence. sam2: the mean confidence of the pixels it
   * chose, not a calibrated probability.
   */
  score: number;
  /** `[x1, y1, x2, y2]` in source pixels. */
  box: [number, number, number, number];
  areaPx: number;
}

export interface ImageSegmentWarning {
  /** e.g. `instances_capped` */
  code: string;
  message: string;
}

/**
 * Output of `image:segment@v1`. The top-level file fields describe the primary
 * output: the cutout when requested, otherwise the mask.
 */
export interface ImageSegmentResult extends ImageSegmentFile {
  /** The union mask: 8-bit grayscale PNG, 255 = foreground. Present when requested. */
  mask?: ImageSegmentFile;
  /** The source with the mask as its alpha: 8-bit RGBA PNG. Present when requested. */
  cutout?: ImageSegmentFile;

  servedEngine: ImageSegmentEngine;
  /** The model id the runtime reported, e.g. `sam3.1-bf16`. */
  servedModel: string;
  /** `null` when neither the worker nor the runtime reported one. */
  modelRevision: string | null;
  runtime: string;
  /** Observed by the runtime; `null` when unknown. */
  deviceObserved: string | null;

  imageWidth: number;
  imageHeight: number;
  /** Objects at or above the threshold, before `maxInstances` was applied. */
  instancesFound: number;
  /** The objects merged into the outputs, highest score first. At least one. */
  instances: ImageSegmentInstance[];

  /** False when `modelRevision` or `deviceObserved` is unknown. */
  attributable: boolean;
  jobId: string;
  /** Worker-measured; `null` if unreported. Absence is not zero. */
  wallMs: number | null;
  warnings: ImageSegmentWarning[];
}

/**
 * Codes after the `segmentation/` prefix in a failed run's `errorMessage`
 * (`segmentation/<code>: <message>`). The first group means the REQUEST is
 * wrong; retrying it unchanged cannot help. The second is capacity or a
 * transient fault: retry with the same idempotency key. The platform's own
 * `retryable` flag on the error is the authority; this union is for switch
 * statements, not a promise that no other code appears.
 */
export type ImageSegmentErrorCode =
  // The request is wrong: do not retry unchanged.
  | 'invalid_option'
  | 'image_invalid'
  | 'image_too_large'
  | 'image_not_found'
  | 'no_instances'
  | 'feature_disabled'
  | 'engine_mismatch'
  // Capacity or transient: retry with the same idempotency key.
  | 'busy'
  | 'engine_failed'
  | 'no_capable_model'
  | 'no_worker_claimed'
  | 'execution_timeout'
  | 'invalid_image_output'
  | 'output_rejected';
