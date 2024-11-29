const path = require("path");
// const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
    const isProd = argv.mode === "production";
    return [
        {
            entry: { worker: "./src/worker.ts" },
            output: {
                path: path.resolve(__dirname, "build"),
                filename: "worker.js",
            },
            devtool: isProd ? undefined : "inline-source-map",
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: "ts-loader",
                        },
                        exclude: /node_modules/,
                    },
                ],
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
        },
        {
            entry: { main: "./src/index.ts" },
            output: {
                path: path.resolve(__dirname, "build"),
                filename: "app.[chunkhash].js",
            },
            devtool: isProd ? undefined : "inline-source-map",
            devServer: {
                watchFiles: ["src/*.css"],
                hot: false,
                liveReload: true,
            },
            module: {
                rules: [
                    {
                        test: /\.txt$/i,
                        type: "asset/source",
                    },
                    {
                        test: /\.css$/,
                        use: [MiniCssExtractPlugin.loader, "css-loader"],
                    },
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: "ts-loader",
                            options: {
                                onlyCompileBundledFiles: true,
                            },
                        },
                        exclude: /node_modules/,
                    },
                ],
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
            plugins: [
                new CopyPlugin({
                    patterns: [
                        { from: "public/manifest.json", to: "." },
                        { from: "public/favicon.svg", to: "." },
                        {
                            from: "node_modules/typescript/lib/lib.*",
                            to: "lib/[name][ext]",
                        },
                        { from: "lib", to: "./dep" },
                    ],
                }),
                new HtmlWebpackPlugin({
                    template: "public/index.html",
                    chunks: ["main"],
                }),
                // new webpack.DefinePlugin({
                //     ISOLATED: argv.env.isolated,
                // }),
                new MiniCssExtractPlugin({
                    filename: "styles.[chunkhash].css",
                }),
            ],
        },
    ];
};
