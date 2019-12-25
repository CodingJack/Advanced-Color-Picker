const TerserPlugin = require( 'terser-webpack-plugin' );
const resolve = require( 'path' ).resolve;

module.exports = {
	target: 'web',
	output: {
		path: resolve( 'dist' ),
		filename: 'cj-color.min.js',
		chunkFilename: 'cj-color-chunk-[id].min.js',
		publicPath: 'js/',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: require( './babel.config.js' ),
					},
					{
						loader: 'eslint-loader',
						options: require( './eslint.config.js' ),
					},
				],
			},
			{
				test:/\.(s*)css$/,
                use:[
					'style-loader',
					'css-loader', 
					'sass-loader',
				]
			},
		],
	},
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
};
