export type JiraAuth =
| {kind: "basic"; email: string; apiToken: string }
| {kind: "bearer"; token: string};

export class JiraClient {
  constructor(
    private readonly baseUrl: string,
    private readonly auth: JiraAuth,
  ){}

  private makeUrl(path: string, query?: Record<string, string | number | undefined>) {
    const base = this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`;
    const p = path.replace(/^\//, "");
    const url = new URL(p, base);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  private makeHeaders() {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.auth.kind === "bearer") {
      headers.Authorization = `Bearer ${this.auth.token}`;
    } else {
      const raw = `${this.auth.email}:${this.auth.apiToken}`;
      const b64 = Buffer.from(raw, "utf8").toString("base64");
      headers.Authorization = `Basic ${b64}`;
    }
    return headers;
  }

  private async getJson<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = this.makeUrl(path, query);
    const res = await fetch(url, {headers: this.makeHeaders()});
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`JIRA API ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
    }
    return (await res.json()) as T;
  }

  async searchIssues(args: {jql: string; maxResults?: number; pageToken?: string}) {
    return this.getJson<any>("rest/api/3/search/jql", {
      jql: args.jql,
      maxResults: args.maxResults ?? 10,
      pageToken: args.pageToken,
      fields: "key,summary,status,assignee,reporter,created,updated",
    });
  }

  async getIssue(args: {issueIdOrKey: string; expand?: string}) {
    return this.getJson<any>(`rest/api/3/issue/${encodeURIComponent(args.issueIdOrKey)}`, {
      expand: args.expand ?? "renderedFields,names",
    });
  }
}
