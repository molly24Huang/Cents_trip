const commonConfig = require('./base').commonConfig;
const root = require('./base').root;
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const port = 3000;

module.exports = function () {
    return webpackMerge.strategy({
        entry: 'prepend',
        plugins: 'prepend',
    })(commonConfig(), {
        devtool: 'source-map',
        entry: {
            webpackServer: [
                `webpack-dev-server/client?http://0.0.0.0:${port}`,
                'webpack/hot/only-dev-server',
            ],
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.ProvidePlugin({
                env: root`/src/env/dev`,
            }),
        ],
    });
};
