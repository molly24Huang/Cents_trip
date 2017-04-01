const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: 6 })
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');

const frontendDir = `${__dirname}/..`;

const happypacks = [
    new HappyPack({
        id: 'jsx',
        threadPool: happyThreadPool,
        loaders: [
            'babel-loader',
        ],
    }),
    new HappyPack({
        id: 'sass',
        threadPool: happyThreadPool,
        cache: false,
        loaders: [
            'css-loader',
            'resolve-url-loader',
            'postcss-loader',
            'sass-loader?sourceMap',
        ],
    }),
];


const root = (_path) => {
    let __path = Object.prototype.toString.apply(_path) === '[object String]' ?
            _path :
            _path[0];
    return path.join(frontendDir, __path.startsWith('/') ? __path : `/${__path}`);
};

module.exports.commonConfig = function () {
    return {

        entry: {
            main: [
                'es6-promise/auto',
                'url-search-params-polyfill',
                'whatwg-fetch',
                root`/src/main/polyfill/url`,
                root`/src/main/polyfill/startsWith`,
                root`/src/main/polyfill/includes`,
                root`/src/main/polyfill/arrayIncludes`,
                root`/src/index.jsx`,
                root`/src/sass/app.scss`,
            ],

        },

        output: {
            path: root`/dist`,
            filename: '[name].js',
            publicPath: '/',
        },

        module: {
            rules: [{
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!camelcase\/)/,
                use: 'happypack/loader?id=jsx',
            }, {
                test: /\.pug$/,
                use: 'pug-loader',
            }, {
                test: /\.scss$/,
                use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: 'happypack/loader?id=sass',
                }),
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            }, {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 30000,
                        name: '[name]-[hash].[ext]',
                    },
                }],
            }, {
                test: /\.yaml$/,
                use: [
                    'json-loader',
                    'yaml-include-loader',
                ],
            }, {
                test: /\.reducer\.yml$/,
                use: 'yamlReducer-loader',
            }, {
                test: /\.csv$/,
                use: 'dsv-loader',
            }],
        },
        resolveLoader: {
            alias: {
                'yamlReducer-loader': root`/yamlReducerLoader`,
            },
        },
        resolve: {
            extensions: [
                '*', '.js', '.jsx', '.scss',
            ],
            alias: {
                font: root`/src/font`,
                img: root`/src/img`,
                main: root`/src/main`,
                components: root`/src/components`,
                reducers: root`/src/reducers`,
                pages: root`/src/pages`,
            },
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: root`/src/assets/`,
                to: root`/dist/assets/`,
            }], {
                debug: 'debug'
            }),
            new webpack.ProvidePlugin({
                React: 'react',
                ReactDOM: 'react-dom',
                Config: root`/src/main/config.js`
            }),
            new HTMLWebpackPlugin({
                filename: 'index.html',
                hash: true,
                inject: 'body',
                template: root`/src/index.pug`,
            }),
            new ExtractTextWebpackPlugin({
                filename: 'style.css',
                allChunks: true,
            }),
            ...happypacks,
        ],
    };
};

module.exports.root = root;
