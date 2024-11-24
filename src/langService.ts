import type { Scanner, Diagnostic, createLanguageService } from "typescript";

const filesToLoad = [
    "lib.d.ts",
    "lib.es5.d.ts",
    "lib.dom.d.ts",
    "lib.webworker.importscripts.d.ts",
    "lib.scripthost.d.ts",
    "lib.decorators.d.ts",
    "lib.decorators.legacy.d.ts",
];

const rootFileName = "file.ts";
const files = new Map<string, { content: string; version: number }>();

async function loadFile(name: string) {
    const res = await fetch("./lib/" + name);

    files.set(name, { content: await res.text(), version: 0 });
}

export function updateRootFileCode(code: string) {
    const info = files.get(rootFileName)!;
    info.version++;
    info.content = code;
}

const ts = (window as any).ts;

export async function createLangService(code: string) {
    files.set(rootFileName, { content: code, version: 0 });

    await Promise.all(filesToLoad.map(loadFile));

    const compilerOptions = {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
    };

    const langService: typeof createLanguageService = ts.createLanguageService;

    return langService({
        getScriptFileNames: () => [rootFileName],
        getScriptVersion: (fileName: string) => {
            const res = files.get(fileName)!.version + "";
            // console.log(`File ${fileName} => ${res}`);
            return res;
        },
        getScriptSnapshot: (fileName: string) => {
            // console.log("Snapshoting file " + fileName);
            if (!files.has(fileName))
                console.info(`File '${fileName}' is absent`);

            return ts.ScriptSnapshot.fromString(files.get(fileName)!.content);
        },
        getCurrentDirectory: () => "",
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: () => "lib.d.ts",
        fileExists: (fileName: string) => files.has(fileName),
        readFile: (fileName: string) => {
            console.log("Reading file " + fileName);
            return files.get(fileName)?.content;
        },
        directoryExists: () => true,
        getDirectories: () => [],
    });
}
