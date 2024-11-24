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

import type { Scanner, Diagnostic, LanguageService } from "typescript";

import { SyntaxKind } from "./localTs";
import { colors, theme, typography } from "./visual";
import { createLangService, updateRootFileCode } from "./langService";

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

let myCode = `const message: string = 'hello there';
console.log(message);
`;

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
    let lineStart = 0;

    for (let i = 0; i < tokens.length; i++) {
        const { text, type } = tokens[i];

        if (type == SyntaxKind.NewLineTrivia) {
            const errorsOnThisLine = diagnostics.filter(
                (e) =>
                    e.file &&
                    e.file.getLineAndCharacterOfPosition(e.start!).line == line
            );

            if (errorsOnThisLine.length > 0) {
                ctx.fillStyle = colors.errors;
                ctx.fillText(
                    errorsOnThisLine[0].messageText.toString(),
                    x + 60,
                    y
                );
            }
            y += height * lineHeight;
            x = 20;
            chars += 1;
            lineStart = chars;

            line++;
        } else {
            let color = "#eeeeee";

            if (theme[type]) color = theme[type];

            if (
                i < tokens.length - 1 &&
                type == SyntaxKind.Identifier &&
                tokens[i + 1].type == SyntaxKind.OpenParenToken
            )
                color = theme[SyntaxKind.FunctionDeclaration]!;

            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            x += ctx.measureText(text).width;
        }

        chars += text.length;
    }

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
function insertChar(ch: string) {
    myCode = myCode.slice(0, letterIndex) + ch + myCode.slice(letterIndex);
    letterIndex += ch.length;
    onCodeChanged();
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
        if (e.code == "KeyR") runCode();
        if (e.code == "KeyB") letterIndex = jumpWordBack(myCode, letterIndex);

        if (e.code == "KeyI") mode = "insert";
        if (e.code == "KeyX") removeCurrentChar();
        if (e.code == "Backspace") removeCharFromLeft();
        if (e.code == "Enter") insertChar("\n");
        if (e.code == "Space") insertChar(" ");
        if (e.code == "KeyS") {
            formatCode();
        }
    } else if (mode == "insert") {
        if (e.code == "Enter") insertChar("\n");
        if (e.code == "Escape") {
            mode = "normal";
            formatCode();
        }
        if (e.code == "Backspace") removeCharFromLeft();
        if (e.key.length == 1) {
            insertChar(e.key);
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
            type: token,
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

let timeout: NodeJS.Timeout | undefined;
function updateModel() {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
        const diagnosticStart = performance.now();
        diagnostics = ts.getPreEmitDiagnostics(languageService.getProgram());

        logPerfResult("Diagnostic", diagnosticStart);
        render();
        timeout = undefined;
    }, 300);
    tokens = tokenizeCode(myCode);
}

function onCodeChanged() {
    const start = performance.now();
    updateRootFileCode(myCode);

    updateModel();

    logPerfResult("Update", start);
}

// Promise.all(filesToLoad.map((name) => loadFile(name))).then(() => {
// render();

// Example Usage
// const code = `type Mode = "foo" | "bar";\nlet mode: Mode = "";\n`;
// // Position is inside the empty string (at character 34)
// const cursorPosition = code.indexOf('""') + 1;

// const suggestions = getSuggestionsAtPosition(code, cursorPosition);
// console.log(suggestions);
// console.log(checkCodeForErrors(code));
// });
// go();

// console.log(checkCodeForErrors(code));
// console.log(tokenizeCode(c));

// document.addEventListener("keydown", async (e) => {
//     if (e.code == "KeyA") {
//         try {
//             const [fileHandle] = await window.showOpenFilePicker({
//                 types: [
//                     {
//                         description: "Text Files",
//                         accept: {
//                             "text/plain": [".txt"],
//                         },
//                     },
//                 ],
//                 multiple: false, // Set to true for selecting multiple files
//             });

//             const file = await fileHandle.getFile();
//             console.log(file.name, file.type, file.size);

//             const reader = new FileReader();

//             reader.onload = (event) => {
//                 console.log(event.target!.result); // File contents as text
//             };

//             reader.onerror = () => {
//                 console.error("File could not be read.");
//             };

//             reader.readAsText(file); // Read file as text
//         } catch (e) {
//             console.log(e);
//         }
//     }
// });

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
