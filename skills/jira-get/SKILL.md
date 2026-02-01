---
name: jira-get
description: JIRAのIssue詳細を取得する
argument-hint: [Issue キー]
---

`jira_get_issue` ツールを使用してJIRAのIssue詳細を取得してください。

## 使い方

Issue キー（例: PROJ-123）を指定して詳細を取得：

```
jira_get_issue ツールを使用して「$ARGUMENTS」の詳細を取得
```

## 取得される情報

- Issue の基本情報（Key, Summary, Status, Assignee, Reporter）
- 作成日時・更新日時
- Description（Markdown形式に変換済み）
- Comments（コメント一覧）
- Attachments（添付ファイル一覧）

## 注意事項

- Issue キーの形式: `PROJECT-番号`（例: `ME-382`）
- 権限がない Issue は取得できません
- デフォルトで最大20000文字まで表示（変更可能）
