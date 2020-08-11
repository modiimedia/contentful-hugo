const fs = require('fs');
const mkdirp = require('mkdirp');
const shortcodes = require('./shortcodes');

const addShortcodes = () => {
    console.log('adding shortcodes for rich text...');
    const directory = './layouts/shortcodes/contentful-hugo';
    mkdirp.sync(directory);
    Object.keys(shortcodes).forEach(key => {
        const { filename, template } = shortcodes[key];
        const filepath = `${directory}/${filename}`;
        fs.writeFileSync(filepath, template);
        console.log(`created ${filepath}`);
    });
};

const initializeDirectory = async () => {
    addShortcodes();
};

module.exports = initializeDirectory;
