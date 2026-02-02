# mcp-jira

JIRA の Issue 検索・詳細取得機能を提供する MCP サーバー。

## インストール

### バイナリをダウンロード

[Releases ページ](https://github.com/tjun1/mcp-jira/releases) から環境に合ったバイナリをダウンロード：

| プラットフォーム | ファイル名 |
|------------------|------------|
| macOS (Apple Silicon) | `mcp-jira-darwin-arm64` |
| Linux (x64) | `mcp-jira-linux-x64` |
| Windows (x64) | `mcp-jira-windows-x64.exe` |

ダウンロード後、PATH の通った場所に配置して実行権限を付与：

```bash
chmod +x mcp-jira-*
mv mcp-jira-* ~/.local/bin/mcp-jira
```

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

リポジトリには `mcp.example.json` が含まれています。これをコピーして使用してください：

```bash
cp mcp.example.json .mcp.json
# .mcp.json を編集して、自分の環境に合わせて設定
```

### VSCode + GitHub Copilot

VSCode の GitHub Copilot から mcp-jira を利用できる。

**前提条件:**
- VS Code 1.102 以降
- GitHub Copilot 拡張機能
- GitHub Copilot Chat 拡張機能

#### セットアップ手順

プロジェクトルートに `.vscode/mcp.json` を作成する。設定方法は2つある。

##### 方法1: シンプルな設定（inputs 不使用）

API トークンを設定ファイルに直接記述する方法。

**手順:**

1. `.vscode` ディレクトリを作成（存在しない場合）
   ```bash
   mkdir -p .vscode
   ```

2. `.vscode/mcp.json` を作成して以下を記述
   ```json
   {
     "servers": {
       "jira": {
         "command": "$HOME/.local/bin/mcp-jira",
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

3. VSCode を再起動
4. GitHub Copilot Chat から `@jira` として利用可能

##### 方法2: 推奨設定（inputs 使用）

API トークンを起動時にプロンプトで入力する方法。認証情報がファイルに残らないため安全。

**手順:**

1. `.vscode` ディレクトリを作成（存在しない場合）
   ```bash
   mkdir -p .vscode
   ```

2. `.vscode/mcp.json` を作成して以下を記述
   ```json
   {
     "inputs": {
       "jiraApiToken": {
         "type": "promptString",
         "password": true,
         "description": "JIRA API Token"
       }
     },
     "servers": {
       "jira": {
         "command": "$HOME/.local/bin/mcp-jira",
         "args": [],
         "env": {
           "JIRA_BASE_URL": "https://your-domain.atlassian.net",
           "JIRA_EMAIL": "your-email@example.com",
           "JIRA_API_TOKEN": "${input:jiraApiToken}",
           "JIRA_DEFAULT_PROJECTS": "PROJ1,PROJ2"
         }
       }
     }
   }
   ```

3. VSCode を再起動
4. GitHub Copilot を使用する際、API トークンの入力プロンプトが表示される（`password: true` により入力内容は隠される）

##### サンプルファイルの利用

プロジェクトルートの `mcp.vscode.example.json` をコピーして使うこともできる：

```bash
mkdir -p .vscode
cp mcp.vscode.example.json .vscode/mcp.json
# エディタで .vscode/mcp.json を開いて環境に合わせて編集
```

#### Claude Desktop との形式の違い

| 項目 | Claude Desktop | VSCode |
|------|----------------|--------|
| 設定ファイル | `~/.claude/claude_desktop_config.json` または `.mcp.json` | `.vscode/mcp.json` |
| ルートキー | `mcpServers` | `servers` |
| command | 絶対パスが必要 | `$HOME` 変数が使える |
| 機密情報 | env に直接記述 | inputs で変数化可能 |

#### 注意事項

- `.vscode/mcp.json` には認証情報が含まれるため、バージョン管理から除外すること（`.gitignore` に追加済み）
- チームで設定を共有する場合は、各自が `mcp.vscode.example.json` をコピーして `.vscode/mcp.json` を作成する運用にする

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

## Claude Code Skills

Claude Code で使える便利なスキル（スラッシュコマンド）を提供しています。

### インストール方法

#### リリースからインストール（推奨）

```bash
# スキルをダウンロードして展開
curl -L -o skills.tar.gz https://github.com/tjun1/mcp-jira/releases/latest/download/skills.tar.gz
mkdir -p ~/.claude/skills
tar -xzf skills.tar.gz -C ~/.claude/skills
rm skills.tar.gz
```

#### ソースからインストール

```bash
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

### 利用可能なスキル

| スキル | 説明 | 使い方 |
|--------|------|--------|
| `/jira-search` | JQLでIssueを検索 | `/jira-search status != Done` |
| `/jira-get` | Issue詳細を取得 | `/jira-get PROJ-123` |
| `/jira-list-open` | 未完了チケット一覧 | `/jira-list-open` |
| `/jira-my-issues` | 自分のチケット一覧 | `/jira-my-issues` |

### スキルの使い方

Claude Code で `/` を入力すると、利用可能なスキル一覧が表示されます。

例：
```
/jira-search priority = High AND status != Done
/jira-get ME-382
/jira-list-open
/jira-my-issues
```

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
