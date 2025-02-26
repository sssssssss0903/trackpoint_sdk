const path = require('path');

module.exports = {
  entry: './src/sdk/sdk.ts',  // SDK 入口文件
  output: {
    filename: 'track-point-sdk.js',  // 打包后的文件名
    path: path.resolve(__dirname, 'dist'),  // 打包输出目录
    library: 'TrackPointSDK',  // 将 SDK 暴露为全局变量
    libraryTarget: 'umd',  // 支持多种模块规范
  },
  resolve: {
    extensions: ['.ts', '.js'],  // 解析 .ts 和 .js 文件
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',  // 使用 ts-loader 编译 TypeScript 文件
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',  // 生成 sourcemap 以方便调试
  mode: 'production',  // 打包模式为生产模式
};