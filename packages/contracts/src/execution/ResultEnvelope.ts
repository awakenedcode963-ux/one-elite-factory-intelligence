export interface ResultEnvelope<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
}
