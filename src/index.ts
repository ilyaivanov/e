import {
    getCurrentLine,
    getCurrentOffset,
    jumpWordBack,
    jumpWordForward,
    moveCursorDownOneLine,
    moveCursorUpOneLine,
    removeChar,
} from "./text";

const PERF_TIME = false;

type Scanner = any;
type Diagnostic = any;
type LanguageService = any;
// import type { Scanner, Diagnostic, LanguageService } from "typescript";

import { SyntaxKind } from "./localTs";
import { colors, spacings, theme, typography } from "./visual";
import { createLangService, updateRootFileCode } from "./langService";
import { code } from "./code";

const view = { x: 0, y: 0 };
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;
let scale = window.devicePixelRatio || 1;

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

let letterIndex = 0;

type Mode = "normal" | "insert";
let mode: Mode = "normal";

let myCode = code;

let languageService: LanguageService;
let tokens: { text: string; type: SyntaxKind }[] = [];
let diagnostics: Diagnostic[] = [];

let offset = 0;
const ts: any = (window as any).ts;

document.addEventListener("wheel", (e) => {
    offset += e.deltaY;
    render();
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

    const lineIndex = getCurrentLine(myCode, letterIndex);
    const lineOffset = getCurrentOffset(myCode, letterIndex);

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
        const errorsOnThisLine = diagnostics.filter(
            (e) =>
                e.file &&
                e.file.getLineAndCharacterOfPosition(e.start!).line == lineIndex
        );

        if (errorsOnThisLine.length > 0) {
            const error = errorsOnThisLine[0];
            ctx.fillStyle = colors.errors;
            ctx.fillText(error.messageText.toString(), x + 60, y);

            if (error.start && error.length && error.file) {
                const char = error.file.getLineAndCharacterOfPosition(
                    error.start!
                ).character;
                ctx.fillRect(
                    spacings.pagePadding + char * letterWidth,
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
        myCode = removeChar(myCode, letterIndex - 1);
        letterIndex--;
        onCodeChanged();
    }
}

function removeCurrentChar() {
    myCode = removeChar(myCode, letterIndex);
    onCodeChanged();
}
function insertStrAt(str: string, ch: string, at: number) {
    return str.slice(0, at) + ch + str.slice(at);
}

function insertChar(ch: string) {
    myCode = insertStrAt(myCode, ch, letterIndex);
    letterIndex += ch.length;
    render();
    // onCodeChanged();
}

function showSuggestions() {
    const suggestion = languageService.getCompletionsAtPosition(
        "file.ts",
        letterIndex,
        {}
    );
    if (suggestion) {
        console.log(suggestion.entries[0]);
    }
}

document.addEventListener("keydown", (e) => {
    if (mode == "normal") {
        if (e.code == "KeyL") {
            if (letterIndex < myCode.length) letterIndex++;
        }
        if (e.code == "KeyH") {
            if (letterIndex > 0) letterIndex--;
        }
        if (e.code == "KeyJ") {
            letterIndex = moveCursorDownOneLine(myCode, letterIndex);
        }
        if (e.code == "KeyK") {
            letterIndex = moveCursorUpOneLine(myCode, letterIndex);
        }
        if (e.code == "KeyW")
            letterIndex = jumpWordForward(myCode, letterIndex);
        if (e.code == "KeyD") {
            deleteLine();
        }
        if (e.code == "KeyR") runCode();
        if (e.code == "KeyB") letterIndex = jumpWordBack(myCode, letterIndex);

        if (e.code == "KeyI") mode = "insert";
        if (e.code == "KeyX") removeCurrentChar();
        if (e.code == "Backspace") removeCharFromLeft();
        if (e.code == "Enter") insertChar("\n");
        if (e.code == "Space") insertChar(" ");
        if (e.code == "KeyO" && e.shiftKey) insertLineBefore();
        else if (e.code == "KeyO") insertLineAfter();
        if (e.code == "Period") {
            const diagnostics =
                languageService.getSemanticDiagnostics("file.ts");

            console.log("Diagnostics:", diagnostics);

            const position = code.indexOf("lenth"); // Finds the position of the typo

            languageService.applyCodeActionCommand;
            const fixes = languageService.getCodeFixesAtPosition(
                "file.ts",
                position,
                position,
                [diagnostics[0].code],
                {},
                {}
            );

            console.log("Fixes", fixes);

            if (fixes.length > 0) {
                fixes[0].changes.forEach((change: any) => {
                    console.log(`Applying changes to file: ${change.fileName}`);

                    change.textChanges.forEach((edit: any) => {
                        const start = edit.span.start;
                        const length = edit.span.length;

                        // Replace the text in the source code
                        myCode =
                            myCode.slice(0, start) +
                            edit.newText +
                            myCode.slice(start + length);
                    });
                    onCodeChanged();
                });
            }
        } else if (e.code == "Slash" && e.metaKey) {
            showSuggestions();
        }
        // if(e.code == "")
    } else if (mode == "insert") {
        if (e.code == "Enter") insertChar("\n");
        else if (e.code == "Escape") {
            mode = "normal";
            formatCode();
            onCodeChanged();
        } else if (e.code == "Backspace") removeCharFromLeft();
        //Period and meta are not working
        else if (e.code == "Slash" && e.metaKey) {
            showSuggestions();
        } else if (e.key.length == 1) {
            insertChar(e.key);
            tokens = tokenizeCode(myCode);
        }
    }
    render();
});

function tokenizeCode(code: string) {
    tokens = [];
    const scanner: Scanner = ts.createScanner(ts.ScriptTarget.Latest, false);

    // Initialize the scanner with the code string
    scanner.setText(code);

    let token = scanner.scan();
    while (token !== ts.SyntaxKind.EndOfFileToken) {
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
    ctx.font = `40px ${typography.font}`;
    ctx.textAlign = "center";
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, view.x, view.y);

    ctx.fillStyle = theme[SyntaxKind.StringKeyword]!;
    ctx.fillText("Loading...", view.x / 2, view.y / 2);

    languageService = await createLangService(myCode);

    updateModel();

    logPerfResult("Init", initStart);

    render();
}

start();

function updateModel() {
    const diagnosticStart = performance.now();
    diagnostics = ts.getPreEmitDiagnostics(languageService.getProgram());
    tokens = tokenizeCode(myCode);

    logPerfResult("Diagnostic", diagnosticStart);
    render();
}

function onCodeChanged() {
    const start = performance.now();
    updateRootFileCode(myCode);

    updateModel();

    logPerfResult("Update", start);
}

function showFooter() {
    const line = getCurrentLine(myCode, letterIndex);
    const lineOffset = getCurrentOffset(myCode, letterIndex);

    ctx.fillStyle = "#222222";
    ctx.fillRect(0, view.y - 20, view.x, 20);

    ctx.fillStyle = "#aaaaaa";
    let charAt = myCode[letterIndex];
    charAt = charAt == "\n" ? "\\n" : charAt;
    // const label = `${letterIndex} ${line}:${lineOffset} char('${charAt}')`;
    const label = `${line}:${lineOffset}`;
    ctx.fillText(label, 20, view.y - 20 + 4);
}

function logPerfResult(label: string, startTime: number) {
    if (PERF_TIME)
        console.log(`${label} ${(performance.now() - startTime).toFixed(2)}ms`);
}

function runCode() {
    const res = languageService.getEmitOutput("file.ts");
    const jsCode = res.outputFiles[0].text;
    const code = `(function(){${jsCode}})();`;
    eval(code);
}

function formatCode() {
    try {
        const options = {
            parser: "typescript",
            plugins: [require("prettier/parser-typescript")],
            tabWidth: 4,
        };
        myCode = (window as any).prettier.format(myCode, options);
        updateModel();
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.log(e.message);
        } else {
            throw e;
        }
    }
}

function insertLineBefore() {
    const currentLineStart =
        letterIndex == 0 ? 0 : myCode.lastIndexOf("\n", letterIndex - 1) + 1;

    myCode = insertStrAt(myCode, "\n", currentLineStart);
    letterIndex = currentLineStart;

    mode = "insert";
    tokens = tokenizeCode(myCode);
}

function insertLineAfter() {
    let currentLineEnd = myCode.indexOf("\n", letterIndex);
    if (currentLineEnd == -1) currentLineEnd = myCode.length;

    myCode = insertStrAt(myCode, "\n", currentLineEnd);
    letterIndex = currentLineEnd + 1;

    mode = "insert";
    tokens = tokenizeCode(myCode);
}

function deleteLine() {
    const currentLineStart =
        letterIndex == 0 ? 0 : myCode.lastIndexOf("\n", letterIndex - 1) + 1;
    const currentLineEnd = myCode.indexOf("\n", letterIndex);

    myCode =
        myCode.slice(0, currentLineStart) + myCode.slice(currentLineEnd + 1);
    letterIndex = currentLineStart;

    onCodeChanged();
}
