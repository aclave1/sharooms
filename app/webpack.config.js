var webpack = require('webpack');
var path = require('path');



module.exports = {
    context: __dirname + '/assets/js',
    //the file to build
    entry: './main.js',
    output: {
        path: __dirname + '/assets/js',
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            //file path aliases
            "angular": "vendor/angular/angular.min.js",
            //"jquery": "vendor/jquery/dist/jquery.min.js",
            "socketio": "vendor/socket.io-client/index.js",
            //"router": "vendor/angular-ui-router/release/angular-ui-router.min.js",
            //"jqueryui": "vendor/jquery-ui/ui/minified/jquery-ui.min.js",
            //"angular-bootstrap": "vendor/angular-bootstrap/ui-bootstrap-tpls.min.js"
            "ngfile": "vendor/ng-file-upload/angular-file-upload-all.min.js"

        },
        root: ['assets/js', 'assets/js/modules','node_modules'],
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
        modulesDirectories:['node_modules','lib/iso']
    },
    resolveLoader:{
        root: [path.join(__dirname,"node_modules")]
    },
    plugins: [
    ],
    module: {
        loaders: [
            {test: require.resolve("./assets/js/vendor/angular/angular"), loaders: "expose?angular"},
            { test: /\.html$/, loader: "html"},
            {test:/\.ts$/,loader:'typescript-loader'}
        ],

        noParse: [
           path.join(__dirname, "assets/js/dependencies", "sails.io.js")
        ]
    }
};
