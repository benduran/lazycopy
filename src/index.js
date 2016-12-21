'use strict';

import path from 'path';
import fs from 'fs';

import glob from 'glob';

class Copier {
    ensurePath(p) {
        // ensures that the file path exists on disk
        const filename = path.basename(p);
        const extension = path.extname(p);
        let absPath = null;
        if (!extension) {
            absPath = p.substring(0, p.lastIndexOf(path.sep));
        }
        else {
            absPath = p.substring(0, p.indexOf(filename));
        }
        let constructed = '';
        absPath.split(path.sep).filter((part) => {
            return part.length;
        }).forEach((part) => {
            if (!constructed) {
                constructed = part;
            }
            else {
                constructed += `${path.sep}${part}`;
            }
            if (!fs.existsSync(constructed)) {
                fs.mkdirSync(constructed);
            }
        });
    }
    copy(sources) {
        return new Promise((resolve, reject) => {
            if (!sources) {
                reject(new Error('No sources were provided.'));
            }
            else {
                let topPromises = [];
                sources.forEach((s) => {
                    topPromises.push(new Promise((resolve, reject) => {
                        const {
                            src,
                            dest
                        } = s;
                        let {
                            cwd = process.cwd()
                        } = s;
                        cwd = path.resolve(cwd);
                        glob(path.resolve(path.join(cwd, src)), {
                            nodir: true
                        }, (error, results) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                let childPromises = [];
                                results.forEach((r) => {
                                    childPromises.push(new Promise((resolve, reject) => {
                                        const relativePath = path.relative(cwd, r);
                                        const toPath = path.join(path.resolve(path.join(dest, relativePath)));
                                        this.ensurePath(toPath);
                                        fs.createReadStream(r)
                                        .pipe(fs.createWriteStream(toPath));
                                        resolve();
                                    }));
                                });
                                Promise.all(childPromises).then(resolve).catch(reject);
                            }
                        });
                    }));
                });
                Promise.all(topPromises).then(resolve).catch(reject);
            }
        });
    }
}

function getInstance() {
    return new Copier();
}

export default getInstance;
