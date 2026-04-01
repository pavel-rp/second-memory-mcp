export interface ContextTokenRepository {
  create(ttlMs: number): Promise<string>;
  validate(token: string): Promise<boolean>;
  delete(token: string): Promise<void>;
}
