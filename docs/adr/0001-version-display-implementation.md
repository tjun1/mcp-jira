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

**VERSION ファイル + Bun の `--define` フラグを採用**

```
VERSION ファイル: 0.1.4
```

```typescript
// src/index.ts
declare const VERSION: string;

const args = Bun.argv.slice(2);
if (args.includes("-v") || args.includes("--version")) {
  console.log(VERSION);
  process.exit(0);
}
```

ビルドコマンド:
```bash
bun build --compile --define VERSION='"'$(cat VERSION)'"' --outfile=mcp-jira src/index.ts
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

### 案A: package.json から読み込む方式（初期実装）

```typescript
import pkg from "../package.json";
const VERSION = pkg.version;
```

**不採用の理由**:
- **Windows 向けビルドが異常に遅い**（1.4秒 → 63.7秒、約45倍）
- Bun が package.json インポート時に約42MB の巨大なバイナリをダウンロード
- ローカル・CI 環境の両方で再現する問題

### 案B: ハードコード方式

```typescript
const VERSION = "0.1.4"; // 手動更新
```

**不採用の理由**:
- バージョン情報が二箇所に存在する（VERSION ファイルとソースコード）
- 更新忘れのリスクが高い
- リリース時に手動で更新が必要

### 案C: 環境変数で埋め込む（実行時）

```typescript
const VERSION = Bun.env.VERSION || "dev";
```

ビルドスクリプト:
```bash
VERSION=$(cat VERSION) bun build --compile ...
```

**不採用の理由**:
- 環境変数はビルド時にバイナリに埋め込まれない（実行時に読み込まれる）
- コンパイル後のバイナリで常に "dev" と表示される

## 結果

### メリット

1. **バージョン管理の一元化**: VERSION ファイルが唯一の真実（Single Source of Truth）
2. **ビルド速度の大幅改善**: Windows ビルドが 0.7秒（案A: 63.7秒 → 約90倍高速化）
3. **MCP デグレなし**: 引数なしで起動時は通常の MCP サーバーとして動作
4. **クラシックな方式**: 言語非依存で、多くの OSS プロジェクトで採用されている

### デメリット

- package.json に version フィールドがない（npm エコシステムでは異例）
- ビルドコマンドがやや複雑（`--define` フラグが必要）

## 検証

以下の動作確認を実施：

### ビルド速度

- **v0.1.3（変更前）**: 1.4秒
- **package.json 版**: 63.7秒（失敗）
- **VERSION ファイル版**: 0.7秒 ✓

### 動作確認

1. ローカル実行: `VERSION=$(cat VERSION) bun run src/index.ts -v` → `0.1.4` 表示 ✓
2. macOS ビルド後: `./mcp-jira -v` → `0.1.4` 表示 ✓
3. Windows ビルド: 0.7秒で完了 ✓
4. MCP サーバーとして起動: 引数なしで正常に stdio 待機 ✓

## 参照

- VERSION: バージョン情報の定義（Single Source of Truth）
- src/index.ts: バージョン表示の実装
- install.sh: ローカルビルドスクリプト
- .github/workflows/release.yml: CI/CD ビルド設定
