const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        app: "./src/app.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /src/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.ts$/,
                include: /src/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                },
            },
            {
                test: /\.wxml$/,
                include: /src/,
                use: [
                    {
                        loader: "wxml-loader",
                    },
                ],
            },
            {
                test: /\.wxs$/,
                include: /src/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.wxss$/,
                include: /src/,
                exclude: /node_modules/,
                use: ["less-loader"],
            },
            {
                test: /\.less$/,
                include: /src/,
                exclude: /node_modules/,
                use: ["less-loader"],
            },
            {
                test: /\.(json|png|jpg|gif)$/,
                include: /src/,
                use: ["file-loader"],
            },
        ],
    },
    plugins: [
        new MPWebpackPlugin()
    ]
};
