import path from 'path';
import { pathExists, readFile } from 'fs-extra';
import yaml from 'js-yaml';
import { determineFileType, isContentfulHugoConfig } from './utilities';
import { ContentfulHugoConfig } from './types';

const checkContentfulSettings = (config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}): ContentfulHugoConfig => {
    let { contentful } = config;
    if (!contentful) {
        contentful = {};
    }
    const space = contentful.space || process.env.CONTENTFUL_SPACE || '';
    const token = contentful.token || process.env.CONTENTFUL_TOKEN || '';
    const previewToken =
        contentful.previewToken || process.env.CONTENTFUL_PREVIEW_TOKEN || '';
    const environment = contentful.environment || 'master';
    const newConfig: ContentfulHugoConfig = {
        locales: config.locales || [],
        contentful: {
            space,
            token,
            previewToken,
            environment,
        },
        singleTypes: config.singleTypes || [],
        repeatableTypes: config.repeatableTypes || [],
        staticContent: config.staticContent || [],
    };
    return newConfig;
};

const loadJavascriptConfigFile = (
    filePath: string
): ContentfulHugoConfig | false => {
    // eslint-disable-next-line global-require
    let configObject = require(filePath);
    if (configObject && typeof configObject === 'object') {
        configObject = checkContentfulSettings(configObject);
        if (isContentfulHugoConfig(configObject)) {
            return configObject;
        }
    }
    return false;
};

const loadYamlConfigFile = async (
    filePath: string
): Promise<ContentfulHugoConfig | false> => {
    const file = await readFile(filePath);
    let configObject = yaml.load(file.toString());
    if (configObject && typeof configObject === 'object') {
        configObject = checkContentfulSettings(configObject);
        if (isContentfulHugoConfig(configObject)) {
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
    fileName: string = ''
): Promise<ContentfulHugoConfig | false> => {
    const filePath = path.resolve(rootDir, fileName);
    if (await pathExists(filePath)) {
        const fileType = determineFileType(fileName);
        if (fileType === 'javascript') {
            return loadJavascriptConfigFile(filePath);
        }
        if (fileType === 'yaml') {
            return loadYamlConfigFile(filePath);
        }
    }
    return false;
};

export {
    loadFile,
    loadJavascriptConfigFile,
    loadYamlConfigFile,
    checkContentfulSettings,
};
