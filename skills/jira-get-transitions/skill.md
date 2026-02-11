---
name: jira-get-transitions
description: JIRAのIssueで利用可能なステータス遷移を取得する
argument-hint: [Issue キー]
---

`jira_get_transitions` ツールを使用して、JIRAのIssueで利用可能なステータス遷移（トランジション）を取得してください。

## 使い方

Issue キー（例: PROJ-123）を指定してトランジション一覧を取得：

```
jira_get_transitions ツールを使用して「$ARGUMENTS」の利用可能なトランジションを取得
```

## 取得される情報

- トランジションID（ステータス変更時に使用）
- トランジション名（例: "Start Progress", "Done"）
- 遷移先ステータス（ID と名前）

## 使用例

1. ステータスを変更する前に、利用可能なトランジションを確認
2. トランジションIDを取得して、`jira_transition_issue` で実行

## 注意事項

- Issue キーの形式: `PROJECT-番号`（例: `ME-382`）
- 権限がない Issue や操作ができない場合は取得できません
- Issueの現在のステータスによって、利用可能なトランジションが異なります
