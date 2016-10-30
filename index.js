'use strict';

import path from 'path';

import minimist from 'minimist';
import glob from 'glob';
import fs from 'fs-extra';

const fromCli = !module.parent; // If there isn't a parent module, then it was run directly from the CLI

function copydiff(args = {}) {
    return new Promise((resolve, reject) => {
        if (fromCli) {
            args = minimist(process.argv.slice(2));
        }
        const {
            o,
            overwrite,
            from,
            to
        } = args;
        const overwriteFiles = o || overwrite || false;
        if (!from) {
            reject(new Error('No "from" provided to copydiff'));
        }
        if (!to) {
            reject(new Error('No "to" provided to copydiff'));
        }
        const fromResolved = path.resolve(from);
        const toResolved = path.resolve(to);
        const useForwardSlash = fromResolved.lastIndexOf('/') > -1;
        let scanPath = fromResolved;
        if (fs.statSync(fromResolved).isDirectory()) {
            scanPath += '/**/*.*';
        }
        glob(path.resolve(scanPath), {
            nodir: true
        }, (error, results) => {
            if (error) {
                reject(error);
            }
            else {
                let bar = null,
                    allPromises = [];
                if (fromCli) {
                    console.log(`${results.length} files to be copied`);
                }
                // Check if the file is already existing in the new location
                let counter = 0;
                results.forEach((r) => {
                    const def = new Promise((resolve, reject) => {
                        const resolvedPath = path.resolve(r);
                        const relPath = resolvedPath.replace(fromResolved, '');
                        // We now have the relative path to the FROM area, so we should be able to copy this over to the TO area
                        const computedToPath = `${toResolved}${relPath}`;
                        try {
                            if (overwriteFiles || (!overwriteFiles && !fs.existsSync(computedToPath))) {
                                fs.copySync(resolvedPath, computedToPath, {
                                    clobber: overwriteFiles,
                                    preserveTimestamps: true
                                });
                                counter++;
                                if (fromCli) {
                                    process.stdout.write(`${counter} of ${results.length} files copied\r`); // This makes us continue outputting on the same line in the CLI
                                }
                                resolve();
                            }
                            else {
                                resolve();
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                    allPromises.push(def);
                });
                Promise.all(allPromises).then(() => {
                    if (fromCli) {
                        console.log(`All ${results.length} files have been copied to ${toResolved}`);
                    }
                    resolve();
                }).catch((error) => {
                    if (fromCli) {
                        console.log(error.stack);
                        console.error(error);
                    }
                    reject(error);
                });
            }
        });
    });
}

export default copydiff;

if (fromCli) {
    Promise.resolve(copydiff()).then(() => {}).catch((error) => {
        console.log(error.stack);
        console.error(error);
    }).then(() => {
        process.exit();
    });
}
