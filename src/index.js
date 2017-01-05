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
                            dest,
                            maintainStructure = true
                        } = s;
                        let {
                            cwd = process.cwd()
                        } = s;
                        cwd = path.resolve(cwd);
                        const scanPath = path.isAbsolute(src) ? src : path.resolve(path.join(cwd, src));
                        glob(scanPath, {
                            nodir: true
                        }, (error, results) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                let childPromises = [];
                                results.forEach((r) => {
                                    childPromises.push(new Promise((resolve, reject) => {
                                        try {
                                            const relativePath = path.relative(cwd, r);
                                            let toPath = null;
                                            if (maintainStructure) {
                                                toPath = path.resolve(path.join(dest, relativePath));
                                            }
                                            else {
                                                // All files are going into a folder, but we no longer care about their original path structure
                                                toPath = path.resolve(path.join(dest, path.basename(r)));
                                            }
                                            this.ensurePath(toPath);
                                            fs.createReadStream(r)
                                            .pipe(fs.createWriteStream(toPath));
                                            resolve();
                                        }
                                        catch (ex) {
                                            console.error(ex);
                                            reject(ex);
                                        }
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
    copySync(sources) {
        sources.forEach((s) => {
            const {
                src,
                dest,
                maintainStructure = true
            } = s;
            let {
                cwd = process.cwd()
            } = s;
            cwd = path.resolve(cwd);
            try {
                const scanPath = path.isAbsolute(src) ? src : path.resolve(path.join(cwd, src));                
                const results = glob.sync(scanPath, {
                    nodir: true
                });
                results.forEach((r) => {
                    const relativePath = path.relative(cwd, r);
                    let toPath = null;
                    if (maintainStructure) {
                        toPath = path.resolve(path.join(dest, relativePath));
                    }
                    else {
                        // All files are going into a folder, but we no longer care about their original path structure
                        toPath = path.resolve(path.join(dest, path.basename(r)));
                    }
                    this.ensurePath(toPath);
                    fs.createReadStream(r)
                    .pipe(fs.createWriteStream(toPath));
                });
            }
            catch (ex) {
                throw ex;
            }
        });
    }
}

export default new Copier();
