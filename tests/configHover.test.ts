import { join } from "node:path";
import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");
const configFile = join(root, "starglow.config.ts");
const schemaFile = join(root, "src/types/config.ts");

let service: ts.LanguageService;

beforeAll(() => {
  const { options } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile).config,
    ts.sys,
    root
  );
  service = ts.createLanguageService({
    getScriptFileNames: () => [configFile, schemaFile],
    getScriptVersion: () => "1",
    getScriptSnapshot: file =>
      ts.sys.fileExists(file)
        ? ts.ScriptSnapshot.fromString(ts.sys.readFile(file) ?? "")
        : undefined,
    getCurrentDirectory: () => root,
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    // pnpm links packages; without it zod loads twice and its types turn to any.
    realpath: ts.sys.realpath,
  });
});

/** Every key in starglow.config.ts, with the doc an editor shows on hover. */
function hoverDocs(): [string, string][] {
  const source = service.getProgram()!.getSourceFile(configFile)!;
  const docs: [string, string][] = [];
  const visit = (node: ts.Node, path: string[]) => {
    if (ts.isPropertyAssignment(node)) {
      const key = [...path, node.name.getText(source)];
      const info = service.getQuickInfoAtPosition(
        configFile,
        node.name.getStart(source)
      );
      docs.push([
        key.join("."),
        ts.displayPartsToString(info?.documentation ?? []),
      ]);
      ts.forEachChild(node, child => visit(child, key));
    } else ts.forEachChild(node, child => visit(child, path));
  };
  visit(source, []);
  return docs;
}

/** Every key of the `StarglowConfig` input type, with its doc. */
function typeDocs(): [string, string][] {
  const program = service.getProgram()!;
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(schemaFile)!;
  const alias = source.statements.find(
    (node): node is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(node) && node.name.text === "StarglowConfig"
  )!;
  const docs: [string, string][] = [];
  const visit = (type: ts.Type, path: string[]) => {
    for (const part of type.isUnion() ? type.types : [type]) {
      const inner = checker.isArrayType(part)
        ? checker.getTypeArguments(part as ts.TypeReference)[0]
        : part;
      if (!(inner.flags & ts.TypeFlags.Object)) continue;
      for (const prop of inner.getProperties()) {
        const key = [...path, prop.name];
        docs.push([
          key.join("."),
          ts.displayPartsToString(prop.getDocumentationComment(checker)),
        ]);
        visit(checker.getTypeOfSymbol(prop), key);
      }
    }
  };
  visit(checker.getTypeAtLocation(alias.name), []);
  return docs;
}

describe("config docs on hover", () => {
  it("shows a doc for every key in starglow.config.ts", () => {
    // Custom palette names are the site's own, so they have no doc.
    const docs = hoverDocs().filter(
      ([key]) => !/^appearance\.palettes\.(dark|light)\.[^.]+$/.test(key)
    );
    expect(docs.map(([key]) => key)).toContain("site.title");
    expect(docs.filter(([, doc]) => !doc).map(([key]) => key)).toEqual([]);
  }, 60_000);

  it("documents every key of StarglowConfig", () => {
    const docs = typeDocs();
    expect(docs.map(([key]) => key)).toContain("features.editPost.path");
    expect(docs.filter(([, doc]) => !doc).map(([key]) => key)).toEqual([]);
  }, 60_000);
});
