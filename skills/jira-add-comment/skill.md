---
name: jira-add-comment
description: JIRAのIssueにコメントを追加する
argument-hint: [Issue キー] [コメント内容]
---

`jira_add_comment` ツールを使用して、JIRAのIssueにコメントを追加してください。

## 使い方

Issue キーとコメント内容を指定してコメントを追加：

```
jira_add_comment ツールを使用して「[Issue キー]」に「[コメント内容]」というコメントを追加
```

## 例

```
jira_add_comment ツールを使用して「ME-382」に「レビュー完了しました」というコメントを追加
```

## 取得される情報

- コメントID
- コメント作成者
- 作成日時

## 注意事項

- Issue キーの形式: `PROJECT-番号`（例: `ME-382`）
- コメントはプレーンテキスト形式
- 権限がない Issue にはコメントできません
- 追加されたコメントは JIRA 上で他のユーザーにも表示されます
