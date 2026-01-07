/**
 * Trend Feature Types
 * 
 * Types for trend signal processing and template auto-suggest
 */

/**
 * Beat primitives for GuzzyGram storytelling
 * These map to specific motion/emotion patterns in video clips
 */
export type BeatPrimitive =
  | 'intro'
  | 'hook'
  | 'build'
  | 'peak'
  | 'drop'
  | 'resolve'
  | 'outro'
  | 'reveal'
  | 'reaction'
  | 'anticipation'
  | 'celebration'
  | 'retreat'
  | 'approach'
  | 'transform'
  | 'duplicate'
  | 'freeze';

/**
 * Hook types for video content
 */
export type HookType =
  | 'direct_address'
  | 'reveal'
  | 'before_after'
  | 'duplicate'
  | 'reaction'
  | 'pov'
  | 'montage'
  | 'question'
  | 'challenge'
  | 'countdown';

/**
 * Pacing options for video content
 */
export type Pacing = 'fast' | 'medium' | 'slow';

/**
 * Caption style options
 */
export type CaptionStyle =
  | 'punchline'
  | 'sweet'
  | 'curiosity'
  | 'challenge'
  | 'cta_soft'
  | 'dramatic'
  | 'playful';

/**
 * Energy level options
 */
export type EnergyLevel =
  | 'cozy'
  | 'cute'
  | 'chaos'
  | 'hype'
  | 'romantic'
  | 'chill'
  | 'dramatic';

/**
 * Safety flag categories
 */
export type SafetyFlag =
  | 'drug_reference'
  | 'violence'
  | 'adult'
  | 'profanity'
  | 'controversial'
  | 'meme_language'
  | 'political';

/**
 * Risk profile for templates
 */
export type RiskProfile = 'low' | 'medium' | 'high';

/**
 * Format hints for video generation
 */
export interface FormatHints {
  splitScreen?: boolean;
  countUp?: boolean;
  freezeFrame?: boolean;
  textOverlay?: boolean;
  transitionStyle?: string;
  effectStyle?: string;
}

/**
 * Derived trend features from a TrendSignal
 * Output of the trend feature extraction process
 */
export interface TrendFeatures {
  /** Primary hook type detected */
  hookType: HookType;
  
  /** Pacing of the content */
  pacing: Pacing;
  
  /** Caption/text style */
  captionStyle: CaptionStyle;
  
  /** Energy level */
  energy: EnergyLevel;
  
  /** Ordered preference list of beat primitives */
  beats: BeatPrimitive[];
  
  /** Optional format hints */
  formatHints?: FormatHints;
  
  /** Safety flags detected */
  safetyFlags: SafetyFlag[];
  
  /** Recommended aspect ratio */
  recommendedAspect: string;
  
  /** Recommended duration in seconds */
  recommendedDurationSec: number;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Extraction method used */
  extractionMethod: 'heuristic' | 'llm' | 'hybrid';
  
  /** Keywords that influenced the extraction */
  matchedKeywords?: string[];
  
  /** Hashtags that influenced the extraction */
  matchedHashtags?: string[];
}

/**
 * Template suggestion result
 */
export interface TemplateSuggestion {
  templateId: string;
  displayName: string;
  score: number;
  reasons: string[];
  matchedBeats: BeatPrimitive[];
  matchedHookTypes: string[];
  matchedEnergyTags: string[];
  matchedPacingTags: string[];
  riskCompatible: boolean;
  durationCompatible: boolean;
}

/**
 * Template suggestion request
 */
export interface SuggestTemplatesRequest {
  /** Either provide a trend signal ID or raw features */
  trendSignalId?: string;
  features?: TrendFeatures;
  
  /** Number of suggestions to return */
  topN?: number;
  
  /** Filter by tenant */
  tenantId?: string;
  
  /** Filter by risk profile */
  maxRiskProfile?: RiskProfile;
}

/**
 * Template suggestion response
 */
export interface SuggestTemplatesResponse {
  suggestions: TemplateSuggestion[];
  featuresUsed: TrendFeatures;
  totalTemplatesScored: number;
}

/**
 * Trend signal input for ingestion
 */
export interface TrendSignalInput {
  tenantId: string;
  source: 'tiktok' | 'instagram' | 'youtube-shorts';
  capturedAt: string;
  trendName: string;
  rawText: string;
  rawMetadata: {
    likes?: number;
    plays?: number;
    shares?: number;
    comments?: number;
    hashtags?: string[];
    audio?: {
      name?: string;
      artist?: string;
      isOriginal?: boolean;
    };
    duration?: number;
    [key: string]: unknown;
  };
  notes?: string;
}

/**
 * Demo reel batch request
 */
export interface DemoReelBatchRequest {
  tenantId: string;
  trendSignalId?: string;
  templateId?: string;
  demoPetSet: string;
  count: number;
  aspectRatio?: string;
}

/**
 * Demo reel batch response
 */
export interface DemoReelBatchResponse {
  batchId: string;
  status: string;
  count: number;
  templateId: string;
  demoPetSet: string;
  createdAt: string;
}
