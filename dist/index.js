'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromCli = !module.parent; // If there isn't a parent module, then it was run directly from the CLI

function copydiff() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Promise(function (resolve, reject) {
        if (fromCli) {
            args = (0, _minimist2.default)(process.argv.slice(2));
        }
        var _args = args,
            o = _args.o,
            overwrite = _args.overwrite,
            from = _args.from,
            to = _args.to;

        var overwriteFiles = o || overwrite || false;
        if (!from) {
            reject(new Error('No "from" provided to copydiff'));
        }
        if (!to) {
            reject(new Error('No "to" provided to copydiff'));
        }
        var fromResolved = _path2.default.resolve(from);
        var toResolved = _path2.default.resolve(to);
        var useForwardSlash = fromResolved.lastIndexOf('/') > -1;
        var scanPath = fromResolved;
        if (_fsExtra2.default.statSync(fromResolved).isDirectory()) {
            scanPath += '/**/*.*';
        }
        (0, _glob2.default)(_path2.default.resolve(scanPath), {
            nodir: true
        }, function (error, results) {
            if (error) {
                reject(error);
            } else {
                (function () {
                    var bar = null,
                        allPromises = [];
                    if (fromCli) {
                        console.log(results.length + ' files to be copied');
                    }
                    // Check if the file is already existing in the new location
                    var counter = 0;
                    results.forEach(function (r) {
                        var def = new Promise(function (resolve, reject) {
                            var resolvedPath = _path2.default.resolve(r);
                            var relPath = resolvedPath.replace(fromResolved, '');
                            // We now have the relative path to the FROM area, so we should be able to copy this over to the TO area
                            var computedToPath = '' + toResolved + relPath;
                            try {
                                if (overwriteFiles || !_fsExtra2.default.existsSync(computedToPath)) {
                                    _fsExtra2.default.copySync(resolvedPath, computedToPath, {
                                        clobber: overwriteFiles,
                                        preserveTimestamps: true
                                    });
                                    counter++;
                                    if (fromCli) {
                                        process.stdout.write(counter + ' of ' + results.length + ' files copied\r'); // This makes us continue outputting on the same line in the CLI
                                    }
                                    resolve();
                                } else {
                                    resolve();
                                }
                            } catch (error) {
                                reject(error);
                            }
                        });
                        allPromises.push(def);
                    });
                    Promise.all(allPromises).then(function () {
                        if (fromCli) {
                            console.log('All ' + results.length + ' files have been copied to ' + toResolved);
                        }
                        resolve();
                    }).catch(function (error) {
                        if (fromCli) {
                            console.log(error.stack);
                            console.error(error);
                        }
                        reject(error);
                    });
                })();
            }
        });
    });
}

exports.default = copydiff;


if (fromCli) {
    Promise.resolve(copydiff()).then(function () {}).catch(function (error) {
        console.log(error.stack);
        console.error(error);
    }).then(function () {
        process.exit();
    });
}