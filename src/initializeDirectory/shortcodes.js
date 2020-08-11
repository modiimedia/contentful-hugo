const fs = require('fs');
const { resolve } = require('path');

const codeNames = [
    'asset-hyperlink.html',
    'embedded-asset.html',
    'embedded-entry.html',
    'entry-hyperlink.html',
    'inline-entry.html',
];
const shortcodes = {};

for (const name of codeNames) {
    const noExtension = name.replace('.html', '');
    const camelCaseName = noExtension.replace(/-([a-z])/g, function(g) {
        return g[1].toUpperCase();
    });
    shortcodes[camelCaseName] = {
        filename: name,
        template: fs
            .readFileSync(resolve(__dirname, `./shortcodes/${name}`))
            .toString(),
    };
}

module.exports = shortcodes;
