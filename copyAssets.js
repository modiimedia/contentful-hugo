// eslint-disable-next-line @typescript-eslint/no-var-requires
const ncp = require('ncp').ncp;

ncp(
    './src/initializeDirectory/partials',
    './dist/src/initializeDirectory/partials',
    err => {
        if (err) {
            throw err;
        }
    }
);

ncp(
    './src/initializeDirectory/shortcodes',
    './dist/src/initializeDirectory/shortcodes',
    err => {
        if (err) {
            throw err;
        }
    }
);
