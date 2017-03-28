const webpack = require('webpack');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const port = 3000;


new WebpackDevServer(webpack(config()), {
    contentBase: path.join(__dirname, '../dist'),
    colors: true,
    progress: true,
    hot: true,
    pulicPath: '/',
    historyApiFallback: true,
    // proxy: {
    //     '/api/*': '',
    // },
}).listen(port, '0.0.0.0', (err) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Listening at http://localhost:${port}/`);
    return void (0);
});
