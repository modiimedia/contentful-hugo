const fs = require('fs');
const mkdirp = require('mkdirp');

const initializeDirectory = async () => {
    const directory = './layouts/shortcodes/contentful-hugo';
    mkdirp.sync(directory);
};

initializeDirectory();
