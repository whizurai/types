/**
 * GET /v1/model-router/video-routes — the video route table.
 *
 * Which video models a requirements-routed request can land on, per route
 * tier. Mirrors `describeVideoRoutes()` in whizai-platform
 * (packages/providers/src/video/route-selection.ts) and the `VideoRouteTable`
 * schema in docs/api/openapi.yaml.
 */

/** Route tiers, cheapest first in `tierOrder`. */
export type VideoRouteTier = 'standard' | 'directed';

/**
 * `automatic`: the router may choose the model with none named (lifecycle
 * production / validated). `explicit`: only when the caller names it (candidate).
 */
export type VideoRouteReach = 'automatic' | 'explicit';

export interface VideoRouteTableEntry {
  /** Provider model id, e.g. `bytedance/seedance-2-5`. */
  model: string;
  routeTier: VideoRouteTier;
  lifecycle: 'candidate' | 'validated' | 'production';
  reach: VideoRouteReach;
}

export interface VideoRouteTierSummary {
  /** The model chosen when only this tier can serve the shot; null when none is automatic. */
  defaultModel: string | null;
  automaticModels: string[];
}

export interface VideoRouteTable {
  /** Bumped when the shape or a field's meaning changes. */
  version: 1;
  tierOrder: VideoRouteTier[];
  tiers: Record<VideoRouteTier, VideoRouteTierSummary>;
  /** Every model a requirements-routed request can reach. Legacy and retired models are absent. */
  models: VideoRouteTableEntry[];
}
