/* eslint-disable @typescript-eslint/no-var-requires */
const ncp = require('ncp').ncp;
const mkdirp = require('mkdirp');

mkdirp.sync('./dist/main/src/initializeDirectory/assets/partials');

ncp(
    './src/main/src/initializeDirectory/assets/partials',
    './dist/main/src/initializeDirectory/assets/partials',
    err => {
        if (err) {
            throw err;
        }
    }
);

ncp(
    './src/main/src/initializeDirectory/assets/shortcodes',
    './dist/main/src/initializeDirectory/assets/shortcodes',
    err => {
        if (err) {
            throw err;
        }
    }
);
