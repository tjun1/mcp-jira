---
name: jira-transition
description: JIRAのIssueのステータスを変更する
argument-hint: [Issue キー] [トランジションID]
---

`jira_transition_issue` ツールを使用して、JIRAのIssueのステータスを変更してください。

## 使い方

Issue キーとトランジションIDを指定してステータスを変更：

```
まず jira_get_transitions ツールで「$ARGUMENTS」の利用可能なトランジションを取得し、
適切なトランジションIDを使用して jira_transition_issue ツールでステータスを変更
```

## 実行手順

1. `jira_get_transitions` で利用可能なトランジションIDを確認
2. 適切なトランジションIDを選択
3. `jira_transition_issue` で実行

## 注意事項

- Issue キーの形式: `PROJECT-番号`（例: `ME-382`）
- トランジションIDは数値（例: "11", "21"）
- 必ず事前に `jira_get_transitions` で利用可能なトランジションを確認すること
- 権限がない場合や、ワークフローで許可されていないトランジションは実行できません
