import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { determineFileType, isContentfulConfig } from './utilities';
import { ContentfulConfig } from './types';

const checkContentfulSettings = (config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}): ContentfulConfig => {
    let { contentful } = config;
    if (!contentful) {
        contentful = {};
    }
    const space = contentful.space || process.env.CONTENTFUL_SPACE || '';
    const token = contentful.token || process.env.CONTENTFUL_TOKEN || '';
    const previewToken =
        contentful.previewToken || process.env.CONTENTFUL_PREVIEW_TOKEN || '';
    const environment = contentful.environment || 'master';
    const newConfig: ContentfulConfig = {
        locales: config.locales || {},
        contentful: {
            space,
            token,
            previewToken,
            environment,
        },
        singleTypes: config.singleTypes || [],
        repeatableTypes: config.repeatableTypes || [],
    };
    return newConfig;
};

const loadJavascriptConfigFile = (
    filePath: string
): ContentfulConfig | false => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let configObject = require(filePath);
    if (configObject && typeof configObject === 'object') {
        configObject = checkContentfulSettings(configObject);
        if (isContentfulConfig(configObject)) {
            return configObject;
        }
    }
    return false;
};

const loadYamlConfigFile = (filePath: string): ContentfulConfig | false => {
    let configObject = yaml.load(fs.readFileSync(filePath).toString());
    if (configObject && typeof configObject === 'object') {
        configObject = checkContentfulSettings(configObject);
        if (isContentfulConfig(configObject)) {
            return configObject;
        }
    }
    return false;
};

/**
 * Attempt to load a config file
 */
const loadFile = async (
    rootDir = '.',
    fileName: string
): Promise<ContentfulConfig | false> => {
    return new Promise((resolve) => {
        const filePath = path.resolve(rootDir, fileName);
        if (fs.existsSync(filePath)) {
            const fileType = determineFileType(fileName);
            if (fileType === 'javascript') {
                return resolve(loadJavascriptConfigFile(filePath));
            }
            if (fileType === 'yaml') {
                return resolve(loadYamlConfigFile(filePath));
            }
        }
        return resolve(false);
    });
};

export {
    loadFile,
    loadJavascriptConfigFile,
    loadYamlConfigFile,
    checkContentfulSettings,
};
