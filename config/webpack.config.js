const ESLintPlugin = require( 'eslint-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const resolve = require( 'path' ).resolve;
const webpack = require( 'webpack' );

module.exports = env => {
  const plugins = [ 
    new ESLintPlugin( require( './eslint.config.js' ) ),
  ];
  const { WEBPACK_BUILD: production } = env;
  if( ! production ) {
    plugins.push( new webpack.SourceMapDevToolPlugin( {} ) );
  }
  return {
    target: 'web',
    output: {
      path: resolve( 'dist' ),
      filename: 'cj-color.min.js',
      chunkFilename: 'cj-color-chunk-[id].min.js',
      publicPath: 'js/',
    },
    resolve: {
      alias: {
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      },
    },
    module: {
      noParse: [
        /benchmark/,
      ],
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: require( './babel.config.js' ),
            },
            {
              loader: 'source-map-loader',
              options: {},
            },
          ],
        },
        {
          test: /\.(s*)css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                injectType: 'styleTag',
              },
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    stats: 'error-details',
    optimization: {
      minimizer: [
        new TerserPlugin( {
          terserOptions: {
            output: {
              comments: false,
            },
          },
          extractComments: true,
        } ),
      ],
    },
    plugins,
    devtool: false,
    performance: {
      hints: false,
      maxEntrypointSize: 300000,
      maxAssetSize: 300000
    },
  };
}
