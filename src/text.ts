export function getCurrentLine(code: string, currentPos: number) {
    let line = 0;
    let index = 0;

    while (index < currentPos) {
        if (code[index] == "\n") {
            line++;
        }
        index++;
    }

    return line;
}

export function getCurrentOffset(code: string, currentPos: number) {
    const lastNewlineIndex = code.lastIndexOf("\n", currentPos - 1);

    return Math.max(currentPos - lastNewlineIndex - 1, 0);
}

export function moveCursorDownOneLine(
    code: string,
    letterIndex: number
): number {
    const currentLineStart =
        letterIndex == 0 ? 0 : code.lastIndexOf("\n", letterIndex - 1) + 1;
    const currentLineEnd = code.indexOf("\n", letterIndex);

    const column = letterIndex - currentLineStart;

    const nextLineStart = currentLineEnd + 1;
    if (nextLineStart >= code.length || nextLineStart === 0) {
        return letterIndex;
    }

    const nextLineEnd = code.indexOf("\n", nextLineStart);
    const nextLineLength =
        (nextLineEnd === -1 ? code.length : nextLineEnd) - nextLineStart;

    const newLetterIndex = nextLineStart + Math.min(column, nextLineLength);
    return newLetterIndex;
}

export function moveCursorUpOneLine(code: string, letterIndex: number): number {
    const currentLineStart = code.lastIndexOf("\n", letterIndex - 1) + 1;
    const column = letterIndex - currentLineStart;

    const previousLineEnd = code.lastIndexOf("\n", currentLineStart - 1);
    if (previousLineEnd === -1) {
        return letterIndex;
    }

    const previousLineStart = code.lastIndexOf("\n", previousLineEnd - 1) + 1;
    const previousLineLength = previousLineEnd - previousLineStart;

    const newLetterIndex =
        previousLineStart + Math.min(column, previousLineLength);
    return newLetterIndex;
}

const whitespaceChars = [" ", "\n", ":", ".", "(", ")"];
export function jumpWordBack(code: string, letterIndex: number): number {
    if (letterIndex <= 0) return 0;

    let i = letterIndex - 1;

    while (i > 0 && whitespaceChars.includes(code[i])) i--;

    while (i > 0 && !whitespaceChars.includes(code[i - 1])) i--;

    return i;
}

export function jumpWordForward(code: string, letterIndex: number): number {
    if (letterIndex >= code.length) return code.length;

    let i = letterIndex;
    while (i < code.length && !whitespaceChars.includes(code[i])) i++;

    while (i < code.length && whitespaceChars.includes(code[i])) i++;

    return i;
}

export function removeChar(str: string, at: number) {
    return str.slice(0, at) + str.slice(at + 1);
}
