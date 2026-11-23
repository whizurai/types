/** Canonical GET /v1/workflow-runs query. Org/app scope comes from authentication. */
export interface ListRunsOptions {
  capabilityId?: string;
  capabilitySlug?: string;
  status?: string;
  /** Integer 1..100; defaults to 50. */
  limit?: number;
  /** Cursor returned by the previous page; native run-ledger timestamp cursor. */
  cursor?: string;
}

/** Fields every listed run exposes. The gateway may add ledger metadata. */
export interface RunListItem {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  capabilityId?: string | null;
  appId?: string;
  customerId?: string;
  workflowSlug?: string;
}

export interface ListRunsResponse<T extends RunListItem = RunListItem> {
  runs: T[];
  /** Optional for compatibility; this list does not require a separate count scan. */
  total?: number;
  nextCursor?: string | null;
}
