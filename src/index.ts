import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {JiraClient} from "./jira";

function requireEnv(name: string) {
  const v = Bun.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// ADF (Atlassian Document Format) を Markdown に変換
export function adfToMarkdown(adf: any): string {
  if (!adf || typeof adf !== "object") return "";

  const type = adf.type;
  const content = adf.content ?? [];

  switch (type) {
    case "doc":
      return content.map((node: any) => adfToMarkdown(node)).join("");

    case "paragraph":
      return content.map((node: any) => adfToMarkdown(node)).join("") + "\n\n";

    case "heading": {
      const level = adf.attrs?.level ?? 1;
      const hashes = "#".repeat(Math.min(level, 6));
      const text = content.map((node: any) => adfToMarkdown(node)).join("");
      return `${hashes} ${text}\n\n`;
    }

    case "bulletList": {
      return content.map((item: any) => {
        const text = adfToMarkdown(item).trim();
        return `- ${text}\n`;
      }).join("") + "\n";
    }

    case "orderedList": {
      return content.map((item: any, idx: number) => {
        const text = adfToMarkdown(item).trim();
        return `${idx + 1}. ${text}\n`;
      }).join("") + "\n";
    }

    case "listItem":
      return content.map((node: any) => adfToMarkdown(node)).join("").trim();

    case "codeBlock": {
      const lang = adf.attrs?.language ?? "";
      const code = content.map((node: any) => adfToMarkdown(node)).join("");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case "text": {
      let text = adf.text ?? "";
      const marks = adf.marks ?? [];

      for (const mark of marks) {
        switch (mark.type) {
          case "strong":
            text = `**${text}**`;
            break;
          case "em":
            text = `*${text}*`;
            break;
          case "code":
            text = `\`${text}\``;
            break;
          case "link":
            const href = mark.attrs?.href ?? "";
            text = `[${text}](${href})`;
            break;
        }
      }

      return text;
    }

    case "hardBreak":
      return "\n";

    // 対応しない要素はそのまま再帰的に処理
    default:
      return content.map((node: any) => adfToMarkdown(node)).join("");
  }
}

// Issue詳細を読みやすいテキスト形式に整形
export function formatIssueAsText(data: any, baseUrl: string, maxChars: number): string {
  const key = data?.key ?? "";
  const summary = data?.fields?.summary ?? "(no summary)";
  const url = key ? `${baseUrl}/browse/${key}` : "";
  const project = data?.fields?.project?.name ?? data?.fields?.project?.key ?? "";
  const status = data?.fields?.status?.name ?? "";
  const assignee = data?.fields?.assignee?.displayName ?? "Unassigned";
  const reporter = data?.fields?.reporter?.displayName ?? "";
  const created = data?.fields?.created ?? "";
  const updated = data?.fields?.updated ?? "";

  // ヘッダー部分
  let output = `# [${key}] ${summary}\n`;
  if (url) output += `URL: ${url}\n`;
  if (project) output += `Project: ${project}\n`;
  if (status) output += `Status: ${status}\n`;
  if (assignee) output += `Assignee: ${assignee}\n`;
  if (reporter) output += `Reporter: ${reporter}\n`;
  if (created) output += `Created: ${created}\n`;
  if (updated) output += `Updated: ${updated}\n`;
  output += "\n";

  // Description
  const description = data?.fields?.description;
  if (description) {
    output += "## Description\n";
    const descText = typeof description === "string"
      ? description
      : adfToMarkdown(description);
    output += descText.trim() + "\n\n";
  }

  // Comments
  const comments = data?.fields?.comment?.comments ?? [];
  if (comments.length > 0) {
    output += `## Comments (${comments.length})\n`;
    for (const comment of comments) {
      const author = comment.author?.displayName ?? "Unknown";
      const created = comment.created ?? "";
      const body = comment.body;
      const bodyText = typeof body === "string"
        ? body
        : adfToMarkdown(body);
      output += `- ${created} by ${author}:\n  ${bodyText.trim().replace(/\n/g, "\n  ")}\n\n`;
    }
  }

  // Attachments
  const attachments = data?.fields?.attachment ?? [];
  if (attachments.length > 0) {
    output += `## Attachments (${attachments.length})\n`;
    for (const att of attachments) {
      const filename = att.filename ?? "unknown";
      const size = att.size ? `${Math.round(att.size / 1024)} KB` : "";
      output += `- ${filename}${size ? ` (${size})` : ""}\n`;
    }
    output += "\n";
  }

  // 文字数制限
  if (output.length > maxChars) {
    return output.slice(0, maxChars) + "\n...[truncated]";
  }

  return output;
}

const baseUrl = requireEnv("JIRA_BASE_URL");
const bearer = Bun.env["JIRA_BEARER_TOKEN"];

const client = bearer
  ? new JiraClient(baseUrl, {kind: "bearer", token: bearer})
  : new JiraClient(baseUrl, {
    kind: "basic",
    email: requireEnv("JIRA_EMAIL"),
    apiToken: requireEnv("JIRA_API_TOKEN"),
  });

const defaultProjects = Bun.env["JIRA_DEFAULT_PROJECTS"]
  ?.split(",")
  .map(s => s.trim())
  .filter(Boolean) ?? [];

export function buildJqlWithProjects(userJql: string, projects: string[]): string {
  if (!projects.length) return userJql;

  // ORDER BY句を分離（大文字小文字不問、複数フィールド対応）
  const orderByRegex = /\s+order\s+by\s+[\w.]+(?:\s+(?:asc|desc))?(?:\s*,\s*[\w.]+(?:\s+(?:asc|desc))?)*$/i;
  const match = userJql.match(orderByRegex);

  const conditions = match ? userJql.slice(0, match.index) : userJql;
  const orderBy = match ? match[0] : "";

  const projectFilter = `project in (${projects.join(", ")})`;

  return `(${conditions}) AND ${projectFilter}${orderBy}`;
}

function buildJql(userJql: string): string {
  return buildJqlWithProjects(userJql, defaultProjects);
}

const server = new McpServer({name: "mcp-jira", version: "0.1.0"});

server.tool(
  "jira_search",
  "Search JIRA issues by JQL. Returns list of issues with key, summary, status, assignee, etc.",
  {
    jql: z.string().min(1),
    maxResults: z.number().int().min(1).max(100).optional(),
    startAt: z.number().int().min(0).optional(),
  },
  async ({ jql, maxResults, startAt }) => {
    const effectiveJql = buildJql(jql);
    const data = await client.searchIssues({ jql: effectiveJql, maxResults, startAt});

    const issues = (data?.issues ?? []).map((issue: any) => ({
      key: issue.key,
      summary: issue.fields?.summary,
      status: issue.fields?.status?.name,
      assignee: issue.fields?.assignee?.displayName,
      reporter: issue.fields?.reporter?.displayName,
      created: issue.fields?.created,
      updated: issue.fields?.updated,
    }));

    const payload = {
      issues,
      total: data?.total,
      startAt: data?.startAt,
      maxResults: data?.maxResults,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2)}],
    };
  },
);

server.tool(
  "jira_get_issue",
  "Get a JIRA issue by key or ID and return detailed information in readable text format.",
  {
    issueIdOrKey: z.string().min(1),
    expand: z.string().optional(),
    maxChars: z.number().int().min(1000).max(200000).optional(),
  },
  async ({issueIdOrKey, expand, maxChars}) => {
    const data = await client.getIssue({issueIdOrKey, expand: expand ?? "renderedFields,names"});

    const text = formatIssueAsText(data, baseUrl, maxChars ?? 20000);

    return {
      content: [{ type: "text", text }],
    };
  },
);

await server.connect(new StdioServerTransport());
