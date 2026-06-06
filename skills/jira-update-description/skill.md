---
name: jira-update-description
description: JIRAのIssueの概要欄（description）をMarkdownで更新する
argument-hint: [Issue キー] [Markdown形式の内容]
---

`jira_update_description` ツールを使用して、JIRAのIssueの概要欄を更新してください。

## 使い方

Issue キーと更新内容（Markdown）を指定して概要欄を上書き：

```
jira_update_description ツールを使用して「[Issue キー]」の概要欄を以下の内容に更新
[Markdown形式の内容]
```

既存の内容を読んでから編集する場合は、先に `jira_get_issue` で取得してください：

```
まず jira_get_issue で「[Issue キー]」の現在の内容を取得し、概要欄を編集して更新して
```

## 例

```
jira_update_description ツールを使用して「ME-382」の概要欄を次の内容に更新して：

## 背景
〇〇という問題がある。

## 目的
△△を実現する。
```

## 対応するMarkdown記法

- 見出し（`#` `##` `###` など）
- 段落（空行で区切る）

※ リスト・コードブロック・太字などは未対応

## 注意事項

- **既存の概要欄を完全に上書きします**（追記ではありません）
- Issue キーの形式: `PROJECT-番号`（例: `ME-382`）
- 空の内容は指定できません
- 権限がない Issue は更新できません
