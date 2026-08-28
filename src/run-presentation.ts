/**
 * Run presentation contract.
 *
 * The derived read model the platform returns for a run's result: what the run
 * actually produced, as opposed to which files it happened to write. Shared
 * here so the SDKs, the CLI and any consumer agree on one shape.
 *
 * Never persisted by the platform — recomputed per request from the run's
 * canonical `result` plus its capability's output declarations.
 */

/**
 * What a produced value IS.
 *
 * Open on purpose. A capability may declare a semantic type this build has
 * never heard of, and a consumer must degrade to a generic rendering rather
 * than fail — so this is a string with known members, not a closed union.
 */
export type SemanticOutputType =
  | 'text'
  | 'markdown'
  | 'object'
  | 'collection'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'unknown'
  | (string & {});

/** Which surface an output belongs on. */
export type SemanticOutputRole = 'primary' | 'secondary' | 'debug';

/**
 * Affordances. The mechanical ones are a pure function of the semantic type;
 * `continuation` is a capability that declares it can consume this result.
 */
export type PresentedActionId =
  | 'copy'
  | 'download'
  | 'open'
  | 'play'
  | 'view_raw'
  | 'save_as_asset'
  | 'reuse'
  | 'continuation'
  | (string & {});

export interface PresentedOutput {
  /** Stable identity: the capability output's `source`, else the result key. */
  key: string;
  label: string;
  semanticType: SemanticOutputType;
  /** Inline value for text | markdown | object | collection. */
  value?: unknown;
  /** The inline value was clipped at the API boundary. */
  truncated?: boolean;
  /** Storage URL for media and files. Not pre-proxied by the platform. */
  href?: string;
  mimeType?: string;
  sizeBytes?: number;
  /**
   * Set when a durable artifact backs this output. A semantic result and an
   * artifact are independent: a result may have no artifact, and an artifact
   * remains available regardless of how the result is presented.
   */
  artifactId?: string;
  /** collection only */
  itemType?: SemanticOutputType;
  itemCount?: number;
  items?: PresentedOutput[];
  /**
   * JSON Schema from the capability's output declaration, when present.
   * Supplies field order and `title` labels for object rendering without a
   * bespoke layout vocabulary.
   */
  schema?: Record<string, unknown>;
}

export interface PresentedInput {
  key: string;
  label: string;
  /** The INPUT semantic vocabulary (SemanticTypeHint), reused verbatim. */
  semanticType?: string;
  value?: unknown;
  href?: string;
  mimeType?: string;
}

export interface PresentedAction {
  id: PresentedActionId;
  label: string;
  /** Which output this acts on. Absent for run-level actions. */
  outputKey?: string;
  primary?: boolean;
  /** `continuation` only: the capability that would consume this result. */
  capabilitySlug?: string;
}

export interface RunPresentation {
  contractVersion: 1;
  /**
   * How this was produced.
   *
   * `declared` — the values came from the workflow's declared outputs.
   * `inferred` — a compatibility adapter reconstructed them for a run that
   *   predates the canonical-result contract. Not expected for new runs.
   * `none` — there was nothing to present.
   */
  source: 'declared' | 'inferred' | 'none';
  /**
   * The run's customer-facing name, taken verbatim from the capability's
   * `name`.
   *
   * ABSENT when the run has no capability. A workflow-only run has no human
   * name anywhere, and formatting `workflowSlug` would substitute a guess for a
   * fact — fall back to the slug instead.
   */
  title?: string;
  primary: PresentedOutput | null;
  secondary: PresentedOutput[];
  /** Outputs declared with role=debug. Inspection surface only. */
  debug: PresentedOutput[];
  inputs: PresentedInput[];
  actions: PresentedAction[];
}
