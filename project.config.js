const path = require('path')

module.exports = {
  env          : process.env.NODE_ENV || 'development',
  main         : 'main',
  basePath     : __dirname,
  srcDir       : 'src',
  outDir       : 'dist',
  sourcemaps   : true,
  publicPath   : '/',
  templatePath : path.resolve(__dirname, 'src/index.html'),
  externals    : {},
  globals      : {},
  vendors      : [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'redux-thunk',
    'react-router',
  ],
}
