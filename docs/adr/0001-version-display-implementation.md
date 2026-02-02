# ADR 0001: バージョン表示機能の実装

## ステータス

Accepted (2026-02-02)

## コンテキスト

mcp-jira はバイナリ形式で配布されており、ユーザーがインストール済みのバージョンを確認する手段が必要である。特に以下の理由から、バージョン表示機能の実装が求められた：

1. サポート時にユーザーの環境を確認する必要がある
2. 更新確認の基準として使いたい
3. 一般的な CLI ツールの規約（`-v` / `--version`）に準拠したい

## 決定事項

### 1. バージョン情報の管理方法

**package.json から読み込む方式を採用**

```typescript
import pkg from "../package.json";

const args = Bun.argv.slice(2);
if (args.includes("-v") || args.includes("--version")) {
  console.log(pkg.version);
  process.exit(0);
}
```

### 2. コマンドライン引数のチェック方法

**`Bun.argv.slice(2)` で実際の引数のみをチェック**

- `Bun.argv[0]`: 実行ファイルパス
- `Bun.argv[1]`: スクリプトファイルパス
- `Bun.argv[2]以降`: 実際のコマンドライン引数

実際の引数のみをチェックすることで、実行パスに "-v" が含まれる場合の誤動作を防止する。

### 3. MCP サーバーとしての互換性

バージョンチェックはプロセス起動時の `argv` のみを対象とし、MCP プロトコルの stdin 通信には影響しない：

- **argv**: プロセス起動時に一度だけ決定される（`mcp-jira -v` など）
- **stdin**: 起動後に継続的に受け取る JSON-RPC メッセージ（MCP 通信）

Claude Desktop などの MCP クライアントから起動される場合、引数なしで起動されるため、通常の MCP サーバーとして動作する。

## 代替案

### 案B: ハードコード方式

```typescript
const VERSION = "0.1.3"; // 手動更新
```

**不採用の理由**:
- バージョン情報が二箇所に存在する（package.json とソースコード）
- 更新忘れのリスクが高い
- リリース時に手動で更新が必要

### 案C: ビルド時に環境変数で埋め込む

```typescript
const VERSION = process.env.VERSION || "dev";
```

ビルドスクリプト:
```bash
VERSION=$(jq -r .version package.json) bun build --compile ...
```

**不採用の理由**:
- 案 A（package.json）で問題なく動作する
- ビルドスクリプトの複雑化が不要

## 結果

### メリット

1. **バージョン管理の一元化**: package.json が唯一の真実（Single Source of Truth）
2. **更新忘れの防止**: タグ作成時に package.json を更新すれば自動的に反映される
3. **MCP デグレなし**: 引数なしで起動時は通常の MCP サーバーとして動作
4. **Bun のネイティブサポート**: JSON インポートが公式サポートされており、`bun build --compile` でも正しくバンドルされる

### デメリット

- 特になし（検証済み）

## 検証

以下の動作確認を実施：

1. ローカル実行: `bun run src/index.ts -v` → `0.1.3` 表示 ✓
2. ビルド後: `./mcp-jira -v` → `0.1.3` 表示 ✓
3. MCP サーバーとして起動: 引数なしで正常に stdio 待機 ✓

## 参照

- package.json: バージョン情報の定義
- src/index.ts: バージョン表示の実装
