const fs = require('fs');
const mkdirp = require('mkdirp');
const shortcodes = require('./shortcodes');
const yaml = require('js-yaml');
const jsonToYaml = require('json-to-pretty-yaml');

const wait = (milli = 1000) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve();
        }, milli);
    });
};

const generateConfig = filepath => {
    console.log('creating contentful-settings.yaml');
    const settings = {
        activationDelay: 0,
        singleTypes: [
            {
                id: 'some-id',
                directory: '/content/some-directory/',
            },
        ],
        repeatableTypes: [],
    };
    const fileContent = jsonToYaml.stringify(settings);
    fs.writeFileSync(filepath, fileContent);
    console.log('config file created\n');
};

const checkForConfig = async (override = false) => {
    console.log('checking for config...');
    await wait(1000);
    const filepath = './contentful-settings.yaml';
    if (!fs.existsSync(filepath) || override) {
        return generateConfig(filepath);
    }
    const fileContent = yaml.safeLoad(fs.readFileSync(filepath));
    if (fileContent.singleTypes || fileContent.repeatableTypes) {
        console.log('config already exists\n');
        return null;
    }
    return generateConfig(filepath);
};

const addShortcodes = async (override = false) => {
    console.log('adding shortcodes for rich text...');
    await wait(1000);
    const directory = './layouts/shortcodes/contentful-hugo';
    mkdirp.sync(directory);
    Object.keys(shortcodes).forEach(key => {
        const { filename, template } = shortcodes[key];
        const filepath = `${directory}/${filename}`;

        if (fs.existsSync(filepath) && !override) {
            console.log(`${filepath} already exists`);
        } else {
            fs.writeFileSync(filepath, template);
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
