/**
 * Social Ingest Types
 *
 * Shared types for social scraping and processing.
 */

export enum SocialScrapePlatform {
  REDDIT = 'REDDIT',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  GENERIC = 'GENERIC',
}

export enum SocialScrapeJobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum SocialScrapedItemStatus {
  STORED = 'STORED',
  ERROR = 'ERROR',
}

export enum SocialInsightArtifactType {
  SUMMARY = 'SUMMARY',
  KEYWORDS = 'KEYWORDS',
  CLUSTERS = 'CLUSTERS',
  SENTIMENT = 'SENTIMENT',
  ENTITIES = 'ENTITIES',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  RAW_REPORT = 'RAW_REPORT',
  CUSTOM = 'CUSTOM',
}

// Request/Response Types

export interface SocialScrapeOptions {
  includeComments?: boolean;
  includeEngagement?: boolean;
  includeMedia?: boolean;
  includeSentiment?: boolean;
  downloadVideos?: boolean;
  maxItems?: number;
  timeWindow?: string; // e.g., '7d', '30d'
}

export interface SocialScrapeQuery {
  keywords?: string[];
  urls?: string[];
  searchConfig?: {
    maxItems?: number;
    timeWindow?: string;
    locale?: string;
    subreddits?: string[];
    accounts?: string[];
    hashtags?: string[];
    [key: string]: any;
  };
}

export interface CreateSocialScrapeJobRequest {
  tenantId: string;
  /** Application identifier (required for multi-app support) */
  appId: string;
  platform: SocialScrapePlatform;
  query: SocialScrapeQuery;
  options?: SocialScrapeOptions;
  correlationId?: string;
  callbackTopic?: string;
}

export interface SocialScrapeJobResponse {
  id: string;
  tenantId: string;
  appId?: string;
  platform: SocialScrapePlatform;
  status: SocialScrapeJobStatus;
  countsRaw: number;
  countsStored: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SocialScrapedItemResponse {
  id: string;
  tenantId: string;
  scrapeJobId: string;
  platform: SocialScrapePlatform;
  sourceUrl: string;
  sourceId?: string;
  discoveredAt?: string;
  publishedAt?: string;
  author?: {
    handle?: string;
    displayName?: string;
    profileUrl?: string;
    id?: string;
    [key: string]: any;
  };
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    [key: string]: any;
  };
  rawText?: string;
  media?: Array<{
    type: string;
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    [key: string]: any;
  }>;
  createdAt: string;
}

export interface ProcessSocialScrapeJobRequest {
  tenantId: string;
  workflowTemplate?: string;
  processingProfileId?: string;
  modelPreferences?: {
    provider?: string;
    model?: string;
    temperature?: number;
    [key: string]: any;
  };
  options?: {
    maxItems?: number;
    chunkSize?: number;
    includeClusters?: boolean;
    includeSentiment?: boolean;
    includeEntities?: boolean;
    [key: string]: any;
  };
}

export interface SocialInsightArtifactResponse {
  id: string;
  tenantId: string;
  scrapeJobId?: string;
  workflowRunId?: string;
  type: SocialInsightArtifactType;
  title?: string;
  payload: any;
  citations?: Array<{
    itemId: string;
    sourceUrl: string;
    text?: string;
    [key: string]: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Kafka Event Types

export interface SocialScrapeRequestedEvent {
  jobId: string;
  tenantId: string;
  /** Application identifier (required for multi-app support) */
  appId: string;
  platform: SocialScrapePlatform;
  query: SocialScrapeQuery;
  options?: SocialScrapeOptions;
  correlationId?: string;
  callbackTopic?: string;
  requestedAt: string;
}

export interface SocialScrapeItemStoredEvent {
  jobId: string;
  tenantId: string;
  /** Application identifier (required for multi-app support) */
  appId: string;
  itemId: string;
  platform: SocialScrapePlatform;
  sourceUrl: string;
  ingestionHash: string;
  storedAt: string;
}

export interface SocialScrapeCompletedEvent {
  jobId: string;
  tenantId: string;
  /** Application identifier (required for multi-app support) */
  appId: string;
  platform: SocialScrapePlatform;
  countsStored: number;
  completedAt: string;
}

export interface SocialScrapeFailedEvent {
  jobId: string;
  tenantId: string;
  /** Application identifier (required for multi-app support) */
  appId: string;
  platform: SocialScrapePlatform;
  errorMessage: string;
  failedAt: string;
}
