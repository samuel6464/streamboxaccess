const { override, addWebpackPlugin } = require("customize-cra");
const rewireMomentLocalesPlugin = require('react-app-rewire-moment-locales-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { appendWebpackPlugin } = require("@rescripts/utilities");
const { DefinePlugin } = require("webpack");
const { NODE_ENV, API_PROD_URL, API_DEV_URL } = process.env
const API_URL = NODE_ENV === 'production' ? API_PROD_URL : API_DEV_URL
const rewireDefinePlugin = require('react-app-rewire-define-plugin')

require("dotenv").config();

/*const supportMjs = () => (config, env) => {
    // config = webpackconfig
    config = rewireMomentLocalesPlugin(config, env, {
        localesToKeep: ['en'] // optional
    })

    if (!config.plugins) {
        config.plugins = [];
    }
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
    });


    config.plugins.push(new rewireMomentLocalesPlugin())

    return config;
};*/

// Use `webpack.DefinePlugin` to add the version number from package.json


module.exports = function override(config, env) {
    /*appendWebpackPlugin(
        new DefinePlugin({ API_URL }),
        config,
    )*/

    config = rewireDefinePlugin(config, env, {
        'process.env.VERSION': JSON.stringify(require('./package.json').version)
    })


    if (!config.plugins) {
        config.plugins = [];
        config.plugins.push(new MomentLocalesPlugin())

    } else {
        config.plugins.push(new MomentLocalesPlugin())

    }
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
    });

    if (env === 'production') {
        config = rewireMomentLocalesPlugin(config, env, {
            localesToKeep: ['fr'] // optional
        })
    }


    appendWebpackPlugin(
        new DefinePlugin({
            "process.env.API_URL": JSON.stringify(API_URL)
        }),
        config
    );

    return config;

};

/*
module.exports = function override(config, env) {
    if (env === 'production') {
        config = rewireMomentLocalesPlugin(config, env, {
            localesToKeep: ['en', 'fr'] // optional
        })
    }

    return config

}*/