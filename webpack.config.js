module.exports = {
  entry: './Promise.js',
  output: {
    filename: 'dist/Promise.js',
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
  },
  resolve: {
    alias: {
      immediate: './node_modules/immediate/dist/immediate.js'
    }
  }
};
