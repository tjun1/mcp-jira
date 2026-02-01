---
name: jira-search
description: JIRAのIssueをJQLで検索する
argument-hint: [JQLクエリ]
---

`jira_search` ツールを使用してJIRAのIssueを検索してください。

## 使い方

JQLクエリを指定してIssueを検索：

```
jira_search ツールを使用して「$ARGUMENTS」で検索
```

## JQLクエリの例

- 未完了のチケット: `status != Done`
- 自分のチケット: `assignee = currentUser()`
- 優先度が高いチケット: `priority = High`
- 特定プロジェクト: `project = PROJ`
- 最近更新されたチケット: `updated >= -7d order by updated DESC`

## 注意事項

- デフォルトプロジェクトフィルタが自動的に適用されます
- JQLには検索条件が必要です（`order by`のみは不可）
- 最大100件まで取得可能（デフォルト10件）
