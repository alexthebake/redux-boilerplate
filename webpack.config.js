const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
    library: 'ReduxBoilerplate',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        // Use the following loader on .js files
        test: /\.js?$/,
        // Don't transpile anything in /node_modules/
        exclude: /node_modules/,
        // Use babel loader
        loader: 'babel-loader',
        query: {
          // We are dealing with es6
          presets: ['env'],
          plugins: ['transform-object-rest-spread'],
        },
      },
    ],
  },
};
