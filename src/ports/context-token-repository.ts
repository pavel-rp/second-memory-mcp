export interface ContextTokenRepository {
  create(ttlMs: number): Promise<string>;
  validate(token: string): Promise<boolean>;
  cleanup(token: string): Promise<void>;
}
