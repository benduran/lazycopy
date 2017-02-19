'use strict';

import path from 'path';
import fs from 'fs';

import glob from 'glob';
import minimist from 'minimist';

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
    copy(sources, fromCli = false) {
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
    copySync(sources, fromCli = false) {
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

const instance = new Copier();

export default instance;

if (!module.parent) {
    const args = process.argv.slice(2);
    if (args.length >= 2) {
        const src = args[0];
        const dest = args[1];
        const {
            maintainStructure = true,
            async = true
        } = minimist(args.slice(2));
        // First arg is the SRC glob and the 2nd is the destination. Optional arg is maintainStructure
        if (async) {
            instance.copy([{
                src,
                dest,
                maintainStructure
            }]).then(() => {
                console.log(`lazycopy done copying ${src} to ${dest}`);
            }).catch((error) => {
                console.error(error);
            });
        }
        else {
            try {
                instance.copySync([{
                    src,
                    dest,
                    maintainStructure
                }], true);
                console.log(`lazycopy done copying ${src} to ${dest}`);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    else {
        console.log('lazycopy requires minimum of two arguments.');
        console.log('lazycopy [srcGlob] [dest] [--maintainStructure=true]');
    }
}
