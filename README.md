# mcp-jira

JIRA の Issue 検索・詳細取得機能を提供する MCP サーバー。

## インストール

### ソースからビルド

```bash
git clone https://github.com/tjun1/mcp-jira.git
cd mcp-jira
./install.sh
```

`~/.local/bin/mcp-jira` にバイナリがインストールされる。

**前提条件**: [Bun](https://bun.sh/) がインストールされていること。

## セットアップ

### Atlassian API トークンの取得

1. [Atlassian API トークン管理ページ](https://id.atlassian.com/manage-profile/security/api-tokens) にアクセス
2. 「API トークンを作成」をクリック
3. トークンに名前を付けて「作成」
4. 表示されたトークンをコピーして安全に保管（再表示不可）

### プロジェクトキーの確認方法

JIRA の Issue を開き、Issue キーを確認する：

```
PROJ-123
^^^^
これがプロジェクトキー
```

または、プロジェクト設定 → プロジェクトの詳細 で確認できる。

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `JIRA_BASE_URL` | ○ | JIRA の URL（例: `https://your-domain.atlassian.net`） |
| `JIRA_EMAIL` | △ | Atlassian アカウントのメールアドレス |
| `JIRA_API_TOKEN` | △ | Atlassian API トークン |
| `JIRA_BEARER_TOKEN` | △ | Bearer トークン（Email + API Token の代わりに使用可） |
| `JIRA_DEFAULT_PROJECTS` | - | 検索対象のプロジェクトをカンマ区切りで指定（例: `PROJ1,PROJ2`） |

**認証方式**: `JIRA_EMAIL` + `JIRA_API_TOKEN`（Basic認証）または `JIRA_BEARER_TOKEN` のいずれかが必要。

## MCP クライアントへの設定

### グローバル設定（~/.claude/）

すべてのプロジェクトで使いたい場合、`~/.claude/claude_desktop_config.json` に設定する：

```json
{
  "mcpServers": {
    "jira": {
      "command": "/Users/your-name/.local/bin/mcp-jira",
      "args": [],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token",
        "JIRA_DEFAULT_PROJECTS": "PROJ1,PROJ2"
      }
    }
  }
}
```

### プロジェクトローカル設定（.mcp.json）

特定のプロジェクトでのみ使いたい場合、プロジェクトルートに `.mcp.json` を作成する：

```json
{
  "mcpServers": {
    "jira": {
      "command": "/Users/your-name/.local/bin/mcp-jira",
      "args": [],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token",
        "JIRA_DEFAULT_PROJECTS": "PROJECT"
      }
    }
  }
}
```

### .mcp.json をバージョン管理しない

`.mcp.json` には API トークンなどの認証情報が含まれるため、**絶対にバージョン管理に含めてはいけない**。

`.gitignore` に追加：

```
.mcp.json
```

チームで設定を共有したい場合は、`.mcp.json.example` のようなテンプレートファイルを用意し、各自がコピーして使う運用にする。

## 利用可能なツール

MCP クライアント（Claude など）に対して、ツール名を明示して指示するのが基本。
ただし、会話の文脈から判断してくれることもあるため、必須ではない。

### jira_search

JIRA の Issue を JQL で検索する。

**引数:**
- `jql`: JQL クエリ（必須）
- `maxResults`: 取得件数（1-100、デフォルト10）
- `startAt`: 開始位置（ページネーション用）

**デフォルトプロジェクトフィルタリング:**

環境変数 `JIRA_DEFAULT_PROJECTS` に設定したプロジェクトが自動的にフィルタ条件に追加される。

例：`JIRA_DEFAULT_PROJECTS=PROJ1,PROJ2` の場合

```jql
status = Open
↓ 自動的に以下に変換される
(status = Open) AND project in (PROJ1, PROJ2)
```

ORDER BY 句も正しく処理される：

```jql
status = Open order by created desc
↓
(status = Open) AND project in (PROJ1, PROJ2) order by created desc
```

**使い方の例:**
- 「jira_search を使って未完了のチケットを探して」
- 「jira_search で最近更新された Issue を検索して」
- 「status = Open AND assignee = currentUser() で検索して」

### jira_get_issue

Issue の詳細情報を取得する。

**引数:**
- `issueIdOrKey`: Issue キーまたはID（必須、例: `PROJ-123`）
- `expand`: 展開フィールド（デフォルト: `renderedFields,names`）
- `maxChars`: 最大文字数（1000-200000、デフォルト20000）

**返却内容:**
- Issue の基本情報（Key, Summary, Status, Assignee等）
- Description（Markdown 形式に変換）
- Comments
- Attachments

**使い方の例:**
- 「jira_get_issue で PROJ-123 の詳細を見せて」
- 「jira_get_issue でそのチケットの内容を取得して」

## 開発者向け情報

### 開発環境のセットアップ

```bash
git clone https://github.com/tjun1/mcp-jira.git
cd mcp-jira
bun install
```

### 環境変数の設定

`.env` ファイルを作成（Bun が自動で読み込む）：

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_DEFAULT_PROJECTS=PROJ1,PROJ2
```

### 実行

```bash
bun run src/index.ts
```

### テスト

```bash
bun test
```

## License

MIT License. See [LICENSE](./LICENSE) for details.
