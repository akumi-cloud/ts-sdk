// AUTO-GENERATED runtime, copied by akumi/codegen. Do not edit by hand.

import { mapError } from "../errors.js";
import { parseSseChunk, parseSseLine } from "../streaming/sse.js";
import { resolveConfig, type ClientConfig, type ResolvedConfig } from "./config.js";

/**
 * Builds and sends HTTP requests for the SDK: bearer auth, JSON encoding,
 * status-to-error mapping, retries with backoff, and incremental SSE reads.
 * The API key is sent only on the Authorization header and never logged.
 */
export class Transport {
  private readonly config: ResolvedConfig;

  constructor(config: ClientConfig) {
    this.config = resolveConfig(config);
  }

  async request(
    method: string,
    path: string,
    query: Record<string, unknown> | null,
    body: Record<string, unknown> | null,
  ): Promise<Record<string, unknown>> {
    const response = await this.dispatch(method, path, query, body, false);
    const text = await response.text();
    if (text === "") {
      return {};
    }
    const decoded: unknown = JSON.parse(text);
    return typeof decoded === "object" && decoded !== null
      ? (decoded as Record<string, unknown>)
      : {};
  }

  async *stream(
    method: string,
    path: string,
    body: Record<string, unknown> | null,
  ): AsyncGenerator<Record<string, unknown>> {
    const response = await this.dispatch(method, path, null, body, true);
    const stream = response.body;
    if (stream === null) {
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const events: Record<string, unknown>[] = [];
    let buffer = "";

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, (event) => events.push(event));
        while (events.length > 0) {
          yield events.shift() as Record<string, unknown>;
        }
      }
    } finally {
      reader.releaseLock();
    }

    const event = parseSseLine(buffer.replace(/\r$/, ""));
    if (event !== null) {
      yield event;
    }
  }

  private async dispatch(
    method: string,
    path: string,
    query: Record<string, unknown> | null,
    body: Record<string, unknown> | null,
    stream: boolean,
  ): Promise<Response> {
    let url = this.config.baseUrl.replace(/\/$/, "") + path;
    if (query !== null) {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== null && value !== undefined) {
          search.append(key, String(value));
        }
      }
      const queryString = search.toString();
      if (queryString !== "") {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      Accept: stream ? "text/event-stream" : "application/json",
    };

    const init: RequestInit = { method, headers };
    if (body !== null) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let attempt = 0;
    for (;;) {
      const response = await fetch(url, init);
      if (response.status < 400) {
        return response;
      }

      const shouldRetry =
        attempt < this.config.maxRetries && this.config.retryOn.includes(response.status);
      if (shouldRetry) {
        attempt += 1;
        await delay(250 * 2 ** (attempt - 1));
        continue;
      }

      const text = await response.text();
      let parsed: Record<string, unknown> = {};
      if (text !== "") {
        const decoded: unknown = safeJsonParse(text);
        if (typeof decoded === "object" && decoded !== null) {
          parsed = decoded as Record<string, unknown>;
        }
      }
      throw mapError(response.status, parsed);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
