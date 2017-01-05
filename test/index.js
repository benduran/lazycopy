'use strict';

import path from 'path';

import {expect} from 'chai';
import glob from 'glob';
import fs from 'fs-extra';

import copier from '../dist/index';

function runAll() {
    describe('Copy tests', () => {
        it('Should asynchronously copy everything from the node_modules folder into a testing folder', () => {
            const src = path.resolve(path.join(__dirname, '../node_modules/**/**'));
            const testAgainst = glob.sync(src);
            return copier.copy([{
                src,
                dest: path.join(__dirname, '../testing1'),
                cwd: path.join(__dirname, '../')
            }]).then(() => {
                // May need to wait for all files to be copied, as the code will likely finish executing before the OS
                // kernel has actually performed the file I/O
                // This may not pass on non SSD machines because the I/O time will be substantially longer
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing1/node_modules/**/**'));
                        const copiedFiles = glob.sync(testPath);
                        expect(copiedFiles.length).to.be.equal(testAgainst.length);
                        resolve();
                    }, 10000);
                });
            }).catch((error) => {
                expect(error).to.not.be.an('error');
                reject(error);
            });
        }).timeout(40000);
        it('Should synchronously copy everything from the node_modules folder into a testing folder', () => {
            return new Promise((resolve, reject) => {
                try {
                    const src = path.resolve(path.join(__dirname, '../node_modules/**/**'));
                    const testAgainst = glob.sync(src);
                    copier.copySync([{
                        src,
                        dest: path.join(__dirname, '../testing2'),
                        cwd: path.join(__dirname, '../')
                    }]);
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing2/node_modules/**/**'));
                        const copiedFiles = glob.sync(testPath);
                        expect(copiedFiles.length).to.be.equal(testAgainst.length);
                        resolve();
                    }, 10000);
                }
                catch (error) {
                    reject(error);
                }
            });
        }).timeout(40000);
        it('Should asynchronously copy everything from the node_modules folder, excluding all js files', () => {
            const src = path.resolve(path.join(__dirname, '../node_modules/**/*.!(js)'));
            const testAgainst = glob.sync(src);
            return copier.copy([{
                src,
                dest: path.join(__dirname, '../testing3'),
                cwd: path.join(__dirname, '../')
            }]).then(() => {
                // May need to wait for all files to be copied, as the code will likely finish executing before the OS
                // kernel has actually performed the file I/O
                // This may not pass on non SSD machines because the I/O time will be substantially longer
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing3/node_modules/**/*.!(js)'));
                        const copiedFiles = glob.sync(testPath);
                        expect(copiedFiles.length).to.be.equal(testAgainst.length);
                        resolve();
                    }, 10000);
                });
            }).catch((error) => {
                reject(error);
                expect(error).to.not.be.an('error');
            });
        }).timeout(40000);
        it('Should asynchronously copy javascript files from the node_modules folder to the test folder, ignoring their relative path structure', () => {
            const src = path.resolve(path.join(__dirname, '../node_modules/**/*.js'));
            let testAgainst = glob.sync(src);
            // Need to remove duplicates because the node_modules will likely use similar file names for their logic
            const lookup = {};
            testAgainst.forEach((s) => {
                const filename = path.basename(s);
                if (filename) {
                    lookup[filename] = lookup[filename] ? lookup[filename] + 1 : 1;
                }
            });
            testAgainst = Object.keys(lookup);
            return copier.copy([{
                src,
                dest: path.join(__dirname, '../testing4'),
                cwd: path.join(__dirname, '../'),
                maintainStructure: false
            }]).then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing4/*.js'));
                        const copiedFiles = glob.sync(testPath);
                        expect(testAgainst.length).to.be.equal(copiedFiles.length);
                        resolve();
                    }, 10000);
                });
            }).catch((error) => {
                reject(error);
                expect(error).to.not.be.an('error');
            });
        }).timeout(40000);
        it('Should synchronously copy javascript files from the node_modules folder to the test folder, ignoring their relative path structure', () => {
            const src = path.resolve(path.join(__dirname, '../node_modules/**/*.js'));
            let testAgainst = glob.sync(src);
            // Need to remove duplicates because the node_modules will likely use similar file names for their logic
            const lookup = {};
            testAgainst.forEach((s) => {
                const filename = path.basename(s);
                if (filename) {
                    lookup[filename] = lookup[filename] ? lookup[filename] + 1 : 1;
                }
            });
            testAgainst = Object.keys(lookup);
            return new Promise((resolve, reject) => {
                try {
                    copier.copySync([{
                        src,
                        dest: path.join(__dirname, '../testing5'),
                        cwd: path.join(__dirname, '../'),
                        maintainStructure: false
                    }]);
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing5/*.js'));
                        const copiedFiles = glob.sync(testPath);
                        expect(testAgainst.length).to.be.equal(copiedFiles.length);
                        resolve();
                    }, 10000);
                }
                catch (ex) {
                    reject(ex);
                    expect(ex).to.not.be.an('error');
                }
            });
        }).timeout(40000);
        after(() => {
            fs.removeSync(path.join(__dirname, '../testing1'));
            fs.removeSync(path.join(__dirname, '../testing2'));
            fs.removeSync(path.join(__dirname, '../testing3'));
            fs.removeSync(path.join(__dirname, '../testing4'));
            fs.removeSync(path.join(__dirname, '../testing5'));
        });
    });
}

runAll();
