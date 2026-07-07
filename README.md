# Akumi TypeScript SDK

The official TypeScript client for [Akumi](https://akumi.cloud), the
EU-sovereign, OpenAI-compatible inference API. Native `fetch`, zero runtime
dependencies. One `base_url` for every model, governed and metered, with your
regulated data kept in the EU.

- **Drop-in OpenAI-compatible.** Chat completions, embeddings, and models under one key.
- **EU-sovereign by default.** The egress guard fails closed on non-EU routing.
- **Governed, not just hosted.** PII firewall, per-request residency, and a metadata-only audit trail on every call.
- **Dependable.** Async streaming and automatic retries on transient errors.

## Requirements

Node 18 or newer.

## Install

```bash
npm install @akumi/sdk
```

## Quickstart

Create an API key under app.akumi.cloud -> Platform -> API keys:

```ts
import { Akumi } from "@akumi/sdk";

const akumi = Akumi.fromApiKey("mk_...");

const response = (await akumi.chat.create({
  model: "mistral/mistral-large-latest",
  messages: [{ role: "user", content: "Explain EU data residency in one sentence." }],
})) as { choices: { message: { content: string } }[] };

console.log(response.choices[0].message.content);
```

## Streaming

`createStreamed()` yields OpenAI-compatible chunks:

```ts
for await (const chunk of akumi.chat.createStreamed({
  model: "mistral/mistral-large-latest",
  messages: [{ role: "user", content: "Write a haiku about Frankfurt." }],
})) {
  const c = chunk as { choices: { delta: { content?: string } }[] };
  process.stdout.write(c.choices[0]?.delta?.content ?? "");
}
```

## Embeddings

```ts
const embeddings = (await akumi.embeddings.create({
  model: "mistral/mistral-embed",
  input: "The quarterly report is ready for review.",
})) as { data: { embedding: number[] }[] };

const vector = embeddings.data[0].embedding;
```

## More resources

- `akumi.models.list()` lists the models available to your key.
- `akumi.memory.forget(...)` and `akumi.memoryThreads.list()` manage long-term memory and threads.
- `akumi.auditLogs.list()` reads your metadata-only audit trail.

## Configuration

`fromApiKey()` targets `https://api.akumi.cloud/v1` and retries transient
failures (429, 502, 503, 504). Pass a config object to override the base URL,
timeout, or retry policy.

## Documentation

- Guides: https://akumi.cloud/docs
- API reference: https://akumi.cloud/docs/api-reference

## About

Generated from the Akumi OpenAPI specification, so it tracks the API
automatically. Issues: https://github.com/akumi-cloud/ts-sdk.

MIT licensed.
