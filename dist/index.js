'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Copier = function () {
    function Copier() {
        _classCallCheck(this, Copier);
    }

    _createClass(Copier, [{
        key: 'ensurePath',
        value: function ensurePath(p) {
            // ensures that the file path exists on disk
            var filename = _path2.default.basename(p);
            var extension = _path2.default.extname(p);
            var absPath = null;
            if (!extension) {
                absPath = p.substring(0, p.lastIndexOf(_path2.default.sep));
            } else {
                absPath = p.substring(0, p.indexOf(filename));
            }
            var constructed = '';
            absPath.split(_path2.default.sep).filter(function (part) {
                return part.length;
            }).forEach(function (part) {
                if (!constructed) {
                    constructed = part;
                } else {
                    constructed += '' + _path2.default.sep + part;
                }
                if (!_fs2.default.existsSync(constructed)) {
                    _fs2.default.mkdirSync(constructed);
                }
            });
        }
    }, {
        key: 'copy',
        value: function copy(sources) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                if (!sources) {
                    reject(new Error('No sources were provided.'));
                } else {
                    (function () {
                        var topPromises = [];
                        sources.forEach(function (s) {
                            topPromises.push(new Promise(function (resolve, reject) {
                                var src = s.src,
                                    dest = s.dest;
                                var _s$cwd = s.cwd,
                                    cwd = _s$cwd === undefined ? process.cwd() : _s$cwd;

                                cwd = _path2.default.resolve(cwd);
                                var scanPath = _path2.default.isAbsolute(src) ? src : _path2.default.resolve(_path2.default.join(cwd, src));
                                (0, _glob2.default)(scanPath, {
                                    nodir: true
                                }, function (error, results) {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        (function () {
                                            var childPromises = [];
                                            results.forEach(function (r) {
                                                childPromises.push(new Promise(function (resolve, reject) {
                                                    try {
                                                        var relativePath = _path2.default.relative(cwd, r);
                                                        var toPath = _path2.default.resolve(_path2.default.join(dest, relativePath));
                                                        _this.ensurePath(toPath);
                                                        _fs2.default.createReadStream(r).pipe(_fs2.default.createWriteStream(toPath));
                                                        resolve();
                                                    } catch (ex) {
                                                        console.error(ex);
                                                        reject(ex);
                                                    }
                                                }));
                                            });
                                            Promise.all(childPromises).then(resolve).catch(reject);
                                        })();
                                    }
                                });
                            }));
                        });
                        Promise.all(topPromises).then(resolve).catch(reject);
                    })();
                }
            });
        }
    }, {
        key: 'copySync',
        value: function copySync(sources) {
            var _this2 = this;

            sources.forEach(function (s) {
                var src = s.src,
                    dest = s.dest;
                var _s$cwd2 = s.cwd,
                    cwd = _s$cwd2 === undefined ? process.cwd() : _s$cwd2;

                cwd = _path2.default.resolve(cwd);
                try {
                    var scanPath = _path2.default.isAbsolute(src) ? src : _path2.default.resolve(_path2.default.join(cwd, src));
                    var results = _glob2.default.sync(scanPath, {
                        nodir: true
                    });
                    results.forEach(function (r) {
                        var relativePath = _path2.default.relative(cwd, r);
                        var toPath = _path2.default.join(_path2.default.resolve(_path2.default.join(dest, relativePath)));
                        _this2.ensurePath(toPath);
                        _fs2.default.createReadStream(r).pipe(_fs2.default.createWriteStream(toPath));
                    });
                } catch (ex) {
                    throw ex;
                }
            });
        }
    }]);

    return Copier;
}();

function getInstance() {
    return new Copier();
}

exports.default = getInstance;