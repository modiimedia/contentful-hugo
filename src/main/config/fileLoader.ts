import path from 'path';
import { readFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
import * as c12 from 'c12';
import { determineFileType, isContentfulHugoConfig } from './utilities';
import { ContentfulHugoConfig } from './types';

export const checkContentfulSettings = (config: {
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

export const loadJavascriptConfigFile = async (
    filePath: string
): Promise<ContentfulHugoConfig | null> => {
    // eslint-disable-next-line global-require
    let { config } = await c12.loadConfig({
        configFile: filePath,
    });
    if (config && typeof config === 'object') {
        config = checkContentfulSettings(config);
        if (isContentfulHugoConfig(config)) {
            return config;
        }
    }
    return null;
};

export const loadYamlConfigFile = (
    filePath: string
): ContentfulHugoConfig | null => {
    const file = readFileSync(filePath);
    let configObject = yaml.load(file.toString());
    if (configObject && typeof configObject === 'object') {
        configObject = checkContentfulSettings(configObject);
        if (isContentfulHugoConfig(configObject)) {
            return configObject;
        }
    }
    return null;
};

/**
 * Attempt to load a config file
 */
export const loadFile = async (
    rootDir = '.',
    fileName: string = ''
): Promise<ContentfulHugoConfig | null> => {
    const filePath = path.resolve(rootDir, fileName);
    if (existsSync(filePath)) {
        const fileType = determineFileType(fileName);
        if (fileType === 'javascript' || fileType === 'typescript') {
            return loadJavascriptConfigFile(filePath);
        }
        if (fileType === 'yaml') {
            return loadYamlConfigFile(filePath);
        }
    }
    return null;
};
