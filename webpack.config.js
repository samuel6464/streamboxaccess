var path = require('path');
var webpack = require('webpack');
var CompressionPlugin = require('compression-webpack-plugin');



const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/dist/"
    },


    /*optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    maxSize: 250000, //or whatever size you want
                },
            },
        },

    }*/
    // add the babel-loader and presets
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: "babel-loader",
                    options: { presets: ["@babel/preset-env", "@babel/preset-react"] }
                }]
            }
        ]
    },
    optimization: { splitChunks: { chunks: 'all' } }
    ,

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                'NODE_ENV': JSON.stringify('production'),
            }
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr|en/),
        new BundleAnalyzerPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),

    ],


    // end of babel-loader
};