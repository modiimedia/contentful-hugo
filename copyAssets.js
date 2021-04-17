/* eslint-disable @typescript-eslint/no-var-requires */
const { copy, mkdirp } = require('fs-extra');

mkdirp('./dist/main/initializeDirectory/assets/partials')
    .then(async () => {
        await copy(
            './src/main/initializeDirectory/assets/partials',
            './dist/main/initializeDirectory/assets/partials'
        );
        copy(
            './src/main/initializeDirectory/assets/shortcodes',
            './dist/main/initializeDirectory/assets/shortcodes'
        );
    })
    .catch((err) => {
        throw err;
    });
