const path = require("path");

module.exports = {
  entry: "./src/worker.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: { configFile: "tsconfig.webpack.json" },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "worker.js",
    path: path.resolve(__dirname, "build"),
  },
};
