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
            return copier().copy([{
                src,
                dest: path.join(__dirname, '../testing'),
                cwd: path.join(__dirname, '../')
            }]).then(() => {
                // May need to wait for all files to be copied, as the code will likely finish executing before the OS
                // kernel has actually performed the file I/O
                // This may not pass on non SSD machines because the I/O time will be substantially longer
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const testPath = path.resolve(path.join(__dirname, '../testing/node_modules/**/**'));
                        const copiedFiles = glob.sync(testPath);
                        console.info(`${testAgainst.length} equal to ${copiedFiles.length}`);
                        expect(copiedFiles.length).to.be.equal(testAgainst.length);
                        resolve();
                    }, 10000);
                });
            }).catch((error) => {
                expect(error).to.not.be.an('error');
            });
        }).timeout(30000);
        it('Should synchronously copy everything from the node_modules folder into a testing folder', () => {
            return new Promise((resolve, reject) => {
                const src = path.resolve(path.join(__dirname, '../node_modules/**/**'));
                const testAgainst = glob.sync(src);
                copier().copySync([{
                    src,
                    dest: path.join(__dirname, '../testing'),
                    cwd: path.join(__dirname, '../')
                }]);
                setTimeout(() => {
                    const testPath = path.resolve(path.join(__dirname, '../testing/node_modules/**/**'));
                    const copiedFiles = glob.sync(testPath);
                    console.info(`${testAgainst.length} equal to ${copiedFiles.length}`);                    
                    expect(copiedFiles.length).to.be.equal(testAgainst.length);
                    resolve();
                }, 10000);
            });
        }).timeout(30000);
        afterEach(() => {
            fs.removeSync(path.join(__dirname, '../testing'));
        });
    });
}

runAll();
