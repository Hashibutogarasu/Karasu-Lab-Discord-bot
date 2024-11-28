// deno-lint-ignore-file
export class GeminiAPI {
  private apiKey: string;
  private model: string;
  private version: string;
  private url: string;
  constructor(apiKey: string, model: string, version: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.version = version;
    this.url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:${this.version}/?key=${this.apiKey}`;
  }

  static createClient(apiKey: string): GeminiAPI {
    return new GeminiAPI(apiKey, "gemini-1.5-flash-latest", "generateContent");
  }

  getVersion(): string {
    return this.version;
  }

  getModel(): string {
    return this.model;
  }

  async generateContent(text: string): Promise<GeminiResponse> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: text
              }
            ]
          }
        ]
      })
    });
    const json = await response.json();
    return GeminiResponse.fromJSON(json);
  }
}

class GeminiResponse {
  candidates: Candidate[];
  usageMetadata: UsageMetadata;
  modelVersion: string;

  constructor(candidates: Candidate[], usageMetadata: UsageMetadata, modelVersion: string) {
    this.candidates = candidates;
    this.usageMetadata = usageMetadata;
    this.modelVersion = modelVersion;
  }

  // deno-lint-ignore no-explicit-any
  static fromJSON(json: any): GeminiResponse {
    const candidates: Candidate[] = [];
    for (const candidate of json.candidates) {
      const content = new Content(candidate.content.parts, candidate.content.role);
      candidates.push(new Candidate(content, candidate.finishReason, candidate.avgLogprobs));
    }
    const usageMetadata = new UsageMetadata(json.usageMetadata.promptTokenCount, json.usageMetadata.candidatesTokenCount, json.usageMetadata.totalTokenCount);
    return new GeminiResponse(candidates, usageMetadata, json.modelVersion);
  }
}

class Candidate {
  content: Content;
  finishReason: string;
  avgLogprobs: number;

  constructor(content: Content, finishReason: string, avgLogprobs: number) {
    this.content = content;
    this.finishReason = finishReason;
    this.avgLogprobs = avgLogprobs;
  }
}

class Content {
  parts: Part[];
  role: string;

  constructor(parts: Part[], role: string) {
    this.parts = parts;
    this.role = role;
  }
}

class Part {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

class UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;

  constructor(promptTokenCount: number, candidatesTokenCount: number, totalTokenCount: number) {
    this.promptTokenCount = promptTokenCount;
    this.candidatesTokenCount = candidatesTokenCount;
    this.totalTokenCount = totalTokenCount;
  }
}