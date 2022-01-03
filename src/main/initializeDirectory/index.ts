import { ensureDir, pathExists, writeFile } from 'fs-extra';
import shortcodes from './shortcodes';
import { loadConfig } from '@/main/config';
import { log } from '@/helpers/logger';

const wait = (milli = 1000): Promise<void> => new Promise((resolve) => {
        setTimeout(() => resolve(), milli);
    });

const generateConfig = async (filepath: string) => {
    log(`creating ./contentful-hugo.config.js`);
    const configContent = `// go to https://github.com/ModiiMedia/contentful-hugo#configuration for configuration instructions

/**
 * @type {import('contentful-hugo').ContentfulHugoConfig}
 */
module.exports = {
    locales: [], // uses default locale if left empty
    singleTypes: [],
    repeatableTypes: [],
};`;
    await writeFile(filepath, configContent);
    log('config file created\n');
};

const checkForConfig = async () => {
    log(`checking for config...`);
    await wait(1000);
    const config = await loadConfig();
    const filepath = './contentful-hugo.config.js';
    if (!config) {
        return generateConfig(filepath);
    }
    const { singleTypes, repeatableTypes } = config;
    if (singleTypes || repeatableTypes) {
        log(`config already exists\n`);
        return null;
    }
    return generateConfig(filepath);
};

const regex = /<<([^%>]+)?>>/g;

const getVariablesFromTemplate = (
    template: string
): RegExpMatchArray | null => {
    const params = template.match(regex);
    return params;
};

interface templateVariables {
    [key: string]: string;
    '<<BACKGROUND_COLOR>>': string;
    '<<TEXT_COLOR>>': string;
    '<<BORDER_COLOR>>': string;
}

const templateVariableValues: templateVariables = {
    '<<BACKGROUND_COLOR>>': 'rgb(255, 231, 231)',
    '<<TEXT_COLOR>>': 'red',
    '<<BORDER_COLOR>>': 'red',
};

const replaceVariablesWithValues = (template: string): string => {
    const values = templateVariableValues;
    const params = getVariablesFromTemplate(template);
    let newTemplate = template;
    if (params && params.length) {
        for (const param of params) {
            newTemplate = newTemplate.replace(param, values[param]);
        }
    }
    return newTemplate;
};

const addShortcodes = async (override = false) => {
    log('adding shortcodes for rich text...');
    await wait(1000);
    const directory = './layouts/shortcodes/contentful-hugo';
    await ensureDir(directory);

    const handleShortCode = async (key: string) => {
        const { filename, template } = shortcodes[key];
        const finalTemplate = replaceVariablesWithValues(template);
        const filepath = `${directory}/${filename}`;
        if ((await pathExists(filepath)) && !override) {
            log(`${filepath} already exists`);
        } else {
            await writeFile(filepath, finalTemplate);
            log(`created ${filepath}`);
        }
    };
    const tasks: Promise<unknown>[] = [];
    Object.keys(shortcodes).forEach(async (key) => {
        tasks.push(handleShortCode(key));
    });

    await Promise.all(tasks).then(() => {
        log('\n');
    });

    return null;
};

/**
 * Add necessary config and shortcode files to current directory for Contentful-Hugo
 */
const initializeDirectory = async (override = false): Promise<void> => {
    await checkForConfig();
    await addShortcodes(override);
};

export default initializeDirectory;
export {
    wait,
    replaceVariablesWithValues,
    getVariablesFromTemplate,
    initializeDirectory,
    templateVariableValues,
};
