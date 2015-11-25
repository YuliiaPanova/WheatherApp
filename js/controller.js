require.config(
    {
        baseUrl: './js',
        // if you need disable JS cache
        //urlArgs: "bust=" + (new Date()).getTime(),
        paths: {
            jquery: './vendor/jquery',
            jcarousel: './vendor/jcarousel',
            //'jquery-ui': './vendor/jquery-ui',
            //jrange: './vendor/jrange',
            rangeslider: './vendor/rangeslider',
            underscore: './vendor/underscore'
        },
        shim: {
            underscore: {
                exports: '_'
            },
            //"jquery-ui": {
            //    deps: ['jquery'],
            //    exports: '$.ui'
            //},
            jcarousel: {
                deps: ['jquery'],
                exports: '$.jCarousel'
            },
            rangeslider:{
                deps: ['jquery'],
                exports:'$.jRange'
                //exports:'jRange'
            }
        },
        moment: {
            noGlobal: true
        },
        enforceDefine: true
    }
);
define(function(require) {

var $ = require('jquery'),
    basic = require('basic'),
    view = require('view'),
    keeper = require('city-keeper');
    settings = require('settings');
    // TODO организовать таймер

});