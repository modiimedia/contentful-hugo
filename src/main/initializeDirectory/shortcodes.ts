import fs from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

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
    const camelCaseName: string = noExtension.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
    );
    shortcodes[camelCaseName] = {
        filename: name,
        template: fs
            .readFileSync(resolve(__dirname, `./assets/shortcodes/${name}`))
            .toString(),
    };
}

export default shortcodes;
