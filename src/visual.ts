import { SyntaxKind } from "./localTs";

export const spacings = {
    pagePadding: 20,
};

export const typography = {
    font: "Menlo, Monaco, 'Courier New', monospace",
    fontSize: 12,
    lineHeight: 1.2,
};

export const theme: Partial<Record<SyntaxKind, string>> = {
    [SyntaxKind.StringLiteral]: "#ce9178", // Strings
    [SyntaxKind.NumericLiteral]: "#b5cea8", // Numbers
    [SyntaxKind.ConstKeyword]: "#569cd6", // Keywords (e.g., function, const)
    [SyntaxKind.Identifier]: "#9cdcfe", // Variables and functions
    [SyntaxKind.FunctionDeclaration]: "#dcdcaa", // Function names
    [SyntaxKind.Parameter]: "#9cdcfe", // Parameters
    [SyntaxKind.PropertyAccessExpression]: "#d7ba7d", // Properties
    [SyntaxKind.TypeReference]: "#4ec9b0", // Type annotations (e.g., `string`, `number`)
    [SyntaxKind.ClassDeclaration]: "#4ec9b0", // Class names
    [SyntaxKind.InterfaceDeclaration]: "#4ec9b0", // Interfaces
    [SyntaxKind.ModuleDeclaration]: "#c586c0", // Modules/Namespaces
    [SyntaxKind.VariableDeclaration]: "#9cdcfe", // Variables
    [SyntaxKind.SingleLineCommentTrivia]: "#6a9955", // Comments
    [SyntaxKind.FirstPunctuation]: "#d4d4d4", // Punctuation (e.g., braces, commas)
    [SyntaxKind.FirstBinaryOperator]: "#d4d4d4", // Operators (e.g., `+`, `-`, `=` )
    [SyntaxKind.EnumDeclaration]: "#b8d7a3", // Enum names
    [SyntaxKind.InterfaceKeyword]: "#c586c0", // Keywords like `interface`
    [SyntaxKind.ReturnKeyword]: "rgb(197, 134, 192)",
    [SyntaxKind.LetKeyword]: "#569cd6",
    [SyntaxKind.ForKeyword]: "#569cd6",
    [SyntaxKind.FunctionKeyword]: "#569cd6",
    [SyntaxKind.TypeKeyword]: "#569cd6",
    [SyntaxKind.NumberKeyword]: "#4ec9b0",
    [SyntaxKind.StringKeyword]: "#4ec9b0",
};

export const colors = {
    bg: "#111111",
    cursorNormaMode: "rgb(30, 100, 30)",
    cursorNormalModeBg: "rgb(17, 40, 17)",
    cursorInsertMode: "rgb(100, 30, 30)",
    cursorInsertModeBg: "rgb(40, 17, 17)",
    errors: "rgb(240, 20, 20)",
};
