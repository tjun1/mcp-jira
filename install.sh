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
echo "バイナリをインストールしています..."
cp mcp-jira "$INSTALL_DIR/mcp-jira"
chmod +x "$INSTALL_DIR/mcp-jira"

echo "✓ バイナリのインストール完了: $INSTALL_DIR/mcp-jira"

# スキルのインストール
SKILLS_DIR="$HOME/.claude/skills"
if [ -d "skills" ]; then
  echo "Claude Code スキルをインストールしています..."
  mkdir -p "$SKILLS_DIR"
  cp -r skills/* "$SKILLS_DIR/"
  echo "✓ スキルのインストール完了: $SKILLS_DIR"
else
  echo "⚠ skills ディレクトリが見つかりませんでした。スキルのインストールをスキップします。"
fi

echo ""
echo "インストールが完了しました！"
