const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const project = require('../project.config')

const inProject = (...args) => path.resolve(project.basePath, ...args)
const inProjectSrc = (file) => inProject(project.srcDir, file)

const __DEV__ = project.env === 'development'
const __STAGING__ = project.env === 'staging'
const __TEST__ = project.env === 'test'
const __PROD__ = project.env === 'production'

const config = {
  entry: {
    main: [
      inProjectSrc(project.main),
    ],
  },
  devtool: project.sourcemaps ? 'source-map' : false,
  performance: {
    hints: false,
  },
  output: {
    path: inProject(project.outDir),
    filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
    publicPath: project.publicPath,
  },
  resolve: {
    modules: [
      inProject(project.srcDir),
      'node_modules',
    ],
    extensions: ['*', '.js', '.json'],
  },
  externals: project.externals,
  module: {
    rules: [
      {
        test: /\.(eot|gif|jpg|jpeg|png|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(Object.assign({
      'process.env': { NODE_ENV: JSON.stringify(project.env) },
      __DEV__,
      __STAGING__,
      __TEST__,
      __PROD__,
    }, project.globals))
  ],
}

// JavaScript
// ------------------------------------
config.module.rules.push({
  test: /\.js$/,
  exclude: /node_modules/,
  use: [{
    loader: 'babel-loader',
    query: {
      cacheDirectory: true,
      plugins: [
        'babel-plugin-transform-class-properties',
        'babel-plugin-transform-runtime',
      ],
      presets: [
        'babel-preset-react',
        'babel-preset-stage-1',
        ['babel-preset-env', {
          targets: {
            browsers: ['last 2 versions'],
            uglify: true,
          },
        }],
      ]
    },
  }],
})

// Styles
// ------------------------------------
const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: __DEV__,
})

config.module.rules.push({
  test: /\.(sass|scss)$/,
  exclude: /node_modules/,
  loader: extractSass.extract({
    fallback: 'style-loader',
    use: [
      'css-loader?sourceMap',
      {
        loader: 'sass-loader?sourceMap',
        query: {
          includePaths: [
            inProjectSrc('styles'),
          ],
        },
      }
    ],
  })
})
config.plugins.push(extractSass)

// HTML Template
// ------------------------------------
const htmlWebpackPluginOpts = {
  title: 'Genesis Application',
  inject: true,
  template: project.templatePath,
  minify: {
    collapseWhitespace: true,
  },
}
// HtmlWebpackPlugin doesn't work if `template` is undefined or null, so
// we have to explicitly delete the key when it's undefined.
if (!htmlWebpackPluginOpts.template) {
  delete htmlWebpackPluginOpts.template
}
config.plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOpts))

if (!__TEST__) {
  const bundles = ['manifest']

  if (project.vendors && project.vendors.length) {
    bundles.unshift('vendor')
    config.entry.vendor = project.vendors
  }
  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({ names: bundles }))
}
if (__PROD__ || __STAGING__) {
  config.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: !!config.devtool,
      comments: false,
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
    })
  )
}

module.exports = config
