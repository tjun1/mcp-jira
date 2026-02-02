import { test, expect, describe } from "bun:test";
import { buildJqlWithProjects } from "./index";

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
