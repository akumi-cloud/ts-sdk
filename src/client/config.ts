// AUTO-GENERATED runtime, copied by akumi/codegen. Do not edit by hand.

export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  retryOn?: number[];
}

export interface ResolvedConfig {
  apiKey: string;
  baseUrl: string;
  maxRetries: number;
  retryOn: number[];
}

export function resolveConfig(config: ClientConfig): ResolvedConfig {
  return {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl ?? "https://api.akumi.cloud",
    maxRetries: config.maxRetries ?? 2,
    retryOn: config.retryOn ?? [429, 500, 502, 503, 504],
  };
}
