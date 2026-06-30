// AUTO-GENERATED runtime, copied by akumi/codegen. Do not edit by hand.

export const DONE_SENTINEL = "[DONE]";

/**
 * Parse complete SSE lines out of a buffer, invoking onEvent for each decoded
 * `data:` JSON payload (skipping blank payloads and the [DONE] sentinel).
 * Returns the unconsumed remainder (a partial trailing line) for the next read.
 */
export function parseSseChunk(
  buffer: string,
  onEvent: (event: Record<string, unknown>) => void,
): string {
  let rest = buffer;
  let newlineIndex = rest.indexOf("\n");

  while (newlineIndex !== -1) {
    const line = rest.slice(0, newlineIndex).replace(/\r$/, "");
    rest = rest.slice(newlineIndex + 1);

    const event = parseSseLine(line);
    if (event !== null) {
      onEvent(event);
    }

    newlineIndex = rest.indexOf("\n");
  }

  return rest;
}

/**
 * Decode a single SSE line. Returns the parsed event object, or null when the
 * line is not a data line, is empty, or is the [DONE] sentinel.
 */
export function parseSseLine(line: string): Record<string, unknown> | null {
  if (!line.startsWith("data:")) {
    return null;
  }

  const data = line.slice(5).trim();
  if (data === "" || data === DONE_SENTINEL) {
    return null;
  }

  return JSON.parse(data) as Record<string, unknown>;
}
