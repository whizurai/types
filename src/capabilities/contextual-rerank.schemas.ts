/**
 * Contextual Rerank Capability Zod Schemas
 *
 * Runtime validation schemas for the contextual rerank capability.
 * These schemas correspond to the TypeScript types in contextual-rerank.ts.
 *
 * @module @whizurai/types/capabilities/contextual-rerank.schemas
 */

import { z } from 'zod';

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

/**
 * Platform-defined reason codes for recommendations.
 */
export const ReasonCodeSchema = z.enum([
  'PROXIMITY',
  'CONTEXT_MATCH',
  'TEMPORAL_FIT',
  'SEQUENCE_FIT',
  'DIVERSITY',
  'POPULARITY',
  'RECENCY',
  'COLD_START_BOOST',
]);

/**
 * Available feature types for ranking.
 */
export const FeatureTypeSchema = z.enum([
  'geo_distance',
  'temporal_fit',
  'embedding_similarity',
  'sequence_coherence',
  'diversity_signal',
  'popularity_score',
  'recency_score',
]);

/**
 * Ranking strategy versions.
 */
export const RankingStrategySchema = z.enum(['v1', 'v2', 'v3']);

/**
 * Trigger actions that can initiate a rerank request.
 */
export const TriggerActionSchema = z.enum(['added', 'removed', 'updated', 'viewed']);

/**
 * Feedback actions from users.
 */
export const FeedbackActionSchema = z.enum(['accepted', 'rejected', 'skipped', 'completed']);

/**
 * Training job types.
 */
export const TrainingJobTypeSchema = z.enum([
  'reranker_retrain',
  'reranker_finetune',
  'gnn_retrain',
  'feature_calibration',
]);

/**
 * Training job triggers.
 */
export const TrainingTriggerSchema = z.enum([
  'scheduled',
  'manual',
  'threshold',
  'drift_detected',
]);

/**
 * Model promotion types.
 */
export const PromotionTypeSchema = z.enum(['canary', 'gradual', 'full']);

/**
 * Error codes for capability failures.
 */
export const CapabilityErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'DATASET_FORBIDDEN',
  'FEATURE_COMPUTE_FAILED',
  'RANKING_FAILED',
  'TIMEOUT',
  'INTERNAL_ERROR',
  'CAPABILITY_UNAVAILABLE',
  'CAPABILITY_DEGRADED',
]);

/**
 * Workflow steps in capability execution.
 */
export const WorkflowStepSchema = z.enum([
  'validate_and_shape',
  'compute_features',
  'score_and_rank',
  'generate_reasons',
  'finalize_response',
]);

/**
 * Training job error codes.
 */
export const TrainingErrorCodeSchema = z.enum([
  'INSUFFICIENT_DATA',
  'DATA_QUALITY_FAILED',
  'RESOURCE_EXHAUSTED',
  'TRAINING_DIVERGED',
  'VALIDATION_FAILED',
  'INTERNAL_ERROR',
]);

/**
 * Model rollback reasons.
 */
export const RollbackReasonSchema = z.enum([
  'performance_degradation',
  'error_rate_increase',
  'latency_increase',
  'manual_override',
]);

/**
 * Device types for feedback context.
 */
export const DeviceTypeSchema = z.enum(['mobile', 'desktop', 'tablet']);

/**
 * Training job priority.
 */
export const TrainingPrioritySchema = z.enum(['low', 'normal', 'high']);

/**
 * Model status.
 */
export const ModelStatusSchema = z.enum(['registered', 'validating', 'ready', 'failed']);

/**
 * Training failed stage.
 */
export const TrainingFailedStageSchema = z.enum([
  'data_preparation',
  'training',
  'validation',
  'artifact_upload',
]);

/**
 * Dead letter queue failure reasons.
 */
export const DLQFailureReasonSchema = z.enum([
  'DESERIALIZATION_ERROR',
  'VALIDATION_ERROR',
  'PROCESSING_ERROR',
  'TIMEOUT',
  'UNKNOWN',
]);

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * Geographic coordinates.
 */
export const GeoCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * Geographic bounding box.
 */
export const GeoBoundingBoxSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

/**
 * Geographic constraint for filtering.
 */
export const GeoConstraintSchema = z
  .object({
    center: GeoCoordinatesSchema.optional(),
    radiusKm: z.number().min(0.1).max(100).optional(),
    boundingBox: GeoBoundingBoxSchema.optional(),
  })
  .refine(
    (data) => {
      // Must have either center+radius or boundingBox
      const hasCenterRadius = data.center !== undefined && data.radiusKm !== undefined;
      const hasBoundingBox = data.boundingBox !== undefined;
      return hasCenterRadius || hasBoundingBox || Object.keys(data).length === 0;
    },
    {
      message: 'Must provide either center+radiusKm or boundingBox',
    }
  );

/**
 * Time pattern (HH:MM format).
 */
export const TimePatternSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Time must be in HH:MM format',
});

/**
 * Time window constraint.
 */
export const TimeWindowConstraintSchema = z.object({
  start: TimePatternSchema.optional(),
  end: TimePatternSchema.optional(),
  date: z.string().date().optional(),
  timezone: z.string().default('UTC'),
});

/**
 * Context embedding for user preferences.
 */
export const ContextEmbeddingSchema = z
  .object({
    embeddingRef: z.string().min(1).optional(),
    vector: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Must have at least one of embeddingRef, vector, or tags
      return (
        data.embeddingRef !== undefined ||
        data.vector !== undefined ||
        (data.tags !== undefined && data.tags.length > 0)
      );
    },
    {
      message: 'Must provide at least one of embeddingRef, vector, or tags',
    }
  );

/**
 * Candidate entity for ranking.
 */
export const CandidateEntitySchema = z.object({
  entityId: z.string().min(1),
  entityType: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Item in a collection/session.
 */
export const CollectionItemSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.string().min(1),
  position: z.number().int().min(0).optional(),
  addedAt: z.string().datetime().optional(),
});

// =============================================================================
// API REQUEST SCHEMAS
// =============================================================================

/**
 * Trigger event that initiated the rerank request.
 */
export const TriggerEventSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.string().min(1),
  action: TriggerActionSchema,
  timestamp: z.string().datetime(),
});

/**
 * Constraints for filtering candidates.
 */
export const ConstraintsSchema = z.object({
  geo: GeoConstraintSchema.optional(),
  timeWindow: TimeWindowConstraintSchema.optional(),
  entityTypes: z.array(z.string()).optional(),
  excludeEntityIds: z.array(z.string()).optional(),
  customConstraints: z.record(z.unknown()).optional(),
});

/**
 * Context for the rerank request.
 */
export const RerankContextSchema = z.object({
  collectionItems: z.array(CollectionItemSchema).default([]),
  contextEmbedding: ContextEmbeddingSchema.optional(),
  constraints: ConstraintsSchema.optional(),
});

/**
 * Options for the rerank request.
 */
export const RerankOptionsSchema = z.object({
  maxResults: z.number().int().min(1).max(100).default(10),
  includeReasons: z.boolean().default(true),
  includeFeatures: z.boolean().default(false),
  diversityWeight: z.number().min(0).max(1).default(0.2),
  modelVersion: z.string().optional(),
});

/**
 * Request body for executing contextual rerank capability.
 */
export const ContextualRerankRequestSchema = z.object({
  collectionId: z.string().min(1).max(255),
  trigger: TriggerEventSchema,
  context: RerankContextSchema.optional(),
  candidates: z
    .array(CandidateEntitySchema)
    .min(1, 'Must provide at least 1 candidate')
    .max(500, 'Maximum 500 candidates allowed'),
  options: RerankOptionsSchema.optional(),
  requestId: z.string().min(1).max(255),
});

/**
 * Request body for submitting feedback.
 */
export const FeedbackRequestSchema = z.object({
  runId: z.string().min(1),
  collectionId: z.string().min(1),
  entityId: z.string().min(1),
  action: FeedbackActionSchema,
  position: z.number().int().min(0).optional(),
  timestamp: z.string().datetime(),
  context: z.record(z.unknown()).optional(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * A ranked suggestion.
 */
export const SuggestionSchema = z.object({
  entityId: z.string(),
  entityType: z.string(),
  score: z.number().min(0).max(1),
  rank: z.number().int().min(1),
  reasonCodes: z.array(ReasonCodeSchema).optional(),
  explanation: z.string().optional(),
  features: z.record(z.number()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Response metadata.
 */
export const ResponseMetadataSchema = z.object({
  runId: z.string(),
  modelVersion: z.string().optional(),
  ttlSeconds: z.number().int().optional(),
  generatedAt: z.string().datetime(),
  candidateCount: z.number().int().optional(),
  latencyMs: z.number().int().optional(),
  fallbackUsed: z.boolean().default(false),
});

/**
 * Partial error (when results are still returned).
 */
export const PartialErrorSchema = z.object({
  code: CapabilityErrorCodeSchema,
  message: z.string(),
  fallbackApplied: z.boolean().optional(),
});

/**
 * Response from contextual rerank capability.
 */
export const ContextualRerankResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema),
  metadata: ResponseMetadataSchema,
  error: PartialErrorSchema.optional(),
});

/**
 * Response from feedback submission.
 */
export const FeedbackResponseSchema = z.object({
  feedbackId: z.string(),
  status: z.enum(['accepted', 'queued']),
});

/**
 * Error detail for validation errors.
 */
export const ErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

/**
 * Error response body.
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(ErrorDetailSchema).optional(),
    retryAfterSeconds: z.number().int().optional(),
  }),
});

// =============================================================================
// CONFIGURATION SCHEMAS
// =============================================================================

/**
 * Ranking weights for v1 strategy.
 */
export const RankingWeightsSchema = z
  .record(FeatureTypeSchema, z.number().min(0).max(1))
  .refine(
    (weights) => {
      const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
      return Math.abs(sum - 1) < 0.01;
    },
    {
      message: 'Ranking weights must sum to approximately 1.0',
    }
  );

/**
 * Reason templates mapping reason codes to display text.
 */
export const ReasonTemplatesSchema = z.record(ReasonCodeSchema, z.string());

/**
 * Capability configuration values.
 */
export const CapabilityConfigValuesSchema = z.object({
  maxCandidates: z.number().int().min(10).max(1000).default(200),
  defaultMaxResults: z.number().int().min(1).max(100).default(10),
  enabledFeatures: z
    .array(FeatureTypeSchema)
    .default(['geo_distance', 'embedding_similarity', 'diversity_signal']),
  rankingStrategy: RankingStrategySchema.default('v1'),
  rankingWeights: RankingWeightsSchema.optional(),
  reasonTemplates: ReasonTemplatesSchema.optional(),
  ttlSeconds: z.number().int().min(60).max(86400).default(900),
  feedbackDatasetId: z.string().optional(),
});

/**
 * Full capability configuration.
 */
export const CapabilityConfigSchema = z.object({
  appId: z.string(),
  capabilityId: z.literal('platform.contextual_rerank'),
  config: CapabilityConfigValuesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Request to update capability configuration.
 */
export const CapabilityConfigUpdateSchema = z.object({
  config: CapabilityConfigValuesSchema,
});

// =============================================================================
// INTERNAL API SCHEMAS
// =============================================================================

/**
 * Vector search query.
 */
export const VectorSearchQuerySchema = z
  .object({
    embeddingRef: z.string().optional(),
    vector: z.array(z.number()).optional(),
    text: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasRef = data.embeddingRef !== undefined;
      const hasVector = data.vector !== undefined;
      const hasText = data.text !== undefined;
      return hasRef || hasVector || hasText;
    },
    {
      message: 'Must provide at least one of embeddingRef, vector, or text',
    }
  );

/**
 * Vector search filters.
 */
export const VectorSearchFiltersSchema = z.object({
  geoCell: z.string().optional(),
  entityTypes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  customFilters: z.record(z.unknown()).optional(),
});

/**
 * Internal vector search request.
 */
export const VectorSearchRequestSchema = z.object({
  datasetId: z.string().min(1),
  query: VectorSearchQuerySchema,
  filters: VectorSearchFiltersSchema.optional(),
  topK: z.number().int().min(1).max(1000).default(100),
});

/**
 * Vector search result item.
 */
export const VectorSearchResultItemSchema = z.object({
  entityId: z.string(),
  score: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Internal vector search response.
 */
export const VectorSearchResponseSchema = z.object({
  results: z.array(VectorSearchResultItemSchema),
  datasetId: z.string(),
  searchId: z.string(),
});

/**
 * Internal feature compute request.
 */
export const FeatureComputeRequestSchema = z.object({
  candidates: z.array(CandidateEntitySchema),
  context: RerankContextSchema,
  features: z.array(FeatureTypeSchema),
});

/**
 * Feature vector for a candidate.
 */
export const CandidateFeatureVectorSchema = z.object({
  entityId: z.string(),
  features: z.record(z.number()),
});

/**
 * Internal feature compute response.
 */
export const FeatureComputeResponseSchema = z.object({
  featureVectors: z.array(CandidateFeatureVectorSchema),
});

/**
 * Internal ranking score request.
 */
export const RankingScoreRequestSchema = z.object({
  featureVectors: z.array(CandidateFeatureVectorSchema),
  strategy: RankingStrategySchema,
  weights: z.record(z.number()).optional(),
  modelVersion: z.string().optional(),
});

/**
 * Scored candidate with feature contributions.
 */
export const ScoredCandidateSchema = z.object({
  entityId: z.string(),
  score: z.number(),
  featureContributions: z.record(z.number()).optional(),
});

/**
 * Internal ranking score response.
 */
export const RankingScoreResponseSchema = z.object({
  scores: z.array(ScoredCandidateSchema),
  modelVersion: z.string(),
});

// =============================================================================
// KAFKA EVENT SCHEMAS
// =============================================================================

/**
 * Base event envelope for all Kafka messages.
 */
export const BaseEventEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  orgId: z.string().min(1),
  appId: z.string().min(1),
  timestamp: z.string().datetime(),
  payload: z.record(z.unknown()),
});

// -----------------------------------------------------------------------------
// Capability Run Event Payloads
// -----------------------------------------------------------------------------

export const CapabilityRunRequestedPayloadSchema = z.object({
  runId: z.string(),
  capabilityId: z.string(),
  requestId: z.string(),
  collectionId: z.string().optional(),
  candidateCount: z.number().int().optional(),
  hasContextEmbedding: z.boolean().optional(),
  constraints: z
    .object({
      hasGeo: z.boolean().optional(),
      hasTimeWindow: z.boolean().optional(),
      customConstraintKeys: z.array(z.string()).optional(),
    })
    .optional(),
});

export const CapabilityRunStartedPayloadSchema = z.object({
  runId: z.string(),
  capabilityId: z.string(),
  workerId: z.string().optional(),
  modelVersion: z.string().optional(),
});

export const CapabilityRunCompletedPayloadSchema = z.object({
  runId: z.string(),
  capabilityId: z.string(),
  requestId: z.string().optional(),
  resultCount: z.number().int(),
  modelVersion: z.string().optional(),
  latencyMs: z.number().int(),
  fallbackUsed: z.boolean().default(false),
  featureComputeMs: z.number().int().optional(),
  rankingMs: z.number().int().optional(),
  cacheHit: z.boolean().optional(),
});

export const CapabilityRunFailedPayloadSchema = z.object({
  runId: z.string(),
  capabilityId: z.string(),
  requestId: z.string().optional(),
  errorCode: CapabilityErrorCodeSchema,
  errorMessage: z.string(),
  latencyMs: z.number().int().optional(),
  failedStep: WorkflowStepSchema.optional(),
  retryable: z.boolean().optional(),
});

// Capability Run Events
export const CapabilityRunRequestedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('capability.run.requested'),
  payload: CapabilityRunRequestedPayloadSchema,
});

export const CapabilityRunStartedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('capability.run.started'),
  payload: CapabilityRunStartedPayloadSchema,
});

export const CapabilityRunCompletedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('capability.run.completed'),
  payload: CapabilityRunCompletedPayloadSchema,
});

export const CapabilityRunFailedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('capability.run.failed'),
  payload: CapabilityRunFailedPayloadSchema,
});

export const CapabilityRunEventSchema = z.discriminatedUnion('eventType', [
  CapabilityRunRequestedEventSchema,
  CapabilityRunStartedEventSchema,
  CapabilityRunCompletedEventSchema,
  CapabilityRunFailedEventSchema,
]);

// -----------------------------------------------------------------------------
// Feedback Event Payloads
// -----------------------------------------------------------------------------

export const FeedbackReceivedPayloadSchema = z.object({
  feedbackId: z.string(),
  runId: z.string(),
  collectionId: z.string(),
  entityId: z.string(),
  entityType: z.string().optional(),
  action: FeedbackActionSchema,
  position: z.number().int().min(0).optional(),
  modelVersion: z.string().optional(),
  score: z.number().optional(),
  reasonCodes: z.array(ReasonCodeSchema).optional(),
  context: z
    .object({
      sessionDuration: z.number().int().optional(),
      collectionSize: z.number().int().optional(),
      deviceType: DeviceTypeSchema.optional(),
      feedbackReason: z.string().optional(),
    })
    .optional(),
});

export const FeedbackAggregatedPayloadSchema = z.object({
  aggregationId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  metrics: z.object({
    totalFeedback: z.number().int(),
    acceptedCount: z.number().int(),
    rejectedCount: z.number().int(),
    skippedCount: z.number().int(),
    acceptanceRate: z.number(),
    avgPosition: z.number().optional(),
    uniqueCollections: z.number().int(),
    uniqueEntities: z.number().int(),
  }),
  trainingDataUri: z.string().optional(),
});

// Feedback Events
export const FeedbackReceivedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('recommendation.feedback.received'),
  payload: FeedbackReceivedPayloadSchema,
});

export const FeedbackAggregatedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('recommendation.feedback.aggregated'),
  payload: FeedbackAggregatedPayloadSchema,
});

export const FeedbackEventSchema = z.discriminatedUnion('eventType', [
  FeedbackReceivedEventSchema,
  FeedbackAggregatedEventSchema,
]);

// -----------------------------------------------------------------------------
// Training Job Event Payloads
// -----------------------------------------------------------------------------

export const TrainingJobRequestedPayloadSchema = z.object({
  jobId: z.string(),
  jobType: TrainingJobTypeSchema,
  modelType: z.string(),
  trigger: TrainingTriggerSchema,
  config: z
    .object({
      baseModelVersion: z.string().optional(),
      trainingDataRange: z
        .object({
          start: z.string().datetime(),
          end: z.string().datetime(),
        })
        .optional(),
      hyperparameters: z.record(z.unknown()).optional(),
      validationSplit: z.number().min(0).max(0.5).optional(),
    })
    .optional(),
  priority: TrainingPrioritySchema.default('normal'),
});

export const TrainingJobStartedPayloadSchema = z.object({
  jobId: z.string(),
  jobType: TrainingJobTypeSchema,
  workerId: z.string().optional(),
  resourceAllocation: z
    .object({
      gpuType: z.string().optional(),
      gpuCount: z.number().int().optional(),
      memoryGb: z.number().int().optional(),
    })
    .optional(),
  estimatedDurationMinutes: z.number().int().optional(),
});

export const TrainingMetricsSchema = z.object({
  'ndcg@10': z.number().optional(),
  mrr: z.number().optional(),
  'hitRate@10': z.number().optional(),
  baselineImprovement: z.number().optional(),
  'precision@5': z.number().optional(),
  'recall@10': z.number().optional(),
});

export const TrainingStatsSchema = z.object({
  samplesUsed: z.number().int(),
  trainingTimeSeconds: z.number().int(),
  validationSplit: z.number().optional(),
  epochsCompleted: z.number().int().optional(),
  finalLoss: z.number().optional(),
});

export const TrainingJobCompletedPayloadSchema = z.object({
  jobId: z.string(),
  jobType: TrainingJobTypeSchema,
  modelVersion: z.string(),
  artifactUri: z.string().optional(),
  metrics: TrainingMetricsSchema,
  trainingStats: TrainingStatsSchema.optional(),
  promotionEligible: z.boolean().optional(),
  promotionBlockers: z.array(z.string()).optional(),
});

export const TrainingJobFailedPayloadSchema = z.object({
  jobId: z.string(),
  jobType: TrainingJobTypeSchema,
  errorCode: TrainingErrorCodeSchema,
  errorMessage: z.string(),
  failedStage: TrainingFailedStageSchema.optional(),
  partialMetrics: z.record(z.number()).optional(),
  retryable: z.boolean().optional(),
});

// Training Job Events
export const TrainingJobRequestedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('training.job.requested'),
  payload: TrainingJobRequestedPayloadSchema,
});

export const TrainingJobStartedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('training.job.started'),
  payload: TrainingJobStartedPayloadSchema,
});

export const TrainingJobCompletedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('training.job.completed'),
  payload: TrainingJobCompletedPayloadSchema,
});

export const TrainingJobFailedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('training.job.failed'),
  payload: TrainingJobFailedPayloadSchema,
});

export const TrainingJobEventSchema = z.discriminatedUnion('eventType', [
  TrainingJobRequestedEventSchema,
  TrainingJobStartedEventSchema,
  TrainingJobCompletedEventSchema,
  TrainingJobFailedEventSchema,
]);

// -----------------------------------------------------------------------------
// Model Lifecycle Event Payloads
// -----------------------------------------------------------------------------

export const ModelRegisteredPayloadSchema = z.object({
  modelVersion: z.string(),
  modelType: z.string(),
  artifactUri: z.string(),
  trainingJobId: z.string().optional(),
  metrics: z.record(z.number()).optional(),
  status: ModelStatusSchema.default('registered'),
});

export const ModelPromotedPayloadSchema = z.object({
  modelVersion: z.string(),
  modelType: z.string(),
  previousVersion: z.string().optional(),
  promotionType: PromotionTypeSchema,
  trafficPercent: z.number().int().min(0).max(100),
  promotedBy: z.string().optional(),
  reason: z.string().optional(),
  abTestId: z.string().optional(),
});

export const ModelRolledBackPayloadSchema = z.object({
  modelVersion: z.string(),
  modelType: z.string(),
  rollbackToVersion: z.string(),
  reason: RollbackReasonSchema,
  triggeredBy: z.string().optional(),
  metrics: z.record(z.number()).optional(),
});

export const ModelDeprecatedPayloadSchema = z.object({
  modelVersion: z.string(),
  modelType: z.string(),
  deprecatedAt: z.string().datetime(),
  artifactsRetained: z.boolean().optional(),
  retentionDays: z.number().int().optional(),
});

// Model Lifecycle Events
export const ModelRegisteredEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('model.registered'),
  payload: ModelRegisteredPayloadSchema,
});

export const ModelPromotedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('model.promoted'),
  payload: ModelPromotedPayloadSchema,
});

export const ModelRolledBackEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('model.rolled_back'),
  payload: ModelRolledBackPayloadSchema,
});

export const ModelDeprecatedEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('model.deprecated'),
  payload: ModelDeprecatedPayloadSchema,
});

export const ModelLifecycleEventSchema = z.discriminatedUnion('eventType', [
  ModelRegisteredEventSchema,
  ModelPromotedEventSchema,
  ModelRolledBackEventSchema,
  ModelDeprecatedEventSchema,
]);

// -----------------------------------------------------------------------------
// Dead Letter Queue
// -----------------------------------------------------------------------------

export const DeadLetterEventPayloadSchema = z.object({
  originalTopic: z.string(),
  originalPartition: z.number().int().optional(),
  originalOffset: z.number().int().optional(),
  originalEvent: z.unknown(),
  failureReason: DLQFailureReasonSchema,
  failureMessage: z.string().optional(),
  failureCount: z.number().int().min(1),
  firstFailureAt: z.string().datetime().optional(),
  lastFailureAt: z.string().datetime(),
  consumerGroup: z.string().optional(),
  workerId: z.string().optional(),
});

export const DeadLetterEventSchema = BaseEventEnvelopeSchema.extend({
  eventType: z.literal('dlq.event'),
  payload: DeadLetterEventPayloadSchema,
});

// -----------------------------------------------------------------------------
// All Events Union
// -----------------------------------------------------------------------------

/**
 * Union of all contextual rerank related events.
 */
export const ContextualRerankEventSchema = z.union([
  CapabilityRunEventSchema,
  FeedbackEventSchema,
  TrainingJobEventSchema,
  ModelLifecycleEventSchema,
  DeadLetterEventSchema,
]);

// =============================================================================
// INFERRED TYPES
// =============================================================================

// Enums
export type ReasonCode = z.infer<typeof ReasonCodeSchema>;
export type FeatureType = z.infer<typeof FeatureTypeSchema>;
export type RankingStrategy = z.infer<typeof RankingStrategySchema>;
export type TriggerAction = z.infer<typeof TriggerActionSchema>;
export type FeedbackAction = z.infer<typeof FeedbackActionSchema>;
export type TrainingJobType = z.infer<typeof TrainingJobTypeSchema>;
export type TrainingTrigger = z.infer<typeof TrainingTriggerSchema>;
export type PromotionType = z.infer<typeof PromotionTypeSchema>;
export type CapabilityErrorCode = z.infer<typeof CapabilityErrorCodeSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type TrainingErrorCode = z.infer<typeof TrainingErrorCodeSchema>;
export type RollbackReason = z.infer<typeof RollbackReasonSchema>;

// Common types
export type GeoCoordinates = z.infer<typeof GeoCoordinatesSchema>;
export type GeoBoundingBox = z.infer<typeof GeoBoundingBoxSchema>;
export type GeoConstraint = z.infer<typeof GeoConstraintSchema>;
export type TimeWindowConstraint = z.infer<typeof TimeWindowConstraintSchema>;
export type ContextEmbedding = z.infer<typeof ContextEmbeddingSchema>;
export type CandidateEntity = z.infer<typeof CandidateEntitySchema>;
export type CollectionItem = z.infer<typeof CollectionItemSchema>;

// API types
export type TriggerEvent = z.infer<typeof TriggerEventSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type RerankContext = z.infer<typeof RerankContextSchema>;
export type RerankOptions = z.infer<typeof RerankOptionsSchema>;
export type ContextualRerankRequest = z.infer<typeof ContextualRerankRequestSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type ResponseMetadata = z.infer<typeof ResponseMetadataSchema>;
export type PartialError = z.infer<typeof PartialErrorSchema>;
export type ContextualRerankResponse = z.infer<typeof ContextualRerankResponseSchema>;
export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Configuration types
export type RankingWeights = z.infer<typeof RankingWeightsSchema>;
export type ReasonTemplates = z.infer<typeof ReasonTemplatesSchema>;
export type CapabilityConfigValues = z.infer<typeof CapabilityConfigValuesSchema>;
export type CapabilityConfig = z.infer<typeof CapabilityConfigSchema>;
export type CapabilityConfigUpdate = z.infer<typeof CapabilityConfigUpdateSchema>;

// Internal API types
export type VectorSearchQuery = z.infer<typeof VectorSearchQuerySchema>;
export type VectorSearchFilters = z.infer<typeof VectorSearchFiltersSchema>;
export type VectorSearchRequest = z.infer<typeof VectorSearchRequestSchema>;
export type VectorSearchResultItem = z.infer<typeof VectorSearchResultItemSchema>;
export type VectorSearchResponse = z.infer<typeof VectorSearchResponseSchema>;
export type FeatureComputeRequest = z.infer<typeof FeatureComputeRequestSchema>;
export type CandidateFeatureVector = z.infer<typeof CandidateFeatureVectorSchema>;
export type FeatureComputeResponse = z.infer<typeof FeatureComputeResponseSchema>;
export type RankingScoreRequest = z.infer<typeof RankingScoreRequestSchema>;
export type ScoredCandidate = z.infer<typeof ScoredCandidateSchema>;
export type RankingScoreResponse = z.infer<typeof RankingScoreResponseSchema>;

// Event types
export type CapabilityRunRequestedEvent = z.infer<typeof CapabilityRunRequestedEventSchema>;
export type CapabilityRunStartedEvent = z.infer<typeof CapabilityRunStartedEventSchema>;
export type CapabilityRunCompletedEvent = z.infer<typeof CapabilityRunCompletedEventSchema>;
export type CapabilityRunFailedEvent = z.infer<typeof CapabilityRunFailedEventSchema>;
export type CapabilityRunEvent = z.infer<typeof CapabilityRunEventSchema>;
export type FeedbackReceivedEvent = z.infer<typeof FeedbackReceivedEventSchema>;
export type FeedbackAggregatedEvent = z.infer<typeof FeedbackAggregatedEventSchema>;
export type FeedbackEvent = z.infer<typeof FeedbackEventSchema>;
export type TrainingJobRequestedEvent = z.infer<typeof TrainingJobRequestedEventSchema>;
export type TrainingJobStartedEvent = z.infer<typeof TrainingJobStartedEventSchema>;
export type TrainingJobCompletedEvent = z.infer<typeof TrainingJobCompletedEventSchema>;
export type TrainingJobFailedEvent = z.infer<typeof TrainingJobFailedEventSchema>;
export type TrainingJobEvent = z.infer<typeof TrainingJobEventSchema>;
export type ModelRegisteredEvent = z.infer<typeof ModelRegisteredEventSchema>;
export type ModelPromotedEvent = z.infer<typeof ModelPromotedEventSchema>;
export type ModelRolledBackEvent = z.infer<typeof ModelRolledBackEventSchema>;
export type ModelDeprecatedEvent = z.infer<typeof ModelDeprecatedEventSchema>;
export type ModelLifecycleEvent = z.infer<typeof ModelLifecycleEventSchema>;
export type DeadLetterEvent = z.infer<typeof DeadLetterEventSchema>;
export type ContextualRerankEvent = z.infer<typeof ContextualRerankEventSchema>;

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate a contextual rerank request.
 * Returns the validated data or throws a ZodError.
 */
export function validateContextualRerankRequest(data: unknown): ContextualRerankRequest {
  return ContextualRerankRequestSchema.parse(data);
}

/**
 * Safely validate a contextual rerank request.
 * Returns a result object with success/error information.
 */
export function safeValidateContextualRerankRequest(data: unknown) {
  return ContextualRerankRequestSchema.safeParse(data);
}

/**
 * Validate a feedback request.
 */
export function validateFeedbackRequest(data: unknown): FeedbackRequest {
  return FeedbackRequestSchema.parse(data);
}

/**
 * Safely validate a feedback request.
 */
export function safeValidateFeedbackRequest(data: unknown) {
  return FeedbackRequestSchema.safeParse(data);
}

/**
 * Validate capability configuration.
 */
export function validateCapabilityConfig(data: unknown): CapabilityConfigValues {
  return CapabilityConfigValuesSchema.parse(data);
}

/**
 * Safely validate capability configuration.
 */
export function safeValidateCapabilityConfig(data: unknown) {
  return CapabilityConfigValuesSchema.safeParse(data);
}

/**
 * Validate a Kafka event.
 */
export function validateContextualRerankEvent(data: unknown): ContextualRerankEvent {
  return ContextualRerankEventSchema.parse(data);
}

/**
 * Safely validate a Kafka event.
 */
export function safeValidateContextualRerankEvent(data: unknown) {
  return ContextualRerankEventSchema.safeParse(data);
}

/**
 * Validate a capability run event.
 */
export function validateCapabilityRunEvent(data: unknown): CapabilityRunEvent {
  return CapabilityRunEventSchema.parse(data);
}

/**
 * Validate a feedback event.
 */
export function validateFeedbackEvent(data: unknown): FeedbackEvent {
  return FeedbackEventSchema.parse(data);
}

/**
 * Validate a training job event.
 */
export function validateTrainingJobEvent(data: unknown): TrainingJobEvent {
  return TrainingJobEventSchema.parse(data);
}

/**
 * Validate a model lifecycle event.
 */
export function validateModelLifecycleEvent(data: unknown): ModelLifecycleEvent {
  return ModelLifecycleEventSchema.parse(data);
}

// =============================================================================
// ERROR FORMATTING
// =============================================================================

/**
 * Format Zod errors into API error details.
 */
export function formatZodErrors(error: z.ZodError): ErrorDetail[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Create an error response from a Zod error.
 */
export function createValidationErrorResponse(error: z.ZodError): ErrorResponse {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: formatZodErrors(error),
    },
  };
}
