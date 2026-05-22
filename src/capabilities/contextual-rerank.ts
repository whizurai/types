/**
 * Contextual Rerank Capability Types
 *
 * Platform capability for context-aware entity recommendations.
 * These types are generated from the OpenAPI and AsyncAPI specifications.
 *
 * @module @whizurai/types/capabilities/contextual-rerank
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Platform-defined reason codes for recommendations.
 * Apps map these to their own display text via configuration.
 */
export enum ReasonCode {
  /** Geographic closeness to context */
  PROXIMITY = 'PROXIMITY',
  /** Similarity to context embedding */
  CONTEXT_MATCH = 'CONTEXT_MATCH',
  /** Fits time window constraints */
  TEMPORAL_FIT = 'TEMPORAL_FIT',
  /** Logical fit in collection sequence */
  SEQUENCE_FIT = 'SEQUENCE_FIT',
  /** Adds variety to collection */
  DIVERSITY = 'DIVERSITY',
  /** High engagement signal */
  POPULARITY = 'POPULARITY',
  /** Recently added/updated entity */
  RECENCY = 'RECENCY',
  /** New entity exploration */
  COLD_START_BOOST = 'COLD_START_BOOST',
}

/**
 * Available feature types for ranking.
 */
export enum FeatureType {
  /** Distance from context center */
  GEO_DISTANCE = 'geo_distance',
  /** Overlap with time window */
  TEMPORAL_FIT = 'temporal_fit',
  /** Cosine similarity to context embedding */
  EMBEDDING_SIMILARITY = 'embedding_similarity',
  /** Fit with existing collection items */
  SEQUENCE_COHERENCE = 'sequence_coherence',
  /** Dissimilarity from existing items */
  DIVERSITY_SIGNAL = 'diversity_signal',
  /** Aggregated engagement score */
  POPULARITY_SCORE = 'popularity_score',
  /** Time since entity updated */
  RECENCY_SCORE = 'recency_score',
}

/**
 * Ranking strategy versions.
 */
export enum RankingStrategy {
  /** Weighted heuristic */
  V1 = 'v1',
  /** Learned reranker */
  V2 = 'v2',
  /** GNN-based */
  V3 = 'v3',
}

/**
 * Trigger actions that can initiate a rerank request.
 */
export enum TriggerAction {
  ADDED = 'added',
  REMOVED = 'removed',
  UPDATED = 'updated',
  VIEWED = 'viewed',
}

/**
 * Feedback actions from users.
 */
export enum FeedbackAction {
  /** User added suggestion to collection */
  ACCEPTED = 'accepted',
  /** User explicitly dismissed */
  REJECTED = 'rejected',
  /** User ignored */
  SKIPPED = 'skipped',
  /** Collection was finalized */
  COMPLETED = 'completed',
}

/**
 * Training job types.
 */
export enum TrainingJobType {
  RERANKER_RETRAIN = 'reranker_retrain',
  RERANKER_FINETUNE = 'reranker_finetune',
  GNN_RETRAIN = 'gnn_retrain',
  FEATURE_CALIBRATION = 'feature_calibration',
}

/**
 * Training job triggers.
 */
export enum TrainingTrigger {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  THRESHOLD = 'threshold',
  DRIFT_DETECTED = 'drift_detected',
}

/**
 * Model promotion types.
 */
export enum PromotionType {
  /** Small % of traffic */
  CANARY = 'canary',
  /** Incremental rollout */
  GRADUAL = 'gradual',
  /** 100% traffic */
  FULL = 'full',
}

/**
 * Error codes for capability failures.
 */
export enum CapabilityErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATASET_FORBIDDEN = 'DATASET_FORBIDDEN',
  FEATURE_COMPUTE_FAILED = 'FEATURE_COMPUTE_FAILED',
  RANKING_FAILED = 'RANKING_FAILED',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CAPABILITY_UNAVAILABLE = 'CAPABILITY_UNAVAILABLE',
  CAPABILITY_DEGRADED = 'CAPABILITY_DEGRADED',
}

/**
 * Workflow steps in capability execution.
 */
export enum WorkflowStep {
  VALIDATE_AND_SHAPE = 'validate_and_shape',
  COMPUTE_FEATURES = 'compute_features',
  SCORE_AND_RANK = 'score_and_rank',
  GENERATE_REASONS = 'generate_reasons',
  FINALIZE_RESPONSE = 'finalize_response',
}

/**
 * Training job error codes.
 */
export enum TrainingErrorCode {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  DATA_QUALITY_FAILED = 'DATA_QUALITY_FAILED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  TRAINING_DIVERGED = 'TRAINING_DIVERGED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Model rollback reasons.
 */
export enum RollbackReason {
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  ERROR_RATE_INCREASE = 'error_rate_increase',
  LATENCY_INCREASE = 'latency_increase',
  MANUAL_OVERRIDE = 'manual_override',
}

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Geographic coordinates.
 */
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

/**
 * Geographic bounding box.
 */
export interface GeoBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Geographic constraint for filtering.
 */
export interface GeoConstraint {
  center?: GeoCoordinates;
  radiusKm?: number;
  boundingBox?: GeoBoundingBox;
}

/**
 * Time window constraint.
 */
export interface TimeWindowConstraint {
  /** Start time (HH:MM format) */
  start?: string;
  /** End time (HH:MM format) */
  end?: string;
  /** Specific date (YYYY-MM-DD) */
  date?: string;
  /** IANA timezone (defaults to UTC) */
  timezone?: string;
}

/**
 * Context embedding for user preferences.
 */
export interface ContextEmbedding {
  /** Reference to a stored embedding */
  embeddingRef?: string;
  /** Raw embedding vector */
  vector?: number[];
  /** Preference tags */
  tags?: string[];
}

/**
 * Candidate entity for ranking.
 */
export interface CandidateEntity {
  entityId: string;
  entityType: string;
  /** Optional metadata passed through to results */
  metadata?: Record<string, unknown>;
}

/**
 * Item in a collection/session.
 */
export interface CollectionItem {
  entityId: string;
  entityType: string;
  /** Position in collection (0-indexed) */
  position?: number;
  /** When item was added */
  addedAt?: string;
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/**
 * Trigger event that initiated the rerank request.
 */
export interface TriggerEvent {
  entityId: string;
  entityType: string;
  action: TriggerAction;
  timestamp: string;
}

/**
 * Constraints for filtering candidates.
 */
export interface Constraints {
  geo?: GeoConstraint;
  timeWindow?: TimeWindowConstraint;
  entityTypes?: string[];
  excludeEntityIds?: string[];
  /** App-specific constraint key-value pairs */
  customConstraints?: Record<string, unknown>;
}

/**
 * Context for the rerank request.
 */
export interface RerankContext {
  collectionItems?: CollectionItem[];
  contextEmbedding?: ContextEmbedding;
  constraints?: Constraints;
}

/**
 * Options for the rerank request.
 */
export interface RerankOptions {
  /** Maximum suggestions to return (default: 10) */
  maxResults?: number;
  /** Include reason codes and explanations (default: true) */
  includeReasons?: boolean;
  /** Include raw feature scores (default: false) */
  includeFeatures?: boolean;
  /** Weight for diversity in ranking (0-1, default: 0.2) */
  diversityWeight?: number;
  /** Specific model version to use */
  modelVersion?: string;
}

/**
 * Request body for executing contextual rerank capability.
 */
export interface ContextualRerankRequest {
  /** App's collection/session identifier */
  collectionId: string;
  /** Event that triggered this request */
  trigger: TriggerEvent;
  /** Context for ranking */
  context?: RerankContext;
  /** Pre-filtered candidate entities */
  candidates: CandidateEntity[];
  /** Ranking options */
  options?: RerankOptions;
  /** Idempotency key */
  requestId: string;
}

/**
 * Request body for submitting feedback.
 */
export interface FeedbackRequest {
  /** Run ID that generated the suggestion */
  runId: string;
  /** Collection where feedback occurred */
  collectionId: string;
  /** Entity that received feedback */
  entityId: string;
  /** User action */
  action: FeedbackAction;
  /** Position of suggestion when shown */
  position?: number;
  /** When feedback occurred */
  timestamp: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * A ranked suggestion.
 */
export interface Suggestion {
  entityId: string;
  entityType: string;
  /** Relevance score (0-1) */
  score: number;
  /** Position in ranked results (1-indexed) */
  rank: number;
  /** Why this entity was recommended */
  reasonCodes?: ReasonCode[];
  /** Human-readable explanation */
  explanation?: string;
  /** Raw feature scores (if includeFeatures=true) */
  features?: Record<string, number>;
  /** Pass-through metadata from candidate */
  metadata?: Record<string, unknown>;
}

/**
 * Response metadata.
 */
export interface ResponseMetadata {
  /** Unique identifier for this run */
  runId: string;
  /** Model version used for ranking */
  modelVersion?: string;
  /** How long results are cached */
  ttlSeconds?: number;
  /** When results were generated */
  generatedAt: string;
  /** Number of candidates processed */
  candidateCount?: number;
  /** Processing time in milliseconds */
  latencyMs?: number;
  /** Whether fallback ranking was used */
  fallbackUsed?: boolean;
}

/**
 * Partial error (when results are still returned).
 */
export interface PartialError {
  code: CapabilityErrorCode;
  message: string;
  fallbackApplied?: boolean;
}

/**
 * Response from contextual rerank capability.
 */
export interface ContextualRerankResponse {
  suggestions: Suggestion[];
  metadata: ResponseMetadata;
  error?: PartialError;
}

/**
 * Response from feedback submission.
 */
export interface FeedbackResponse {
  feedbackId: string;
  status: 'accepted' | 'queued';
}

/**
 * Error detail for validation errors.
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * Error response body.
 */
export interface ErrorResponse {
  error: {
    code: CapabilityErrorCode | string;
    message: string;
    details?: ErrorDetail[];
    retryAfterSeconds?: number;
  };
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Ranking weights for v1 strategy.
 */
export type RankingWeights = Partial<Record<FeatureType, number>>;

/**
 * Reason templates mapping reason codes to display text.
 */
export type ReasonTemplates = Partial<Record<ReasonCode, string>>;

/**
 * Capability configuration values.
 */
export interface CapabilityConfigValues {
  /** Maximum candidates accepted per request (default: 200) */
  maxCandidates?: number;
  /** Default number of suggestions to return (default: 10) */
  defaultMaxResults?: number;
  /** Features to compute for ranking */
  enabledFeatures?: FeatureType[];
  /** Ranking strategy version */
  rankingStrategy?: RankingStrategy;
  /** Feature weights for v1 strategy */
  rankingWeights?: RankingWeights;
  /** App-specific text for reason codes */
  reasonTemplates?: ReasonTemplates;
  /** Cache TTL for results (default: 900) */
  ttlSeconds?: number;
  /** Dataset for storing feedback */
  feedbackDatasetId?: string;
}

/**
 * Full capability configuration.
 */
export interface CapabilityConfig {
  appId: string;
  capabilityId: 'platform.contextual_rerank';
  config: CapabilityConfigValues;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to update capability configuration.
 */
export interface CapabilityConfigUpdate {
  config: CapabilityConfigValues;
}

// =============================================================================
// INTERNAL API TYPES
// =============================================================================

/**
 * Vector search query.
 */
export interface VectorSearchQuery {
  embeddingRef?: string;
  vector?: number[];
  text?: string;
}

/**
 * Vector search filters.
 */
export interface VectorSearchFilters {
  geoCell?: string;
  entityTypes?: string[];
  tags?: string[];
  customFilters?: Record<string, unknown>;
}

/**
 * Internal vector search request.
 */
export interface VectorSearchRequest {
  datasetId: string;
  query: VectorSearchQuery;
  filters?: VectorSearchFilters;
  topK?: number;
}

/**
 * Vector search result item.
 */
export interface VectorSearchResultItem {
  entityId: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Internal vector search response.
 */
export interface VectorSearchResponse {
  results: VectorSearchResultItem[];
  datasetId: string;
  searchId: string;
}

/**
 * Internal feature compute request.
 */
export interface FeatureComputeRequest {
  candidates: CandidateEntity[];
  context: RerankContext;
  features: FeatureType[];
}

/**
 * Feature vector for a candidate.
 */
export interface CandidateFeatureVector {
  entityId: string;
  features: Record<string, number>;
}

/**
 * Internal feature compute response.
 */
export interface FeatureComputeResponse {
  featureVectors: CandidateFeatureVector[];
}

/**
 * Internal ranking score request.
 */
export interface RankingScoreRequest {
  featureVectors: CandidateFeatureVector[];
  strategy: RankingStrategy;
  weights?: RankingWeights;
  modelVersion?: string;
}

/**
 * Scored candidate with feature contributions.
 */
export interface ScoredCandidate {
  entityId: string;
  score: number;
  featureContributions?: Record<string, number>;
}

/**
 * Internal ranking score response.
 */
export interface RankingScoreResponse {
  scores: ScoredCandidate[];
  modelVersion: string;
}

// =============================================================================
// KAFKA EVENT TYPES
// =============================================================================

/**
 * Base event envelope for all Kafka messages.
 */
export interface BaseEventEnvelope<T extends string, P> {
  /** Unique event identifier */
  eventId: string;
  /** Dot-notation event type */
  eventType: T;
  /** Organization ID (from API key) */
  orgId: string;
  /** Application ID (from API key) */
  appId: string;
  /** Event timestamp (ISO 8601) */
  timestamp: string;
  /** Event-specific payload */
  payload: P;
}

// -----------------------------------------------------------------------------
// Capability Run Events
// -----------------------------------------------------------------------------

export interface CapabilityRunRequestedPayload {
  runId: string;
  capabilityId: string;
  requestId: string;
  collectionId?: string;
  candidateCount?: number;
  hasContextEmbedding?: boolean;
  constraints?: {
    hasGeo?: boolean;
    hasTimeWindow?: boolean;
    customConstraintKeys?: string[];
  };
}

export type CapabilityRunRequestedEvent = BaseEventEnvelope<
  'capability.run.requested',
  CapabilityRunRequestedPayload
>;

export interface CapabilityRunStartedPayload {
  runId: string;
  capabilityId: string;
  workerId?: string;
  modelVersion?: string;
}

export type CapabilityRunStartedEvent = BaseEventEnvelope<
  'capability.run.started',
  CapabilityRunStartedPayload
>;

export interface CapabilityRunCompletedPayload {
  runId: string;
  capabilityId: string;
  requestId?: string;
  resultCount: number;
  modelVersion?: string;
  latencyMs: number;
  fallbackUsed?: boolean;
  featureComputeMs?: number;
  rankingMs?: number;
  cacheHit?: boolean;
}

export type CapabilityRunCompletedEvent = BaseEventEnvelope<
  'capability.run.completed',
  CapabilityRunCompletedPayload
>;

export interface CapabilityRunFailedPayload {
  runId: string;
  capabilityId: string;
  requestId?: string;
  errorCode: CapabilityErrorCode;
  errorMessage: string;
  latencyMs?: number;
  failedStep?: WorkflowStep;
  retryable?: boolean;
}

export type CapabilityRunFailedEvent = BaseEventEnvelope<
  'capability.run.failed',
  CapabilityRunFailedPayload
>;

/** Union of all capability run events */
export type CapabilityRunEvent =
  | CapabilityRunRequestedEvent
  | CapabilityRunStartedEvent
  | CapabilityRunCompletedEvent
  | CapabilityRunFailedEvent;

// -----------------------------------------------------------------------------
// Feedback Events
// -----------------------------------------------------------------------------

export interface FeedbackReceivedPayload {
  feedbackId: string;
  runId: string;
  collectionId: string;
  entityId: string;
  entityType?: string;
  action: FeedbackAction;
  position?: number;
  modelVersion?: string;
  score?: number;
  reasonCodes?: ReasonCode[];
  context?: {
    sessionDuration?: number;
    collectionSize?: number;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    feedbackReason?: string;
  };
}

export type FeedbackReceivedEvent = BaseEventEnvelope<
  'recommendation.feedback.received',
  FeedbackReceivedPayload
>;

export interface FeedbackAggregatedPayload {
  aggregationId: string;
  periodStart: string;
  periodEnd: string;
  metrics: {
    totalFeedback: number;
    acceptedCount: number;
    rejectedCount: number;
    skippedCount: number;
    acceptanceRate: number;
    avgPosition?: number;
    uniqueCollections: number;
    uniqueEntities: number;
  };
  trainingDataUri?: string;
}

export type FeedbackAggregatedEvent = BaseEventEnvelope<
  'recommendation.feedback.aggregated',
  FeedbackAggregatedPayload
>;

/** Union of all feedback events */
export type FeedbackEvent = FeedbackReceivedEvent | FeedbackAggregatedEvent;

// -----------------------------------------------------------------------------
// Training Job Events
// -----------------------------------------------------------------------------

export interface TrainingJobRequestedPayload {
  jobId: string;
  jobType: TrainingJobType;
  modelType: string;
  trigger: TrainingTrigger;
  config?: {
    baseModelVersion?: string;
    trainingDataRange?: {
      start: string;
      end: string;
    };
    hyperparameters?: Record<string, unknown>;
    validationSplit?: number;
  };
  priority?: 'low' | 'normal' | 'high';
}

export type TrainingJobRequestedEvent = BaseEventEnvelope<
  'training.job.requested',
  TrainingJobRequestedPayload
>;

export interface TrainingJobStartedPayload {
  jobId: string;
  jobType: TrainingJobType;
  workerId?: string;
  resourceAllocation?: {
    gpuType?: string;
    gpuCount?: number;
    memoryGb?: number;
  };
  estimatedDurationMinutes?: number;
}

export type TrainingJobStartedEvent = BaseEventEnvelope<
  'training.job.started',
  TrainingJobStartedPayload
>;

export interface TrainingMetrics {
  'ndcg@10'?: number;
  mrr?: number;
  'hitRate@10'?: number;
  baselineImprovement?: number;
  'precision@5'?: number;
  'recall@10'?: number;
}

export interface TrainingStats {
  samplesUsed: number;
  trainingTimeSeconds: number;
  validationSplit?: number;
  epochsCompleted?: number;
  finalLoss?: number;
}

export interface TrainingJobCompletedPayload {
  jobId: string;
  jobType: TrainingJobType;
  modelVersion: string;
  artifactUri?: string;
  metrics: TrainingMetrics;
  trainingStats?: TrainingStats;
  promotionEligible?: boolean;
  promotionBlockers?: string[];
}

export type TrainingJobCompletedEvent = BaseEventEnvelope<
  'training.job.completed',
  TrainingJobCompletedPayload
>;

export interface TrainingJobFailedPayload {
  jobId: string;
  jobType: TrainingJobType;
  errorCode: TrainingErrorCode;
  errorMessage: string;
  failedStage?: 'data_preparation' | 'training' | 'validation' | 'artifact_upload';
  partialMetrics?: Record<string, number>;
  retryable?: boolean;
}

export type TrainingJobFailedEvent = BaseEventEnvelope<
  'training.job.failed',
  TrainingJobFailedPayload
>;

/** Union of all training job events */
export type TrainingJobEvent =
  | TrainingJobRequestedEvent
  | TrainingJobStartedEvent
  | TrainingJobCompletedEvent
  | TrainingJobFailedEvent;

// -----------------------------------------------------------------------------
// Model Lifecycle Events
// -----------------------------------------------------------------------------

export interface ModelRegisteredPayload {
  modelVersion: string;
  modelType: string;
  artifactUri: string;
  trainingJobId?: string;
  metrics?: Record<string, number>;
  status?: 'registered' | 'validating' | 'ready' | 'failed';
}

export type ModelRegisteredEvent = BaseEventEnvelope<
  'model.registered',
  ModelRegisteredPayload
>;

export interface ModelPromotedPayload {
  modelVersion: string;
  modelType: string;
  previousVersion?: string;
  promotionType: PromotionType;
  trafficPercent: number;
  promotedBy?: string;
  reason?: string;
  abTestId?: string;
}

export type ModelPromotedEvent = BaseEventEnvelope<'model.promoted', ModelPromotedPayload>;

export interface ModelRolledBackPayload {
  modelVersion: string;
  modelType: string;
  rollbackToVersion: string;
  reason: RollbackReason;
  triggeredBy?: string;
  metrics?: Record<string, number>;
}

export type ModelRolledBackEvent = BaseEventEnvelope<
  'model.rolled_back',
  ModelRolledBackPayload
>;

export interface ModelDeprecatedPayload {
  modelVersion: string;
  modelType: string;
  deprecatedAt: string;
  artifactsRetained?: boolean;
  retentionDays?: number;
}

export type ModelDeprecatedEvent = BaseEventEnvelope<
  'model.deprecated',
  ModelDeprecatedPayload
>;

/** Union of all model lifecycle events */
export type ModelLifecycleEvent =
  | ModelRegisteredEvent
  | ModelPromotedEvent
  | ModelRolledBackEvent
  | ModelDeprecatedEvent;

// -----------------------------------------------------------------------------
// Dead Letter Queue
// -----------------------------------------------------------------------------

export interface DeadLetterEventPayload {
  originalTopic: string;
  originalPartition?: number;
  originalOffset?: number;
  originalEvent: unknown;
  failureReason:
    | 'DESERIALIZATION_ERROR'
    | 'VALIDATION_ERROR'
    | 'PROCESSING_ERROR'
    | 'TIMEOUT'
    | 'UNKNOWN';
  failureMessage?: string;
  failureCount: number;
  firstFailureAt?: string;
  lastFailureAt: string;
  consumerGroup?: string;
  workerId?: string;
}

export type DeadLetterEvent = BaseEventEnvelope<'dlq.event', DeadLetterEventPayload>;

// -----------------------------------------------------------------------------
// All Events Union
// -----------------------------------------------------------------------------

/** Union of all contextual rerank related events */
export type ContextualRerankEvent =
  | CapabilityRunEvent
  | FeedbackEvent
  | TrainingJobEvent
  | ModelLifecycleEvent
  | DeadLetterEvent;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for capability run requested events.
 */
export function isCapabilityRunRequestedEvent(
  event: ContextualRerankEvent
): event is CapabilityRunRequestedEvent {
  return event.eventType === 'capability.run.requested';
}

/**
 * Type guard for capability run completed events.
 */
export function isCapabilityRunCompletedEvent(
  event: ContextualRerankEvent
): event is CapabilityRunCompletedEvent {
  return event.eventType === 'capability.run.completed';
}

/**
 * Type guard for capability run failed events.
 */
export function isCapabilityRunFailedEvent(
  event: ContextualRerankEvent
): event is CapabilityRunFailedEvent {
  return event.eventType === 'capability.run.failed';
}

/**
 * Type guard for feedback received events.
 */
export function isFeedbackReceivedEvent(
  event: ContextualRerankEvent
): event is FeedbackReceivedEvent {
  return event.eventType === 'recommendation.feedback.received';
}

/**
 * Type guard for training job completed events.
 */
export function isTrainingJobCompletedEvent(
  event: ContextualRerankEvent
): event is TrainingJobCompletedEvent {
  return event.eventType === 'training.job.completed';
}

/**
 * Type guard for model promoted events.
 */
export function isModelPromotedEvent(
  event: ContextualRerankEvent
): event is ModelPromotedEvent {
  return event.eventType === 'model.promoted';
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Extract the payload type from an event type.
 */
export type EventPayload<E extends BaseEventEnvelope<string, unknown>> =
  E extends BaseEventEnvelope<string, infer P> ? P : never;

/**
 * Kafka message key format.
 */
export type KafkaPartitionKey = `${string}:${string}`;

/**
 * Create a Kafka partition key from org and app IDs.
 */
export function createPartitionKey(orgId: string, appId: string): KafkaPartitionKey {
  return `${orgId}:${appId}`;
}

/**
 * Parse a Kafka partition key.
 */
export function parsePartitionKey(key: KafkaPartitionKey): { orgId: string; appId: string } {
  const [orgId, appId] = key.split(':');
  return { orgId, appId };
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a unique event ID.
 */
export function createEventId(prefix: string = 'evt'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Create a base event envelope.
 */
export function createEventEnvelope<T extends string, P>(
  eventType: T,
  orgId: string,
  appId: string,
  payload: P
): BaseEventEnvelope<T, P> {
  return {
    eventId: createEventId(),
    eventType,
    orgId,
    appId,
    timestamp: new Date().toISOString(),
    payload,
  };
}

/**
 * Create a capability run requested event.
 */
export function createCapabilityRunRequestedEvent(
  orgId: string,
  appId: string,
  payload: CapabilityRunRequestedPayload
): CapabilityRunRequestedEvent {
  return createEventEnvelope('capability.run.requested', orgId, appId, payload);
}

/**
 * Create a feedback received event.
 */
export function createFeedbackReceivedEvent(
  orgId: string,
  appId: string,
  payload: FeedbackReceivedPayload
): FeedbackReceivedEvent {
  return createEventEnvelope('recommendation.feedback.received', orgId, appId, payload);
}

/**
 * Create a model promoted event.
 */
export function createModelPromotedEvent(
  orgId: string,
  appId: string,
  payload: ModelPromotedPayload
): ModelPromotedEvent {
  return createEventEnvelope('model.promoted', orgId, appId, payload);
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate that a reason code is valid.
 */
export function isValidReasonCode(code: string): code is ReasonCode {
  return Object.values(ReasonCode).includes(code as ReasonCode);
}

/**
 * Validate that a feature type is valid.
 */
export function isValidFeatureType(type: string): type is FeatureType {
  return Object.values(FeatureType).includes(type as FeatureType);
}

/**
 * Validate that a feedback action is valid.
 */
export function isValidFeedbackAction(action: string): action is FeedbackAction {
  return Object.values(FeedbackAction).includes(action as FeedbackAction);
}

/**
 * Validate ranking weights sum to approximately 1.
 */
export function validateRankingWeights(weights: RankingWeights): boolean {
  const sum = Object.values(weights).reduce((acc, val) => acc + (val ?? 0), 0);
  return Math.abs(sum - 1) < 0.01;
}
