import { JiraClient } from "./jira";

// 環境変数から設定を読み込む（Bunが.envを自動読み込み）
const baseUrl = Bun.env.JIRA_BASE_URL;
const email = Bun.env.JIRA_EMAIL;
const apiToken = Bun.env.JIRA_API_TOKEN;
const defaultProjects = Bun.env.JIRA_DEFAULT_PROJECTS?.split(",").map(s => s.trim()) ?? [];

if (!baseUrl || !email || !apiToken) {
  console.error("エラー: 環境変数が設定されていません");
  console.error("JIRA_BASE_URL:", baseUrl);
  console.error("JIRA_EMAIL:", email);
  console.error("JIRA_API_TOKEN:", apiToken ? "設定済み" : "未設定");
  process.exit(1);
}

console.log("=== JIRA 接続テスト ===");
console.log("Base URL:", baseUrl);
console.log("Email:", email);
console.log("Default Projects:", defaultProjects);
console.log();

const client = new JiraClient(baseUrl, {
  kind: "basic",
  email,
  apiToken,
});

// テスト1: Issue検索
console.log("テスト1: Issue検索");
const jql = defaultProjects.length > 0
  ? `project in (${defaultProjects.join(", ")}) order by created DESC`
  : "project is not EMPTY order by created DESC";
console.log("JQL:", jql);
try {
  const searchResult = await client.searchIssues({
    jql,
    maxResults: 5,
  });

  console.log("レスポンス構造:", JSON.stringify(searchResult, null, 2).slice(0, 1000));
  console.log();
  console.log(`✅ 検索成功: ${searchResult.issues?.length ?? 0} 件のIssueを取得`);
  console.log(`  nextPageToken: ${searchResult.nextPageToken ? "あり" : "なし"}`);
  console.log(`  isLast: ${searchResult.isLast}`);
  console.log(`取得したIssue:`);

  for (const issue of searchResult.issues ?? []) {
    console.log(`  - ${issue.key}: ${issue.fields?.summary}`);
  }
  console.log();

  // テスト2: Issue詳細取得（最初のIssueがあれば）
  if (searchResult.issues && searchResult.issues.length > 0) {
    const firstIssueKey = searchResult.issues[0].key;
    console.log(`テスト2: Issue詳細取得 (${firstIssueKey})`);

    const issue = await client.getIssue({
      issueIdOrKey: firstIssueKey,
    });

    console.log(`✅ 取得成功: ${issue.key}`);
    console.log(`  Summary: ${issue.fields?.summary}`);
    console.log(`  Status: ${issue.fields?.status?.name}`);
    console.log(`  Assignee: ${issue.fields?.assignee?.displayName ?? "Unassigned"}`);
    console.log(`  Description: ${issue.fields?.description ? "あり" : "なし"}`);
    console.log();
  }

  console.log("=== 全てのテストが成功しました ✅ ===");
} catch (error) {
  console.error("❌ エラー:", error);
  process.exit(1);
}
