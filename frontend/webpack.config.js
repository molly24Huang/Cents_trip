module.exports = function (env = 'dev') {
    return require(`./webpack_config/${env}.js`)();
};
