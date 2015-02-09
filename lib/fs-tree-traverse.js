var Q = require('q'),
    fs = require('graceful-fs'),
    _ = require('underscore'),
    path = require('path');

module.exports = function (root, options, callback) {

    if (arguments.length === 2 && typeof options === 'function') {
        callback = options;
    }

    options = options || {};

    function list(dir) {
        return Q.nfcall(fs.readdir, dir)
            .then(function (files) {
                return files.map(function (f) {
                    return type(path.join(dir, f));
                });
            })
            .spread(function () {
                return [].slice.call(arguments);
            });
    }

    function type(file) {
        if (!options.hidden && path.basename(file).charAt(0) === '.') {
            return;
        }
        return Q.nfcall(fs.stat, file)
            .then(function (stat) {
                if (stat.isFile()) {
                    return file;
                } else if (stat.isDirectory()) {
                    return list(file);
                }
            });
    }

    list(root).then(function (files) {
        var regex = new RegExp('^' + root);
        files = _.chain(files)
            .flatten()
            .filter(_.identity)
            .map(function (p) {
                return options.relative ? p.replace(regex, '.') : p;
            })
            .value();
        callback(null, files);
    }, function (err) {
        callback(err);
    });

};