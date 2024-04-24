import fs from 'fs-extra';

async function main() {
    await fs.mkdirp('./dist/main/initializeDirectory/assets/partials');
    await Promise.all([
        fs.copy(
            './src/main/initializeDirectory/assets/partials',
            './dist/shared/assets/partials'
        ),
        fs.copy(
            './src/main/initializeDirectory/assets/shortcodes',
            './dist/shared/assets/shortcodes'
        ),
    ]);
}

main();
