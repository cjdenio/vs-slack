const path = require("path");

module.exports = (env, argv) => ({
  entry: "./src/index.tsx",

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: [".tsx", ".ts", ".jsx", ".js"] },

  output: {
    filename: "ui.js",
    path: path.resolve(__dirname, "dist"), // Compile into a folder called "dist"
  },
});
