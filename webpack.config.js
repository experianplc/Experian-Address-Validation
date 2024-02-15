const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/ts/index.ts',
  devtool: 'inline-source-map',
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/images', to: path.resolve(__dirname, 'dist/images') },
        { from: './src/css', to: path.resolve(__dirname, 'dist/css') },
        { from: './src/js', to: path.resolve(__dirname, 'dist/js') }
      ],
    }),
  ],
  output: {
    filename: 'experian-address-validation.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
};