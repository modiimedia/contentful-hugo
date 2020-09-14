const fs = require('fs');
const mkdirp = require('mkdirp');
const shortcodes = require('./shortcodes');
const { loadConfig } = require('../config');

const wait = (milli = 1000) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve();
        }, milli);
    });
};

const generateConfig = filepath => {
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
    if ((singleTypes, repeatableTypes)) {
        console.log('config already exists\n');
        return null;
    }
    return generateConfig(filepath);
};

const regex = /<<([^%>]+)?>>/g;

const getVariablesFromTemplate = template => {
    const params = template.match(regex);
    return params;
};

const replaceVariablesWithValues = template => {
    const values = {
        '<<BACKGROUND_COLOR>>': 'rgb(255, 231, 231)',
        '<<TEXT_COLOR>>': 'red',
        '<<BORDER_COLOR>>': 'red',
    };
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

const initializeDirectory = async override => {
    await checkForConfig(override);
    await addShortcodes(override);
};

module.exports = initializeDirectory;
