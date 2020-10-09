import fs from 'fs';
import mkdirp from 'mkdirp';
import shortcodes from './shortcodes';
import { loadConfig } from '../config';
import { string } from 'yargs';

const wait = (milli = 1000): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve();
        }, milli);
    });
};

const generateConfig = (filepath: string) => {
    console.log('creating contentful-hugo.config.js');
    const configContent = `// go to https://github.com/ModiiMedia/contentful-hugo for configuration instructions\n
module.exports = {
    singleTypes: [],
    repeatableTypes: []
};`;
    fs.writeFileSync(filepath, configContent);
    console.log('config file created\n');
};

const checkForConfig = async (override = false) => {
    console.log('checking for config...');
    await wait(1000);
    const config = await loadConfig();
    const filepath = './contentful-hugo.config.js';
    if (!config) {
        return generateConfig(filepath);
    }
    const { singleTypes, repeatableTypes } = config;
    if (singleTypes || repeatableTypes) {
        console.log('config already exists\n');
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
    console.log('adding shortcodes for rich text...');
    await wait(1000);
    const directory = './layouts/shortcodes/contentful-hugo';
    mkdirp.sync(directory);
    Object.keys(shortcodes).forEach(key => {
        const { filename, template } = shortcodes[key];
        const finalTemplate = replaceVariablesWithValues(template);
        const filepath = `${directory}/${filename}`;
        if (fs.existsSync(filepath) && !override) {
            console.log(`${filepath} already exists`);
        } else {
            fs.writeFileSync(filepath, finalTemplate);
            console.log(`created ${filepath}`);
        }
    });
    console.log('\n');
    return null;
};

const initializeDirectory = async (override = false): Promise<void> => {
    await checkForConfig(override);
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
