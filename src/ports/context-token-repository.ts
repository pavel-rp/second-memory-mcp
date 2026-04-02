export interface ContextTokenRepository {
  create(ttlMs: number): Promise<string>;
  validate(token: string): Promise<boolean>;
  validateWithStatus(token: string): Promise<{ valid: boolean; expired: boolean }>;
  delete(token: string): Promise<void>;
  deleteExpired(before: number): Promise<number>;
}
