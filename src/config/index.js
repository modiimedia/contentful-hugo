const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Determine if a file is yaml or js depending on the file extension
 * @param {String} fileName
 */
const determineFileType = fileName => {
    const splitStr = fileName.split('.');
    const fileExtension = splitStr[splitStr.length - 1];
    switch (fileExtension) {
        case 'js':
            return 'javascript';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return null;
    }
};

/**
 * Attempt to load a config file
 * @param {String} rootDir
 * @param {String} fileName
 */
const loadFile = async (rootDir = '.', fileName) => {
    return new Promise((resolve, reject) => {
        const filePath = path.resolve(rootDir, fileName);
        if (fs.existsSync(filePath)) {
            const fileType = determineFileType(fileName);
            if (fileType === 'javascript') {
                const configObject = require(filePath);
                return resolve(configObject);
            }
            if (fileType === 'yaml') {
                const configObject = yaml.safeLoad(fs.readFileSync(filePath));
                return resolve(configObject);
            }
        }
        return resolve(false);
    });
};

const loadConfig = async (rootDir = '.', fileName = null) => {
    rootDir = path.resolve(rootDir);
    if (fileName) {
        const result = await loadFile(rootDir, fileName);
        if (result) {
            return result;
        }
    }
    const defaultConfigs = [
        'contentful-hugo.config.js',
        'contentful-hugo.yaml',
        'contentful-settings.yaml',
    ];
    const tasks = [];
    const configList = [];
    for (const config of defaultConfigs) {
        const file = loadFile(rootDir, config).then(result => {
            configList.push(result);
        });
        tasks.push(file);
    }
    return Promise.all(tasks).then(() => {
        for (const config of configList) {
            if (config) {
                return config;
            }
        }
        return false;
    });
};

module.exports = { loadConfig, determineFileType };
