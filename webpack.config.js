module.exports = {
  entry: './lib/Unbreakable.js',
  output: {
    filename: 'dist/Unbreakable.js',
    library: 'Promise',
    libraryTarget: 'umd',
    sourcePrefix: '  '
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'hidden-source-map',
  node: {
    Buffer: false,
    process: false,
    setImmediate: false
  }
};
