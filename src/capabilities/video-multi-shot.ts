/**
 * Multi-Shot Video Capability Types
 *
 * Platform capability `video:multi-shot@v1` — one continuous video generated
 * from an ordered list of shots, with optional named subjects held consistent
 * across every shot.
 *
 * These types are PROVIDER-NEUTRAL by design. They describe what the platform
 * understands (ordered shots, named subject references) and never what any one
 * provider calls it. A provider that implements this concept as "elements" or
 * "characters", and addresses subjects with `@name` or `{{name}}` or an id, is
 * translated at that provider's adapter — not here, and never in a caller.
 *
 * @module @whizurai/types/capabilities/video-multi-shot
 */

/**
 * One shot of a multi-shot generation.
 *
 * Array order IS shot order, at every layer. Nothing sorts, filters or
 * re-groups this list between the caller and the provider.
 */
export interface VideoShot {
  /**
   * What happens in this shot.
   *
   * May address a registered subject by its bare `token` (e.g. `hero_pet`).
   * Do NOT write provider reference syntax here — the adapter applies it.
   */
  prompt: string;

  /** Length of this shot in seconds. */
  durationSeconds: number;
}

/**
 * A named subject whose identity must survive the whole generation.
 *
 * This is the platform's vocabulary for "keep this specific subject looking
 * like itself". It carries the two facts a provider needs that a plain
 * reference image does not: which subject the images depict, and what the
 * prompts call it.
 */
export interface SubjectReference {
  /** How shot prompts address this subject, e.g. `hero_pet`. */
  token: string;

  /** Short factual description of the subject. */
  description?: string;

  /**
   * Images establishing this subject's appearance.
   *
   * Providers impose their own minimum and maximum (Kling 3.0 requires 2–4).
   * The limit is declared by the routed model and enforced before the request
   * is dispatched, so an out-of-range set is refused rather than billed.
   */
  imageUrls: string[];
}

/** Input contract for `video:multi-shot@v1`. */
export interface VideoMultiShotInput {
  /** The frame the sequence opens on. Optional. */
  startImageUrl?: string;

  /** Ordered shots. At least one; the routed model declares the maximum. */
  shots: VideoShot[];

  /** Named subjects to keep consistent across shots. */
  subjectReferences?: SubjectReference[];

  /** Output shape, e.g. `16:9`, `9:16`, `1:1`. */
  aspectRatio?: string;

  /** Output resolution tier, e.g. `720p`. */
  resolution?: string;

  /** Generate audio with the video. Defaults to false. */
  audio?: boolean;

  /** Where to deliver completion. */
  callbackUrl?: string;

  /**
   * Caller-supplied key. An identical repeat must not create a second paid
   * provider task.
   */
  idempotencyKey?: string;
}

/** Output of `video:multi-shot@v1`. */
export interface VideoMultiShotOutput {
  /** The single sequenced video. */
  video: string;
}

/**
 * Total seconds a multi-shot request will bill for.
 *
 * The sum of the shot durations IS the duration of the output — providers bill
 * per second of generated video, so a declared total that disagrees with the
 * shots is a request that gets accepted, charged, and then rejected.
 */
export function totalDurationSeconds(shots: readonly VideoShot[]): number {
  return shots.reduce((total, shot) => total + shot.durationSeconds, 0);
}
