import { SyntaxKind } from "./localTs";

export const spacings = {
    pagePadding: 20,
};

export const typography = {
    font: "Menlo, Monaco, 'Courier New', monospace",
    fontSize: 12,
    lineHeight: 1.2,
};

const keyswords = [
    SyntaxKind.BreakKeyword,
    SyntaxKind.CaseKeyword,
    SyntaxKind.CatchKeyword,
    SyntaxKind.ClassKeyword,
    SyntaxKind.ConstKeyword,
    SyntaxKind.ContinueKeyword,
    SyntaxKind.DebuggerKeyword,
    SyntaxKind.DefaultKeyword,
    SyntaxKind.DeleteKeyword,
    SyntaxKind.DoKeyword,
    SyntaxKind.ElseKeyword,
    SyntaxKind.EnumKeyword,
    SyntaxKind.ExportKeyword,
    SyntaxKind.ExtendsKeyword,
    SyntaxKind.FalseKeyword,
    SyntaxKind.FinallyKeyword,
    SyntaxKind.ForKeyword,
    SyntaxKind.FunctionKeyword,
    SyntaxKind.IfKeyword,
    SyntaxKind.ImportKeyword,
    SyntaxKind.InKeyword,
    SyntaxKind.InstanceOfKeyword,
    SyntaxKind.NewKeyword,
    SyntaxKind.NullKeyword,
    SyntaxKind.ReturnKeyword,
    SyntaxKind.SuperKeyword,
    SyntaxKind.SwitchKeyword,
    SyntaxKind.ThisKeyword,
    SyntaxKind.ThrowKeyword,
    SyntaxKind.TrueKeyword,
    SyntaxKind.TryKeyword,
    SyntaxKind.TypeOfKeyword,
    SyntaxKind.VarKeyword,
    SyntaxKind.VoidKeyword,
    SyntaxKind.WhileKeyword,
    SyntaxKind.WithKeyword,
    SyntaxKind.ImplementsKeyword,
    SyntaxKind.InterfaceKeyword,
    SyntaxKind.LetKeyword,
    SyntaxKind.PackageKeyword,
    SyntaxKind.PrivateKeyword,
    SyntaxKind.ProtectedKeyword,
    SyntaxKind.PublicKeyword,
    SyntaxKind.StaticKeyword,
    SyntaxKind.YieldKeyword,
    SyntaxKind.AbstractKeyword,
    SyntaxKind.AccessorKeyword,
    SyntaxKind.AsKeyword,
    SyntaxKind.AssertsKeyword,
    SyntaxKind.AssertKeyword,
    SyntaxKind.AnyKeyword,
    SyntaxKind.AsyncKeyword,
    SyntaxKind.AwaitKeyword,
    SyntaxKind.BooleanKeyword,
    SyntaxKind.ConstructorKeyword,
    SyntaxKind.DeclareKeyword,
    SyntaxKind.GetKeyword,
    SyntaxKind.InferKeyword,
    SyntaxKind.IntrinsicKeyword,
    SyntaxKind.IsKeyword,
    SyntaxKind.KeyOfKeyword,
    SyntaxKind.ModuleKeyword,
    SyntaxKind.NamespaceKeyword,
    SyntaxKind.NeverKeyword,
    SyntaxKind.OutKeyword,
    SyntaxKind.ReadonlyKeyword,
    SyntaxKind.RequireKeyword,
    SyntaxKind.NumberKeyword,
    SyntaxKind.ObjectKeyword,
    SyntaxKind.SatisfiesKeyword,
    SyntaxKind.SetKeyword,
    SyntaxKind.StringKeyword,
    SyntaxKind.SymbolKeyword,
    SyntaxKind.TypeKeyword,
    SyntaxKind.UndefinedKeyword,
    SyntaxKind.UniqueKeyword,
    SyntaxKind.UnknownKeyword,
    SyntaxKind.UsingKeyword,
    SyntaxKind.FromKeyword,
    SyntaxKind.GlobalKeyword,
    SyntaxKind.BigIntKeyword,
    SyntaxKind.OverrideKeyword,
    SyntaxKind.OfKeyword,
    SyntaxKind.FirstKeyword,
    SyntaxKind.LastKeyword,
];

const types = [
    SyntaxKind.StringKeyword,
    SyntaxKind.NumberKeyword,
    SyntaxKind.TypeReference,
    SyntaxKind.ClassDeclaration,
    SyntaxKind.InterfaceDeclaration,
];

const accentKeyword = [SyntaxKind.ExportKeyword, SyntaxKind.ReturnKeyword];

export const colors = {
    bg: "#111111",
    cursorNormaMode: "rgb(30, 100, 30)",
    cursorNormalModeBg: "rgb(17, 40, 17)",
    cursorInsertMode: "rgb(100, 30, 30)",
    cursorInsertModeBg: "rgb(40, 17, 17)",
    errors: "rgb(240, 20, 20)",

    keyword: "#569cd6",
    type: "#4ec9b0",
    accentKeyword: "rgb(197, 134, 192)",
    functionName: "#dcdcaa",

    string: "#ce9178",
};

export const theme: Partial<Record<SyntaxKind, string>> = {
    [SyntaxKind.StringLiteral]: colors.string,
    [SyntaxKind.TemplateExpression]: "blue",
    [SyntaxKind.TemplateHead]: colors.string,
    [SyntaxKind.TemplateLiteralType]: colors.string,
    [SyntaxKind.TemplateLiteralTypeSpan]: "blue",
    [SyntaxKind.TemplateMiddle]: "blue",
    [SyntaxKind.TemplateSpan]: "blue",
    [SyntaxKind.TemplateTail]: "blue",
    [SyntaxKind.NumericLiteral]: "#b5cea8", // Numbers
    [SyntaxKind.Identifier]: "#9cdcfe", // Variables and functions
    // [SyntaxKind.FunctionDeclaration]: "red", // Function names
    [SyntaxKind.Parameter]: "#9cdcfe", // Parameters
    [SyntaxKind.PropertyAccessExpression]: "#d7ba7d", // Properties
    [SyntaxKind.ModuleDeclaration]: "#c586c0", // Modules/Namespaces
    [SyntaxKind.VariableDeclaration]: "#9cdcfe", // Variables
    [SyntaxKind.SingleLineCommentTrivia]: "#6a9955", // Comments
    [SyntaxKind.FirstPunctuation]: "#d4d4d4", // Punctuation (e.g., braces, commas)
    [SyntaxKind.FirstBinaryOperator]: "#d4d4d4", // Operators (e.g., `+`, `-`, `=` )
    [SyntaxKind.EnumDeclaration]: "#b8d7a3", // Enum names
};

keyswords.forEach((key) => (theme[key] = colors.keyword));
types.forEach((key) => (theme[key] = colors.type));
accentKeyword.forEach((key) => (theme[key] = colors.accentKeyword));
