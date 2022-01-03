import fs from 'fs';
import { resolve } from 'path';

const codeNames = [
    'asset-hyperlink.html',
    'embedded-asset.html',
    'embedded-entry.html',
    'entry-hyperlink.html',
    'inline-entry.html',
];
const shortcodes: {
    [key: string]: { filename: string; template: string };
} = {};

for (const name of codeNames) {
    const noExtension = name.replace('.html', '');
    const camelCaseName: string = noExtension.replace(
        /-([a-z])/g,
        (g) => g[1].toUpperCase()
    );
    shortcodes[camelCaseName] = {
        filename: name,
        template: fs
            .readFileSync(resolve(__dirname, `./assets/shortcodes/${name}`))
            .toString(),
    };
}

export default shortcodes;
