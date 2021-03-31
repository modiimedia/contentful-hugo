/* eslint-disable @typescript-eslint/no-var-requires */
const { copy, mkdirp } = require('fs-extra');

mkdirp('./dist/main/src/initializeDirectory/assets/partials')
    .then(async () => {
        await copy(
            './src/main/src/initializeDirectory/assets/partials',
            './dist/main/src/initializeDirectory/assets/partials'
        );
        copy(
            './src/main/src/initializeDirectory/assets/shortcodes',
            './dist/main/src/initializeDirectory/assets/shortcodes'
        );
    })
    .catch((err) => {
        throw err;
    });
