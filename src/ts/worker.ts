import { libFiles } from "../../ts/lib";
import {
    CompilerOptions,
    createLanguageService,
    getPreEmitDiagnostics,
    LanguageService,
    ModuleKind,
    ScriptSnapshot,
    ScriptTarget,
} from "../../ts/typescriptServices";

let languageService: LanguageService | undefined;

export type Diagnostic = {
    messageText: string;
    start: number | undefined;
    length: number | undefined;
    line: number | undefined;
    charInLine: number | undefined;
};

export type WorkerResult =
    | { type: "diagnostic"; diagnostics: Diagnostic[] }
    | { type: "getCode"; code: string };

export type WorkerCommand =
    | { type: "init"; file: { content: string } }
    | { type: "diagnostic"; file: { content: string } }
    | { type: "getCode" };

function post(result: WorkerResult) {
    self.postMessage(result);
}

self.onmessage = async (e: { data: WorkerCommand }) => {
    if (e.data.type == "init") {
        languageService = await createLangService(e.data.file.content);
    } else if (e.data.type == "getCode") {
        const res = languageService!.getEmitOutput(rootFileName);
        post({ type: "getCode", code: res.outputFiles[0].text });
    } else if (e.data.type == "diagnostic") {
        //Todo: return diag results
        // const start = performance.now();

        updateRootFileCode(e.data.file.content);
        const diagnostics = getPreEmitDiagnostics(
            languageService!.getProgram()!
        );

        // const time = ((performance.now() - start) / 1000).toFixed(2);
        // console.log(`done ${time}sec`);
        post({
            type: "diagnostic",
            diagnostics: diagnostics.map((d) => {
                const lineInfo =
                    d.file && d.start
                        ? d.file.getLineAndCharacterOfPosition(d.start)
                        : undefined;
                return {
                    //convert message chain
                    messageText: d.messageText.toString(),
                    start: d.start,
                    length: d.length,
                    file: d.file?.fileName,
                    line: lineInfo?.line,
                    charInLine: lineInfo?.character,
                };
            }),
        });
    }
};

const rootFileName = "file.ts";
const files = new Map<string, { content: string; version: number }>();
function getFile(filename: string) {
    return files.get(mapFile(filename));
}
function setFile(filename: string, content: string) {
    // console.log("writing to " + mapFile(filename));
    return files.set(mapFile(filename), { content, version: 0 });
}
function hasFile(filename: string) {
    return files.has(mapFile(filename));
}

// async function loadFile(name: string) {
//     const res = await fetch("./lib/" + name);

//     setFile(name, await res.text());
// }

function updateRootFileCode(code: string) {
    const info = getFile(rootFileName)!;
    info.version++;
    info.content = code;
}

const lib = ["ESNext", "DOM"];

function mapFile(filename: string) {
    const currentLib = lib.find((l) => l + ".ts" == filename);
    if (currentLib) return "lib." + currentLib.toLocaleLowerCase() + ".d.ts";

    return filename;
}

async function createLangService(code: string) {
    for (const fileKey of Object.keys(libFiles)) {
        files.set(fileKey, { content: libFiles[fileKey], version: 0 });
    }

    setFile(rootFileName, code);

    // await Promise.all(filesToLoad.map(loadFile));

    //get these from tsconfig
    const compilerOptions: CompilerOptions = {
        target: ScriptTarget.ES2018,
        module: ModuleKind.CommonJS,
        lib,
        strict: true,
        skipDefaultLibCheck: true,
    };

    return createLanguageService({
        getScriptFileNames: () => [rootFileName],
        getScriptVersion: (fileName: string) => {
            // console.log(`File ${fileName} => ${res}`);
            return getFile(fileName)!.version + "";
        },
        getScriptSnapshot: (fileName: string) => {
            // console.log("Snapshoting file " + fileName);
            if (!hasFile(fileName))
                console.info(`File '${fileName}' is absent`);
            else {
                // console.log(fileName, mapFile(fileName));
                return ScriptSnapshot.fromString(getFile(fileName)!.content);
            }
        },
        getCurrentDirectory: () => "",
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: () => "lib.d.ts",
        fileExists: (fileName: string) => hasFile(fileName),
        readFile: (fileName: string) => {
            // console.log("Reading file " + fileName);
            return getFile(fileName)?.content;
        },
        directoryExists: () => true,
        getDirectories: () => [],
    });
}
