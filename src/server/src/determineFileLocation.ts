import { ContentfulHugoConfig, ContentSettings } from '@/main';
import { determineFilePath } from '@/main/src/processEntry/src/createFile';

const getSingleTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
) => {
    const fileData: ContentSettings[] = [];
    for (const item of config.singleTypes) {
        if (item.id === contentType) {
            fileData.push({
                typeId: item.id,
                directory: item.directory,
                fileExtension: item.fileExtension || 'md',
                fileName: item.fileName,
                isHeadless: false,
                isSingle: true,
                isTaxonomy: false,
            });
        }
    }
    return fileData;
};

const getRepeatableTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
) => {
    const configs: ContentSettings[] = [];
    for (const item of config.repeatableTypes) {
        if (item.id === contentType) {
            configs.push({
                typeId: item.id,
                directory: item.directory,
                fileExtension: item.fileExtension || 'md',
                isHeadless: item.isHeadless,
                isTaxonomy: item.isTaxonomy,
                isSingle: false,
            });
        }
    }
    return configs;
};

const determineFileLocations = (
    config: ContentfulHugoConfig,
    entryId: string,
    contentType: string
): string[] => {
    const configs: ContentSettings[] = getRepeatableTypeConfigs(
        config,
        contentType
    ).concat(getSingleTypeConfigs(config, contentType));
    const locations: string[] = [];
    for (const item of configs) {
        locations.push(determineFilePath(item, entryId));
    }
    console.log(locations);
    return locations;
};

export default determineFileLocations;
