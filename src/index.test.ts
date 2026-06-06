import { test, expect, describe } from "bun:test";
import { buildJqlWithProjects, markdownToAdf } from "./index";

describe("markdownToAdf", () => {
  test("段落1つ", () => {
    const result = markdownToAdf("本文テキスト") as any;
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "本文テキスト" }],
    });
  });

  test("段落複数", () => {
    const result = markdownToAdf("段落1\n\n段落2") as any;
    expect(result.content).toHaveLength(2);
    expect(result.content[0].type).toBe("paragraph");
    expect(result.content[1].type).toBe("paragraph");
  });

  test("見出し", () => {
    const result = markdownToAdf("## 背景\n\n本文") as any;
    expect(result.content[0]).toEqual({
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "背景" }],
    });
    expect(result.content[1].type).toBe("paragraph");
  });

  test("見出しレベル1〜6", () => {
    for (let i = 1; i <= 6; i++) {
      const result = markdownToAdf(`${"#".repeat(i)} タイトル`) as any;
      expect(result.content[0].attrs.level).toBe(i);
    }
  });

  test("空文字列はエラー", () => {
    expect(() => markdownToAdf("")).toThrow("description must not be empty");
  });

  test("空白のみはエラー", () => {
    expect(() => markdownToAdf("   \n\n  ")).toThrow("description must not be empty");
  });
});

describe("buildJqlWithProjects", () => {
  const projects = ["PROJ1", "PROJ2"];

  test("ORDER BY なし", () => {
    const result = buildJqlWithProjects("status=Open", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2)');
  });

  test("ORDER BY あり（DESC）", () => {
    const result = buildJqlWithProjects("status=Open order by created desc", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2) order by created desc');
  });

  test("ORDER BY あり（ASC省略）", () => {
    const result = buildJqlWithProjects("status=Open order by updated", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2) order by updated');
  });

  test("ORDER BY 大文字小文字混在", () => {
    const result = buildJqlWithProjects("status=Open ORDER BY priority ASC", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2) ORDER BY priority ASC');
  });

  test("ORDER BY 複数フィールド", () => {
    const result = buildJqlWithProjects("status=Open order by priority desc, created asc", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2) order by priority desc, created asc');
  });

  test("デフォルトプロジェクトなしの場合", () => {
    const result = buildJqlWithProjects("status=Open order by created desc", []);
    expect(result).toBe("status=Open order by created desc");
  });

  test("文字列内にorder byを含む場合（誤検出しない）", () => {
    // 末尾にORDER BY句がない場合は分離しない
    const result = buildJqlWithProjects('summary ~ "order by section"', projects);
    expect(result).toBe('(summary ~ "order by section") AND project in (PROJ1, PROJ2)');
  });

  test("ドット付きフィールド名（cf.customfield など）", () => {
    const result = buildJqlWithProjects("status=Open order by cf.customfield desc", projects);
    expect(result).toBe('(status=Open) AND project in (PROJ1, PROJ2) order by cf.customfield desc');
  });

  test("単一プロジェクト", () => {
    const result = buildJqlWithProjects("status=Open", ["PROJ1"]);
    expect(result).toBe('(status=Open) AND project in (PROJ1)');
  });
});
