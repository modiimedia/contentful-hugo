import path from 'path';
import { loadFile, checkContentfulSettings } from './fileLoader';
import type { ConfigContentfulSettings, ContentfulHugoConfig } from './types';

export * from './types';

/**
 * Load Contentful Hugo config file
 */
export const loadConfig = async (
    /**
     * Directory of the config file. (Default ".")
     */
    rootDir = '.',
    /**
     * Config filename with extension.
     */
    fileName: string = ''
): Promise<ContentfulHugoConfig | false> => {
    rootDir = path.resolve(rootDir);
    if (fileName) {
        const result = await loadFile(rootDir, fileName);
        if (result) {
            const config = checkContentfulSettings(result);
            return config;
        }
        throw new Error(`${fileName} does not exist or it is empty.`);
    }
    const defaultConfigNames = [
        'contentful-hugo.config.ts',
        'contentful-hugo.config.js',
        'contentful-hugo.config.yaml',
        'contentful-hugo.yaml',
        'contentful-settings.yaml',
    ];
    const tasks = [];
    const configMap: Record<string, ContentfulHugoConfig | null> = {};
    for (const name of defaultConfigNames) {
        const file = loadFile(rootDir, name).then((result) => {
            if (result) {
                const conf = checkContentfulSettings(result);
                configMap[name] = conf;
                return;
            }
            configMap[name] = null;
        });
        tasks.push(file);
    }
    await Promise.all(tasks);
    for (const filename of defaultConfigNames) {
        if (configMap[filename]) {
            console.log(`Using config at ${filename}`);
            return configMap[filename]!;
        }
    }
    return false;
};

export const defineConfig = (
    config: Partial<Omit<ContentfulHugoConfig, 'contentful'>> & {
        contentful?: Partial<ConfigContentfulSettings>;
    }
) => config;
