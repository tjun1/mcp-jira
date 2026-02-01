---
name: jira-list-open
description: 未完了のJIRA Issueを一覧表示する
---

`jira_search` ツールを使用して未完了のIssueを検索してください。

## 検索クエリ

```
jira_search ツールを使用して以下のJQLで検索:
status != Done order by updated DESC
```

## 表示内容

- Issue キー
- Summary（タイトル）
- ステータス
- 担当者
- 更新日時

## カスタマイズ例

特定の担当者の未完了チケット：
```
status != Done AND assignee = currentUser() order by updated DESC
```

優先度が高い未完了チケット：
```
status != Done AND priority = High order by priority DESC, updated DESC
```
