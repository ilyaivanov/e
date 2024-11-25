import {
    jumpWordBack,
    jumpWordForward,
    moveCursorDownOneLine,
    moveCursorUpOneLine,
} from "./text";

it("jumping words forward", () => {
    const code = "const a = 42;";

    expect(jumpWordForward(code, 0)).toBe(6);
    expect(jumpWordForward(code, 6)).toBe(8);
    expect(jumpWordForward(code, 8)).toBe(10);
    expect(jumpWordForward(code, 10)).toBe(13);
});

it("jumping words backwards", () => {
    const code = "const a = 42;";

    expect(jumpWordBack(code, 13)).toBe(10);
    expect(jumpWordBack(code, 10)).toBe(8);
    expect(jumpWordBack(code, 8)).toBe(6);
    expect(jumpWordBack(code, 6)).toBe(0);
});

const multilineCode = `
const a = 42;

foo();
const b = 42;
`.slice(1); // slice(1) removes first \n symbol, it's just easier to see the code with it in editor

it("moving down", () => {
    expect(moveCursorDownOneLine(multilineCode, 2)).toBe(14);

    //should be 17 with desired col position if previous position was 2
    expect(moveCursorDownOneLine(multilineCode, 14)).toBe(15);

    expect(moveCursorDownOneLine(multilineCode, 17)).toBe(24);
});

it("moving up", () => {
    expect(moveCursorUpOneLine(multilineCode, 14)).toBe(0);

    expect(moveCursorUpOneLine(multilineCode, 15)).toBe(14);

    expect(moveCursorUpOneLine(multilineCode, 24)).toBe(17);
});
