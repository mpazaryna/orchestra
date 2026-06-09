export type ArtifactStatus = 'draft' | 'review' | 'done' | 'deferred';

export interface ArtifactFrontmatter {
  status: ArtifactStatus;
  stage: string;
  ticket?: string;
  title?: string;
}

// Derive pipeline state from frontmatter — no KV needed.
export function deriveStage(frontmatter: ArtifactFrontmatter): string {
  return frontmatter.stage;
}

export function isBlocked(frontmatter: ArtifactFrontmatter): boolean {
  return frontmatter.status === 'draft';
}

export function isDone(frontmatter: ArtifactFrontmatter): boolean {
  return frontmatter.status === 'done';
}
