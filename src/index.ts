import {
    getCurrentLine,
    getCurrentOffset,
    jumpWordBack,
    jumpWordForward,
    moveCursorDownOneLine,
    moveCursorUpOneLine,
    moveLine,
    removeChar,
} from "./text";

const PERF_TIME = false;

import { colors, spacings, theme, typography } from "./visual";

import { code } from "./code";
import { EditorFile, openFile, writeFile } from "./utils/file";
import { formatCode } from "./utils/formating";
import type { Diagnostic, WorkerResult } from "./ts/worker";
import {
    createScanner,
    Scanner,
    ScriptTarget,
    SyntaxKind,
} from "../ts/typescriptServices";

const view = { x: 0, y: 0 };
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;
let scale = window.devicePixelRatio || 1;

const tsWorker = new Worker("./worker.js");

const iframe = document.getElementById("preview")! as HTMLIFrameElement;
const doc = iframe.contentDocument!;

const style = doc.createElement("style");
style.innerHTML = `body{background-color: black; color: white; margin: 0;}`;
doc.head.appendChild(style);

function runJsCode(code: string) {
    doc.body.replaceChildren();

    const scriptTag = doc.createElement("script");
    scriptTag.textContent = code;
    doc.body.appendChild(scriptTag);
}

function onResize() {
    scale = window.devicePixelRatio || 1;
    ctx.imageSmoothingEnabled = false;

    view.x = window.innerWidth;
    view.y = window.innerHeight;

    canvas.style.width = view.x + "px";
    canvas.style.height = view.y + "px";

    canvas.width = view.x * scale;
    canvas.height = view.y * scale;

    ctx.scale(scale, scale);
}

onResize();

window.addEventListener("resize", (e) => {
    onResize();
    render();
});

let letterIndex = 0;

type Mode = "normal" | "insert";
let mode: Mode = "normal";

// let languageService: LanguageService;
let tokens: { text: string; type: SyntaxKind }[] = [];
let diagnostics: Diagnostic[] = [];

let offset = 0;
// const ts: any = (window as any).ts;

let file: EditorFile & { isModified: boolean } = {
    content: code,
    name: "BUFFER",
    handle: undefined,
    isModified: false,
};

document.addEventListener("wheel", (e) => {
    offset += e.deltaY;
    render();
});

tsWorker.addEventListener("message", (e: { data: WorkerResult }) => {
    if (e.data.type == "diagnostic") {
        diagnostics = e.data.diagnostics;
        render();
    } else if (e.data.type == "getCode") {
        const code = `(function(){${e.data.code}})();`;
        runJsCode(code);
    }
});

function render() {
    const start = performance.now();
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, view.x, view.y);

    ctx.font = `${typography.fontSize}px ${typography.font}`;

    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    showFooter();
    ctx.save();
    ctx.translate(0, -offset);

    const ms = ctx.measureText("f");
    const height = ms.fontBoundingBoxAscent + ms.fontBoundingBoxDescent;
    const letterWidth = ms.width;
    const lineHeight = 1.2;

    let chars = 0;

    let x = 20;
    let y = 20;

    const lineIndex = getCurrentLine(file.content, letterIndex);
    const lineOffset = getCurrentOffset(file.content, letterIndex);

    const cursorX = 20 + lineOffset * ms.width;
    const cursorY = y + lineIndex * height * lineHeight - 3;

    ctx.fillStyle =
        mode == "normal"
            ? colors.cursorNormalModeBg
            : colors.cursorInsertModeBg;
    ctx.fillRect(0, cursorY, view.x, height + 2);

    ctx.fillStyle =
        mode == "normal" ? colors.cursorNormaMode : colors.cursorInsertMode;
    ctx.fillRect(cursorX, cursorY, ms.width, height + 2);

    let line = 0;

    function drawErrorsOnLine(lineIndex: number) {
        const errorsOnThisLine = diagnostics.filter((e) => e.line == lineIndex);

        if (errorsOnThisLine.length > 0) {
            const error = errorsOnThisLine[0];
            ctx.fillStyle = colors.errors;
            ctx.fillText(error.messageText.toString(), x + 60, y);

            if (error.length && error.charInLine) {
                ctx.fillRect(
                    spacings.pagePadding + error.charInLine * letterWidth,
                    y + height - 2,
                    error.length * letterWidth,
                    2
                );
            }
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        const { text, type } = tokens[i];

        if (type == SyntaxKind.NewLineTrivia) {
            drawErrorsOnLine(line);
            y += height * lineHeight;
            x = 20;
            chars += 1;

            line++;
        } else {
            let color = "#eeeeee";

            if (theme[type]) color = theme[type];

            const isFunctionCall =
                i < tokens.length - 1 &&
                type == SyntaxKind.Identifier &&
                tokens[i + 1].type == SyntaxKind.OpenParenToken;

            if (isFunctionCall) color = colors.functionName;

            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            x += ctx.measureText(text).width;
        }

        chars += text.length;
    }

    drawErrorsOnLine(line);

    ctx.restore();

    logPerfResult("Render", start);
}

function removeCharFromLeft() {
    if (letterIndex > 0) {
        file.content = removeChar(file.content, letterIndex - 1);
        letterIndex--;
        onCodeChanged();
    }
}

function removeCurrentChar() {
    file.content = removeChar(file.content, letterIndex);
    onCodeChanged();
}
function insertStrAt(str: string, ch: string, at: number) {
    return str.slice(0, at) + ch + str.slice(at);
}

function insertChar(ch: string) {
    file.content = insertStrAt(file.content, ch, letterIndex);
    letterIndex += ch.length;
    render();
}

function showSuggestions() {
    // const suggestion = languageService.getCompletionsAtPosition(
    //     "file.ts",
    //     letterIndex,
    //     {}
    // );
    // if (suggestion) {
    //     console.log(suggestion);
    // }
}

document.addEventListener("keydown", async (e) => {
    if (mode == "normal") {
        if (e.code == "KeyL") {
            if (letterIndex < file.content.length) letterIndex++;
        }
        if (e.code == "KeyH") {
            if (letterIndex > 0) letterIndex--;
        }
        if (e.code == "KeyJ" && e.metaKey) {
            const res = moveLine(file.content, letterIndex, "down");
            file.content = res.code;
            letterIndex = res.position;
            await formatMyCode();
            onCodeChanged();
        } else if (e.code == "KeyK" && e.metaKey) {
            const res = moveLine(file.content, letterIndex, "up");
            file.content = res.code;
            letterIndex = res.position;
            await formatMyCode();
            onCodeChanged();
        } else if (e.code == "KeyJ") {
            letterIndex = moveCursorDownOneLine(file.content, letterIndex);
        } else if (e.code == "KeyK") {
            letterIndex = moveCursorUpOneLine(file.content, letterIndex);
        }
        if (e.code == "KeyW")
            letterIndex = jumpWordForward(file.content, letterIndex);
        if (e.code == "KeyD") {
            deleteLine();
        }
        if (e.code == "KeyR") runCode();
        if (e.code == "KeyB")
            letterIndex = jumpWordBack(file.content, letterIndex);

        if (e.code == "KeyI") mode = "insert";
        if (e.code == "KeyX") removeCurrentChar();
        if (e.code == "Backspace") removeCharFromLeft();
        if (e.code == "Enter") insertChar("\n");
        if (e.code == "Space") insertChar(" ");
        if (e.code == "KeyS" && e.metaKey) {
            e.preventDefault();
            saveFile();
        }
        if (e.code == "KeyO" && e.metaKey) {
            e.preventDefault();
            loadFile();
        } else if (e.code == "KeyO" && e.shiftKey) insertLineBefore();
        else if (e.code == "KeyO") insertLineAfter();
        if (e.code == "Period") {
            // const diagnostics =
            //     languageService.getSemanticDiagnostics("file.ts");
            // console.log("Diagnostics:", diagnostics);
            // const position = code.indexOf("lenth"); // Finds the position of the typo
            // languageService.applyCodeActionCommand;
            // const fixes = languageService.getCodeFixesAtPosition(
            //     "file.ts",
            //     position,
            //     position,
            //     [diagnostics[0].code],
            //     {},
            //     {}
            // );
            // console.log("Fixes", fixes);
            // if (fixes.length > 0) {
            //     fixes[0].changes.forEach((change: any) => {
            //         console.log(`Applying changes to file: ${change.fileName}`);
            //         change.textChanges.forEach((edit: any) => {
            //             const start = edit.span.start;
            //             const length = edit.span.length;
            //             // Replace the text in the source code
            //             file.content =
            //                 file.content.slice(0, start) +
            //                 edit.newText +
            //                 file.content.slice(start + length);
            //         });
            //         onCodeChanged();
            //     });
            // }
        } else if (e.code == "Slash" && e.metaKey) {
            showSuggestions();
        }
        // if(e.code == "")
    } else if (mode == "insert") {
        if (e.code == "Enter") insertChar("\n");
        else if (e.code == "Escape") {
            mode = "normal";
            formatMyCode();

            tsWorker.postMessage({ type: "diagnostic", file });
            onCodeChanged();
        } else if (e.code == "Backspace") removeCharFromLeft();
        //Period and meta are not working
        else if (e.code == "Slash" && e.metaKey) {
            showSuggestions();
        } else if (e.key.length == 1) {
            insertChar(e.key);
            tokens = tokenizeCode(file.content);
        }
    }
    render();
});

async function formatMyCode() {
    const res = await formatCode(file.content, letterIndex);
    if (res) {
        file.content = res.formatted;
        letterIndex = res.cursorOffset;
    }
}

function tokenizeCode(code: string) {
    tokens = [];
    const scanner: Scanner = createScanner(ScriptTarget.Latest, false);

    scanner.setText(code);

    let token = scanner.scan();
    while (token !== SyntaxKind.EndOfFileToken) {
        tokens.push({
            text: scanner.getTokenText(),
            type: token as unknown as SyntaxKind,
        });
        token = scanner.scan();
    }

    return tokens;
}

async function start() {
    const initStart = performance.now();

    tsWorker.postMessage({ type: "init", file });

    ctx.font = `40px ${typography.font}`;
    ctx.textAlign = "center";
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, view.x, view.y);

    ctx.fillStyle = theme[SyntaxKind.StringKeyword]!;
    ctx.fillText("Loading...", view.x / 2, view.y / 2);

    // languageService = await createLangService(file.content);

    onCodeChanged();

    logPerfResult("Init", initStart);

    render();
}

start();

// function updateModel() {
//     const diagnosticStart = performance.now();
//     // diagnostics = ts.getPreEmitDiagnostics(languageService.getProgram());
//     tokens = tokenizeCode(file.content);

//     logPerfResult("Diagnostic", diagnosticStart);
//     render();
// }

function onCodeChanged() {
    // const start = performance.now();
    // updateRootFileCode(file.content);

    tokens = tokenizeCode(file.content);
    file.isModified = true;

    // logPerfResult("Update", start);
    render();
}

function showFooter() {
    ctx.save();

    const line = getCurrentLine(file.content, letterIndex);
    const lineOffset = getCurrentOffset(file.content, letterIndex);

    ctx.fillStyle = "#222222";
    ctx.fillRect(0, view.y - 20, view.x, 20);

    ctx.fillStyle = "#aaaaaa";
    let charAt = file.content[letterIndex];
    charAt = charAt == "\n" ? "\\n" : charAt;
    // const label = `${letterIndex} ${line}:${lineOffset} char('${charAt}')`;
    const label = `${line}:${lineOffset}`;
    const textY = view.y - 20 + 4;

    ctx.fillText(label, 20, textY);

    ctx.fillStyle = file.isModified && file.handle ? "red" : "green";
    ctx.textAlign = "right";
    ctx.fillText(file.name, view.x - 20, textY);

    if (diagnostics.length > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.fillText(`${diagnostics.length} Errors`, view.x / 2, textY);
    }

    ctx.restore();
}

function logPerfResult(label: string, startTime: number) {
    if (PERF_TIME)
        console.log(`${label} ${(performance.now() - startTime).toFixed(2)}ms`);
}

function runCode() {
    tsWorker.postMessage({ type: "getCode" });
}

function insertLineBefore() {
    const currentLineStart =
        letterIndex == 0
            ? 0
            : file.content.lastIndexOf("\n", letterIndex - 1) + 1;

    file.content = insertStrAt(file.content, "\n", currentLineStart);
    letterIndex = currentLineStart;

    mode = "insert";
    tokens = tokenizeCode(file.content);
}

function insertLineAfter() {
    let currentLineEnd = file.content.indexOf("\n", letterIndex);
    if (currentLineEnd == -1) currentLineEnd = file.content.length;

    file.content = insertStrAt(file.content, "\n", currentLineEnd);
    letterIndex = currentLineEnd + 1;

    mode = "insert";
    tokens = tokenizeCode(file.content);
}

function deleteLine() {
    const currentLineStart =
        letterIndex == 0
            ? 0
            : file.content.lastIndexOf("\n", letterIndex - 1) + 1;
    const currentLineEnd = file.content.indexOf("\n", letterIndex);

    file.content =
        file.content.slice(0, currentLineStart) +
        file.content.slice(currentLineEnd + 1);
    letterIndex = currentLineStart;

    onCodeChanged();
}

async function loadFile() {
    const res = await openFile();
    if (res) {
        file = { ...file, ...res };
        onCodeChanged();
    }
}

async function saveFile() {
    writeFile(file);
    file.isModified = false;
}
