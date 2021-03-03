import { ContentfulHugoConfig, ContentSettings } from '@/main';
import { ConfigContentfulSettings } from '@/main/src/config/src/types';
import getContentType from '@main/src/getContentType';
import {
    getRepeatableTypeConfigs,
    getSingleTypeConfigs,
} from './determineFileLocation';

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
        const contentSettings: ContentSettings = {
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
            filters: { 'sys.id': entryId },
            locale: cf.locale,
        };
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
