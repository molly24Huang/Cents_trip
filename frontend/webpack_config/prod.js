const commonConfig = require('./base').commonConfig;
const root = require('./base').root;
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const SplitByPathPlugin = require('webpack-split-by-path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = function () {
    return webpackMerge.strategy({
        plugins: 'prepend',
    })(commonConfig(), {
        devtool: 'cheap-module-source-map',
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
            new webpack.ProvidePlugin({
                env: root`/src/env/prod`,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV':
                   JSON.stringify('production'),
            }),
            new webpack.optimize.UglifyJsPlugin({
                beautiful: false,
                mangle: {
                    screw_ie8: true,
                },
                comporess: {
                    screw_ie8: true,
                },
                comments: false,
            }),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new SplitByPathPlugin([
                {
                    name: 'vendor',
                    path: root`/node_modules`,
                }, {
                    manifest: 'manifest',
                }]),
            new LodashModuleReplacementPlugin(),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            }),
        ],
    });
};
