import getContentType from '@main/getContentType';
import {
    getRepeatableTypeConfigs,
    getSingleTypeConfigs,
} from './determineFileLocation';
import { ContentfulHugoConfig } from '@/main';
import { ConfigContentfulSettings } from '@/main/config/types';

const fetchEntryFromContentful = async (
    entryId: string,
    contentType: string,
    config: ContentfulHugoConfig,
    previewMode = true
): Promise<void> => {
    const configs = getRepeatableTypeConfigs(config, contentType).concat(
        getSingleTypeConfigs(config, contentType)
    );
    const tasks = [];
    for (const cf of configs) {
        const contentSettings = {
            typeId: cf.typeId,
            directory: cf.directory,
            fileExtension: cf.fileExtension,
            fileName: cf.fileName,
            titleField: cf.titleField,
            dateField: cf.dateField,
            isHeadless: cf.isHeadless,
            isTaxonomy: cf.isTaxonomy,
            isSingle: cf.isSingle,
            type: cf.type,
            resolveEntries: cf.resolveEntries,
            overrides: cf.overrides,
            mainContent: cf.mainContent,
            filters: cf.filters || {},
            locale: cf.locale,
            customFields: cf.customFields || {},
        };
        contentSettings.filters['sys.id'] = entryId;
        const contentfulSettings: ConfigContentfulSettings = config.contentful;
        tasks.push(
            getContentType(
                100,
                0,
                contentSettings,
                contentfulSettings,
                previewMode,
                0
            )
        );
    }
    await Promise.all(tasks);
};

export default fetchEntryFromContentful;
