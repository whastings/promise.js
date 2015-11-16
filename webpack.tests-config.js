var distConfig = require('./webpack.config');

var config = module.exports = {
  entry: './tests/index.js',
  externals: [
    {
      '../lib/Unbreakable': 'var Promise'
    },
    'sinon'
  ],
  output: {
    filename: 'browser-tests.js'
  },
  module: {
    loaders: distConfig.module.loaders
  },
  node: distConfig.node
};

config.node.process = true;
config.node.fs = 'empty';
