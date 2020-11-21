import fs from 'fs';
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
    const singleConfigs: ContentSettings[] = getSingleTypeConfigs(
        config,
        contentType
    );
    const locations: string[] = [];
    for (const item of singleConfigs) {
        const location = determineFilePath(item, entryId);
        const data = fs.readFileSync(location);
        if (data.includes(`id: "${entryId}"`)) {
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
    console.log(locations);
    return locations;
};

export default determineFileLocations;
