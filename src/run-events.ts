/**
 * Live run events — GET /v1/capabilities/capability-runs/{runId}/events (Server-Sent Events).
 *
 * `event: chunk` (id = seq): `{ seq, chunks }`, every chunk the executing worker
 * streamed, in order. `event: end`: `{ status }`, the capability run reached a
 * terminal status; read its result with GET /v1/capabilities/capability-runs/{runId}.
 * Resume after a sequence with the `Last-Event-ID` header (or `?after=`), exclusive.
 */
export interface RunEventChunkData {
  seq: number;
  chunks: unknown[];
}

export interface RunEventEndData {
  status: string;
}

export type RunEvent =
  | ({ type: 'chunk' } & RunEventChunkData)
  | ({ type: 'end' } & RunEventEndData);

/** A live native coding turn's narration. */
export interface CodingProgressChunk {
  type: 'coding_progress';
  text: string;
}

/**
 * One file the native coding agent changed during a live turn
 * (staff.coding-edit v2 with `liveSessionId`). Best-effort: the run's final
 * result is authoritative.
 */
export type CodingFileChunk =
  | { type: 'coding_file'; path: string; sha256: string; size: number; base64: string }
  | { type: 'coding_file'; path: string; deleted: true }
  | { type: 'coding_file'; path: string; skipped: string };
