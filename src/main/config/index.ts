import path from 'path';
import { loadFile, checkContentfulSettings } from './fileLoader';
import { ContentfulHugoConfig, ResolveEntryConfig } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

/**
 * Load Contentful Hugo config file
 */
const loadConfig = async (
    /**
     * Directory of the config file. (Default ".")
     */
    rootDir = '.',
    /**
     * Config filename with extension.
     */
    fileName: string | null = null
): Promise<ContentfulHugoConfig | false> => {
    // eslint-disable-next-line no-param-reassign
    rootDir = path.resolve(rootDir);
    if (fileName) {
        const result = await loadFile(rootDir, fileName);
        if (result) {
            const config = checkContentfulSettings(result);
            return config;
        }
        throw new Error(`${fileName} does not exist or it is empty.`);
    }
    const defaultConfigs = [
        'contentful-hugo.config.js',
        'contentful-hugo.config.yaml',
        'contentful-hugo.yaml',
        'contentful-settings.yaml',
    ];
    const tasks = [];
    const configList: ContentfulHugoConfig[] = [];
    for (const config of defaultConfigs) {
        const file = loadFile(rootDir, config).then((result) => {
            if (result) {
                const conf = checkContentfulSettings(result);
                configList.push(conf);
            }
        });
        tasks.push(file);
    }
    return Promise.all(tasks).then(() => {
        // eslint-disable-next-line no-unreachable-loop
        for (const config of configList) {
            return config;
        }
        return false;
    });
};

export const defineConfig = (config: Partial<ContentfulHugoConfig>) => config;

export {
    loadConfig,
    checkContentfulSettings,
    ContentfulHugoConfig,
    ResolveEntryConfig,
};
