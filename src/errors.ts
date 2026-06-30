// AUTO-GENERATED runtime, copied by akumi/codegen. Do not edit by hand.

export class AkumiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ApiError extends AkumiError {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(message: string, status: number, body: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export class AuthenticationError extends ApiError {}

export class RateLimitError extends ApiError {}

export class InvalidRequestError extends ApiError {}

function messageFor(status: number, body: Record<string, unknown>): string {
  const error = body.error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") {
      return message;
    }
  }
  return `HTTP ${status}`;
}

export function mapError(status: number, body: Record<string, unknown>): ApiError {
  const message = messageFor(status, body);
  if (status === 401 || status === 403) {
    return new AuthenticationError(message, status, body);
  }
  if (status === 429) {
    return new RateLimitError(message, status, body);
  }
  if (status >= 400 && status < 500) {
    return new InvalidRequestError(message, status, body);
  }
  return new ApiError(message, status, body);
}
