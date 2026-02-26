/**
 * Standard service result type for operations that can fail.
 * All service functions that perform mutations or lookups that may fail
 * should return this type instead of throwing errors.
 */
export type ServiceError = {
  type: 'validation' | 'not_found' | 'database' | 'conflict';
  message: string;
  field?: string;
  retryable?: boolean;
};

export type ServiceResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Helper to create a successful result.
 */
export function serviceOk(): ServiceResult<void>;
export function serviceOk<T>(data: T): ServiceResult<T>;
export function serviceOk(data?: unknown): ServiceResult<unknown> {
  return { success: true, data };
}

/**
 * Helper to create a failed result.
 */
export function serviceFail<T = never>(error: ServiceError): ServiceResult<T> {
  return { success: false, error };
}
