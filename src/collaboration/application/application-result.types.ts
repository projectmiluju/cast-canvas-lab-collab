export interface SuccessResult<T> {
  ok: true;
  message: T;
}

export interface FailureResult {
  ok: false;
  code: string;
  message: string;
}

export type Result<T> = SuccessResult<T> | FailureResult;
