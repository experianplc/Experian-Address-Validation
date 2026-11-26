const webpack = require('webpack');
const config = require('./webpack.config');

config.mode = 'production';

webpack(config, (error, stats) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
    return;
  }

  if (stats.hasErrors()) {
    console.error(stats.toString({ all: false, errors: true, colors: process.stdout.isTTY }));
    process.exitCode = 1;
    return;
  }

  console.log(stats.toString({ all: false, assets: true, colors: process.stdout.isTTY }));
});
