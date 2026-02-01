#!/bin/bash
set -e

# bun の存在確認
if ! command -v bun &> /dev/null; then
  echo "エラー: bun がインストールされていません。"
  echo "https://bun.sh/ を参照してインストールしてください。"
  exit 1
fi

# スクリプトのあるディレクトリに移動
cd "$(dirname "$0")"

# 依存関係のインストール
echo "依存関係をインストールしています..."
bun install

# ビルド
echo "ビルドしています..."
bun build --compile --outfile=mcp-jira src/index.ts

# インストール先の準備
INSTALL_DIR="$HOME/.local/bin"
if [ ! -d "$INSTALL_DIR" ]; then
  echo "ディレクトリを作成しています: $INSTALL_DIR"
  mkdir -p "$INSTALL_DIR"
fi

# バイナリのコピー
echo "インストールしています..."
cp mcp-jira "$INSTALL_DIR/mcp-jira"
chmod +x "$INSTALL_DIR/mcp-jira"

echo "完了しました: $INSTALL_DIR/mcp-jira"
