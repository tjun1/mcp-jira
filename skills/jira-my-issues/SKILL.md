---
name: jira-my-issues
description: 自分に割り当てられたJIRA Issueを一覧表示する
---

`jira_search` ツールを使用して自分に割り当てられたIssueを検索してください。

## 検索クエリ

```
jira_search ツールを使用して以下のJQLで検索:
assignee = currentUser() order by updated DESC
```

## 表示内容

- Issue キー
- Summary（タイトル）
- ステータス
- 優先度
- 更新日時

## フィルタ例

自分の未完了チケットのみ：
```
assignee = currentUser() AND status != Done order by updated DESC
```

自分が作成したチケット：
```
reporter = currentUser() order by created DESC
```

自分に関連するチケット（担当者または作成者）：
```
assignee = currentUser() OR reporter = currentUser() order by updated DESC
```
