'use strict';

import path from 'path';

import {expect} from 'chai';
import glob from 'glob';

import copier from '../dist/index';

function runAll() {
    describe('Copy tests', () => {
        it('Should copy everything from the node_modules folder into a testing folder', () => {
            const src = path.resolve(path.join(__dirname, '../node_modules/**/**'));
            const testAgainst = glob.sync(src);
            return copier().copy([{
                src,
                dest: './testing'
            }]).then(() => {
                // May need to wait for all files to be copied, as the code will likely finish executing before the OS
                // kernel has actually performed the file I/O
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const copiedFiles = glob.sync(path.resolve(path.join(__dirname, '../testing/node_modules/**/**')));
                        console.info(`${copiedFiles.length} is equal to ${testAgainst.length}`);
                        expect(copiedFiles.length).to.be.equal(testAgainst.length);
                        resolve();
                    }, 5000);
                });
            }).catch((error) => {
                console.info('Blew up!');
                expect(error).to.not.be.an('error');
            });
        }).timeout(10000);
    });
}

runAll();
