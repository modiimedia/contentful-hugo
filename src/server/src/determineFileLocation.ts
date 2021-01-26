import fs from 'fs';
import { ContentfulHugoConfig, ContentSettings } from '@/main';
import { determineFilePath } from '@/main/src/processEntry/src/createFile';

export const getSingleTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
): ContentSettings[] => {
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
                mainContent: item.mainContent || '',
            });
        }
    }
    return fileData;
};

export const getRepeatableTypeConfigs = (
    config: ContentfulHugoConfig,
    contentType: string
): ContentSettings[] => {
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
                mainContent: item.mainContent || '',
            });
        }
    }
    return configs;
};

const determineFileLocations = (
    config: ContentfulHugoConfig,
    entryId: string,
    contentType: string,
    isDeleting = false
): string[] => {
    const singleConfigs: ContentSettings[] = getSingleTypeConfigs(
        config,
        contentType
    );
    const locations: string[] = [];
    for (const item of singleConfigs) {
        const location = determineFilePath(item, entryId);
        if (isDeleting) {
            const fileExists = fs.existsSync(location);
            if (fileExists) {
                const data = fs.readFileSync(location);
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
