import { pathExists, readFile } from 'fs-extra';
import { ContentfulHugoConfig, ContentSettings } from '@/main';
import { determineFilePath } from '@/main/src/processEntry/src/createFile';

export const getSingleTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
): ContentSettings[] => {
    const configs: ContentSettings[] = [];
    for (const item of config.singleTypes) {
        if (item.id === contentType) {
            const con = {
                typeId: item.id,
                locale: {
                    code: '',
                    mapTo: '',
                },
                directory: item.directory,
                fileExtension: item.fileExtension || 'md',
                fileName: item.fileName,
                isHeadless: false,
                isSingle: true,
                isTaxonomy: false,
                mainContent: item.mainContent,
                overrides: item.overrides,
                filters: item.filters,
            };
            if (
                config.locales &&
                config.locales.length &&
                !item.ignoreLocales
            ) {
                for (const locale of config.locales) {
                    const configWithLocale = { ...con };
                    if (typeof locale === 'string') {
                        configWithLocale.locale = {
                            code: locale,
                            mapTo: locale,
                        };
                    } else {
                        configWithLocale.locale = locale;
                    }
                    configs.push(configWithLocale);
                }
            } else {
                configs.push(con);
            }
        }
    }
    return configs;
};

export const getRepeatableTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
): ContentSettings[] => {
    const configs: ContentSettings[] = [];
    for (const item of config.repeatableTypes) {
        if (item.id === contentType) {
            const con = {
                typeId: item.id,
                directory: item.directory,
                fileExtension: item.fileExtension || 'md',
                isHeadless: item.isHeadless,
                isTaxonomy: item.isTaxonomy,
                isSingle: false,
                mainContent: item.mainContent || '',
                overrides: item.overrides || [],
                filters: item.filters,
                locale: {
                    code: '',
                    mapTo: '',
                },
            };
            if (
                config.locales &&
                config.locales.length &&
                !item.ignoreLocales
            ) {
                for (const locale of config.locales) {
                    const configWithLocale = { ...con };
                    if (typeof locale === 'string') {
                        configWithLocale.locale = {
                            code: locale,
                            mapTo: locale,
                        };
                    } else {
                        configWithLocale.locale = locale;
                    }
                    configs.push(configWithLocale);
                }
            } else {
                configs.push(con);
            }
        }
    }
    return configs;
};

const determineFileLocations = async (
    config: ContentfulHugoConfig,
    entryId: string,
    contentType: string,
    isDeleting = false
): Promise<string[]> => {
    const singleConfigs: ContentSettings[] = getSingleTypeConfigs(
        config,
        contentType
    );
    const locations: string[] = [];
    for (const item of singleConfigs) {
        const location = determineFilePath(item, entryId);
        if (isDeleting) {
            const fileExists = await pathExists(location);
            if (fileExists) {
                const data = await readFile(location);
                if (data.includes(`id: "${entryId}"`)) {
                    locations.push(location);
                }
            }
        } else {
            locations.push(location);
        }
    }
    const repeatableConfigs: ContentSettings[] = getRepeatableTypeConfigs(
        config,
        contentType
    );
    for (const item of repeatableConfigs) {
        locations.push(determineFilePath(item, entryId));
    }
    return locations;
};

export default determineFileLocations;
