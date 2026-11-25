/**
 * Image to 3D Model Capability Types
 *
 * Platform capability `image:to-3d-model@v1`: one image of a subject in, a textured 3D model (GLB) out,
 * optionally a second GLB prepared for printing at a set height, on the local fleet. Mirrors
 * `ImageTo3dModelInput` / `ImageTo3dModelFile` / `ImageTo3dModelResult` in the platform's
 * `docs/api/openapi.yaml`; the contract is documented in the platform repo (`docs/mesh3d-runtime.md`,
 * `context/capabilities/image-to-3d-model.md`).
 *
 * Properties callers can rely on:
 *  - The engine is part of the output's meaning and is never substituted: an unavailable engine fails
 *    the run. Nothing falls back to another engine or to a hosted provider.
 *  - Unknown fields, unknown option keys and out-of-range values are rejected (400 naming the field),
 *    never clamped or ignored.
 *  - Every `served*` field (and the rest of the attribution) is what the executing worker reported,
 *    never what was requested. Unknown is `null`, never a default or zero.
 *  - A job runs for minutes (2-25 on the reference runtime).
 *
 * @module @whizurai/types/capabilities/image-to-3d-model
 */

/** `hunyuan3d-2.1-mlx`: shape plus a multi-view painted texture. `sf3d`: a fast single-pass textured mesh. */
export type ImageTo3dModelEngine = 'hunyuan3d-2.1-mlx' | 'sf3d';

/** Fleet queue class. `interactive` is deliberately not accepted. */
export type ImageTo3dModelPriority = 'production' | 'batch' | 'backfill';

/** Engine options, snake_case as the runtime reads them. Any other key is refused. */
export interface ImageTo3dModelOptions {
  /** 10-100. */
  steps?: number;
  /** 1-15. */
  guidance?: number;
  octree_resolution?: 128 | 192 | 256 | 384;
  texture?: boolean;
  texture_size?: 512 | 1024 | 2048 | 4096;
  /** 4-9. */
  max_num_view?: number;
}

/** Print preparation. Absent or `null` = the raw model only. */
export interface ImageTo3dModelPrep {
  /** 20-300. The printed height. */
  height_mm: number;
  base?: 'auto' | 'plinth' | 'none';
  /** 0.5-20. */
  plinth_mm?: number;
  /** 512-4096. */
  texture_px?: number;
  /** 0.3-5. */
  min_wall_mm?: number;
}

/** Input for `image:to-3d-model@v1`. */
export interface ImageTo3dModelInput {
  /** An https URL (at most 2048 characters) the platform copies into its own storage. A transparent cutout works best. */
  imageUrl: string;
  /** Default `hunyuan3d-2.1-mlx`. Not substitutable. */
  engine?: ImageTo3dModelEngine;
  /** 0-4294967295. Omitted = derived from the run, so a retry is identical; the result reports the seed that ran. */
  seed?: number;
  options?: ImageTo3dModelOptions;
  prep?: ImageTo3dModelPrep | null;
  /** Default `batch`. */
  priority?: ImageTo3dModelPriority;
}

/** One stored file. The URL is a bearer capability: do not forward API credentials to it. */
export interface ImageTo3dModelFile {
  url: string;
  storageKey: string;
  contentType: 'model/gltf-binary' | 'application/json' | 'image/png';
  sizeBytes: number;
  /** Lowercase hex SHA-256 of the file. */
  sha256: string;
}

/** Stage timings the runtime reported, in ms. `null` = not reported. */
export interface ImageTo3dModelTimings {
  loadMs: number | null;
  shapeMs: number | null;
  textureMs: number | null;
  prepMs: number | null;
  totalMs: number | null;
}

export interface ImageTo3dModelWarning {
  code: string;
  message: string;
}

/**
 * Output of the `image.to_3d_model` step (`ImageTo3dModelResult`). The top-level file fields describe the
 * primary GLB: the prepared model when `prep` was sent, else the raw model.
 */
export interface ImageTo3dModelResult extends ImageTo3dModelFile {
  /** The primary GLB (same as the top-level file fields). */
  model: ImageTo3dModelFile;
  /** The model as the engine produced it. */
  rawModel: ImageTo3dModelFile;
  /** Print-prepared GLB (metres, colour embedded). `null` without prep. */
  preparedModel: ImageTo3dModelFile | null;
  /** report.json: the runtime's attribution verbatim, the prep report and the request as sent. */
  report: ImageTo3dModelFile;
  /** The exact PNG the engine saw. */
  cutout: ImageTo3dModelFile & { width: number | null; height: number | null };

  servedEngine: ImageTo3dModelEngine;
  /** The weights the runtime reported, e.g. a repository id. */
  servedModel: string;
  modelRevision: string | null;
  codeRevision?: string | null;
  runtime: string;
  /** The framework that ran it, e.g. `mlx` or `torch-mps`. */
  engineRuntime?: string | null;
  deviceObserved: string | null;
  seedApplied: number | null;
  optionsApplied?: Record<string, unknown> | null;
  timings: ImageTo3dModelTimings;
  peakRssMb?: number | null;
  /** The print-prep report verbatim. `null` without prep. */
  prepReport: Record<string, unknown> | null;

  /** False when `modelRevision` or `deviceObserved` is unknown. */
  attributable: boolean;
  jobId: string;
  /** Worker-measured; `null` if unreported. Absence is not zero. */
  wallMs: number | null;
  warnings: ImageTo3dModelWarning[];
}

/**
 * What a completed run's `output` holds (the capability's workflow-output mapping): the file URLs flat, plus
 * the step's full result as `attribution`. The primary artifact is the `model` GLB.
 */
export interface ImageTo3dModelRunOutput {
  /** URL of the primary GLB (prepared when `prep` was sent, else raw). */
  model: string;
  /** URL of the raw GLB. */
  rawModel: string;
  /** URL of report.json. */
  report: string;
  /** URL of the cutout PNG. */
  cutout: string;
  prepReport: Record<string, unknown> | null;
  /** The whole step result: every file with its facts, and the worker's attribution. */
  attribution: ImageTo3dModelResult;
}

/**
 * Codes after the `mesh3d/` prefix in a failed run's `errorMessage` (`mesh3d/<code>: <message>`). The
 * first group means the REQUEST is wrong; retrying it unchanged cannot help. The second is capacity or a
 * transient fault: retry as a NEW request with a NEW idempotency key. The platform's own `retryable` flag
 * on the error is the authority; this union is for switch statements, not a promise that no other code
 * appears.
 */
export type ImageTo3dModelErrorCode =
  // The request is wrong, or the result is wrong in a way a retry repeats: do not retry unchanged.
  | 'invalid_option'
  | 'image_invalid'
  | 'image_too_large'
  | 'image_not_found'
  | 'feature_disabled'
  | 'engine_mismatch'
  | 'seed_mismatch'
  | 'prep_failed'
  | 'prep_not_applied'
  | 'engine_timeout'
  | 'output_too_large'
  | 'output_unavailable'
  // Capacity or transient: retry as a new request (new idempotency key).
  | 'busy'
  | 'engine_unavailable'
  | 'model_not_found'
  | 'engine_failed'
  | 'cancelled'
  | 'no_capable_model'
  | 'no_worker_claimed'
  | 'execution_timeout'
  | 'invalid_model_output'
  | 'invalid_image_output'
  | 'output_unverifiable'
  | 'output_rejected';
