# mcp-jira プロジェクト設定

## 基本方針

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- WebSocket is built-in. Don't use `ws`.

## Testing

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## ビルド・インストール

ローカル実行:
```bash
bun run src/index.ts
```

ビルド・インストール:
```bash
./install.sh
# → ~/.local/bin/mcp-jira にバイナリを配置
```

## git ブランチとコミットメッセージ

このリポジトリは Github Issues でタスク管理しています。

- ブランチ名には Issue 番号を使うこと（例: `issue-123-add-feature`）
- コミットメッセージには Issue 番号をプリフィックスとして含めること（例: `#123 機能追加`）
- コミットメッセージは日本語で記述すること
