# ADR 0002: チケット概要欄（description）更新機能の実装

## ステータス

Accepted (2026-06-06)

## コンテキスト

JIRA のチケット概要欄（description）を MCP ツール経由で読み書きしたいというユースケースが生まれた。
具体的には Claude Code のターミナル上でプロンプトを通じて、チケットの description を編集・更新する。

実現にあたり以下を検討した。

## 決定事項

### 1. JIRA REST API v3 の description フォーマット

**ADF (Atlassian Document Format) を使用する。**

JIRA REST API v3 は description フィールドに Markdown や HTML を直接受け付けない。
ADF は Atlassian が定義した JSON 形式のリッチテキスト表現であり、v3 API における唯一の正式フォーマットである。

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "背景" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "本文テキスト" }]
    }
  ]
}
```

### 2. 入力フォーマットと変換方式

**Markdown 文字列を受け取り、内部で ADF に変換する。**

ユーザー（および Claude）は Markdown で記述する。ADF への変換は MCP ツール内部に閉じるため、
利用者は ADF を意識しなくてよい。

変換対応範囲は **段落（paragraph）と見出し（heading）のみ** とする。

```
## 見出し  →  heading ノード (level: 2)
通常テキスト  →  paragraph ノード
空行  →  ブロックの区切り（ノードにはならない）
```

リスト・コードブロック・インラインマーク（太字・斜体）は対象外。

### 3. 変換の実装方式

**追加ライブラリなし、自前のラインパーサーで実装する。**

対応範囲が段落＋見出しのみであれば、空行でブロック分割し各ブロックの先頭を正規表現で判定するだけで実装できる。
変換実装は約 30 行程度を見込む。

既存の `adfToMarkdown`（`src/index.ts`）は逆方向（ADF→Markdown）の変換であり、今回の変換とは独立して共存する。

### 4. JIRA への書き込み方式

**`PUT /rest/api/3/issue/{issueIdOrKey}` で description フィールドを完全置換する。**

JIRA API に description の部分更新や追記 API はなく、常に全置換となる。
「既存 description に追記」が必要な場合は、まず `jira_get_issue` で現在の内容を読み、
Claude が編集した全文を `jira_update_description` で書き直す、というワークフローで対応する。

### 5. MVP スコープ

以下をスコープとする。

- Claude Code のターミナル上で description を指定して更新する

以下は今回スコープ外とする。

- Emacs 等のエディタで Markdown ファイルを編集し JIRA に反映するワークフロー
  - このユースケースには「description のみを Markdown ファイルとして取得する専用ツール」が必要になるが、
    既存の `jira_get_issue` の出力構造（メタ情報・コメントが混在）との整合を要するため別途検討する
- リスト・コードブロックの Markdown → ADF 変換
- インラインマーク（太字・斜体）の変換

## 代替案

### 案A: Markdown フル対応（自前実装）

段落・見出しに加え、リスト・コードブロック・インラインマークも自前実装する。

**不採用の理由**:
- 実装量が 3〜5 倍になり、YAGNI（今回要件外）
- ネストしたリストなどのエッジケースでバグが生まれやすい
- テスト量も増える

### 案B: Markdown 変換ライブラリの利用

`@atlaskit/editor-markdown-transformer` などを導入する。

**不採用の理由**:
- Atlaskit はパッケージが巨大であり、バイナリサイズへの影響が大きい
- サードパーティパッケージの追加には承認が必要（今回は不承認）

### 案C: ADF JSON を直接受け取る

MCP ツールの引数として ADF JSON を受け取り、変換なしで JIRA に送る。

**不採用の理由**:
- AI が ADF を生成するのは非実用的（エラーが起きやすく、利便性が低い）
- ユーザーが ADF を直接書くのも非現実的

## タスク分解

```
[1] jira.ts: putJson メソッドを追加
      ↓
[2] jira.ts: updateIssueDescription メソッドを追加（[1]に依存）

[3] index.ts: markdownToAdf 関数を追加（独立）
      ↓
[4] index.ts: jira_update_description ツールを追加（[2][3]に依存）

[5] index.test.ts: markdownToAdf の単体テスト追加
```

[1] と [3] は並行実装可能。変更ファイルは `jira.ts`・`index.ts`・`index.test.ts` の 3 ファイル。

## 注意点

- `markdownToAdf` に空文字列・見出しのみの入力を渡した場合、ADF の `content` が空になり
  JIRA API が 400 を返す可能性がある。入力バリデーションを実装に含める。
- description の更新は常に全置換であり、操作ミスで既存内容が消える。
  MCP ツールのツール説明（description）に上書き動作であることを明記する。

## 参照

- [Atlassian Document Format 公式ドキュメント](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
- [Jira Cloud platform REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- `src/jira.ts`: JiraClient の実装
- `src/index.ts`: MCP ツール定義・adfToMarkdown の実装
