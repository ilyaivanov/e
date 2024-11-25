import type { Scanner, Diagnostic, createLanguageService } from "typescript";

const filesToLoad = [
    "lib.d.ts",
    "lib.decorators.d.ts",
    "lib.decorators.legacy.d.ts",
    "lib.dom.asynciterable.d.ts",
    "lib.dom.d.ts",
    "lib.dom.iterable.d.ts",
    "lib.es5.d.ts",
    "lib.es6.d.ts",
    "lib.es2015.collection.d.ts",
    "lib.es2015.core.d.ts",
    "lib.es2015.d.ts",
    "lib.es2015.generator.d.ts",
    "lib.es2015.iterable.d.ts",
    "lib.es2015.promise.d.ts",
    "lib.es2015.proxy.d.ts",
    "lib.es2015.reflect.d.ts",
    "lib.es2015.symbol.d.ts",
    "lib.es2015.symbol.wellknown.d.ts",
    "lib.es2016.array.include.d.ts",
    "lib.es2016.d.ts",
    "lib.es2016.full.d.ts",
    "lib.es2016.intl.d.ts",
    "lib.es2017.arraybuffer.d.ts",
    "lib.es2017.d.ts",
    "lib.es2017.date.d.ts",
    "lib.es2017.full.d.ts",
    "lib.es2017.intl.d.ts",
    "lib.es2017.object.d.ts",
    "lib.es2017.sharedmemory.d.ts",
    "lib.es2017.string.d.ts",
    "lib.es2017.typedarrays.d.ts",
    "lib.es2018.asyncgenerator.d.ts",
    "lib.es2018.asynciterable.d.ts",
    "lib.es2018.d.ts",
    "lib.es2018.full.d.ts",
    "lib.es2018.intl.d.ts",
    "lib.es2018.promise.d.ts",
    "lib.es2018.regexp.d.ts",
    "lib.es2019.array.d.ts",
    "lib.es2019.d.ts",
    "lib.es2019.full.d.ts",
    "lib.es2019.intl.d.ts",
    "lib.es2019.object.d.ts",
    "lib.es2019.string.d.ts",
    "lib.es2019.symbol.d.ts",
    "lib.es2020.bigint.d.ts",
    "lib.es2020.d.ts",
    "lib.es2020.date.d.ts",
    "lib.es2020.full.d.ts",
    "lib.es2020.intl.d.ts",
    "lib.es2020.number.d.ts",
    "lib.es2020.promise.d.ts",
    "lib.es2020.sharedmemory.d.ts",
    "lib.es2020.string.d.ts",
    "lib.es2020.symbol.wellknown.d.ts",
    "lib.es2021.d.ts",
    "lib.es2021.full.d.ts",
    "lib.es2021.intl.d.ts",
    "lib.es2021.promise.d.ts",
    "lib.es2021.string.d.ts",
    "lib.es2021.weakref.d.ts",
    "lib.es2022.array.d.ts",
    "lib.es2022.d.ts",
    "lib.es2022.error.d.ts",
    "lib.es2022.full.d.ts",
    "lib.es2022.intl.d.ts",
    "lib.es2022.object.d.ts",
    "lib.es2022.regexp.d.ts",
    "lib.es2022.string.d.ts",
    "lib.es2023.array.d.ts",
    "lib.es2023.collection.d.ts",
    "lib.es2023.d.ts",
    "lib.es2023.full.d.ts",
    "lib.es2023.intl.d.ts",
    "lib.es2024.arraybuffer.d.ts",
    "lib.es2024.collection.d.ts",
    "lib.es2024.d.ts",
    "lib.es2024.full.d.ts",
    "lib.es2024.object.d.ts",
    "lib.es2024.promise.d.ts",
    "lib.es2024.regexp.d.ts",
    "lib.es2024.sharedmemory.d.ts",
    "lib.es2024.string.d.ts",
    "lib.esnext.array.d.ts",
    "lib.esnext.collection.d.ts",
    "lib.esnext.d.ts",
    "lib.esnext.decorators.d.ts",
    "lib.esnext.disposable.d.ts",
    "lib.esnext.full.d.ts",
    "lib.esnext.intl.d.ts",
    "lib.esnext.iterator.d.ts",
    "lib.scripthost.d.ts",
    "lib.webworker.asynciterable.d.ts",
    "lib.webworker.d.ts",
    "lib.webworker.importscripts.d.ts",
    "lib.webworker.iterable.d.ts",
];

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

async function loadFile(name: string) {
    const res = await fetch("./lib/" + name);

    setFile(name, await res.text());
}

export function updateRootFileCode(code: string) {
    const info = getFile(rootFileName)!;
    info.version++;
    info.content = code;
}

const ts = (window as any).ts;

const lib = ["ESNext", "DOM"];

function mapFile(filename: string) {
    const currentLib = lib.find((l) => l + ".ts" == filename);
    if (currentLib) return "lib." + currentLib.toLocaleLowerCase() + ".d.ts";

    return filename;
}

export async function createLangService(code: string) {
    setFile(rootFileName, code);

    await Promise.all(filesToLoad.map(loadFile));

    const compilerOptions = {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        lib,
    };

    const langService: typeof createLanguageService = ts.createLanguageService;

    return langService({
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
                // console.log(files.get(libFile));
                return ts.ScriptSnapshot.fromString(getFile(fileName)!.content);
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
