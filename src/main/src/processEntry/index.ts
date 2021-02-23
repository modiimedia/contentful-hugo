import { Entry } from 'contentful';
import { mapFields, getMainContent } from './mapper';
import createFile from './src/createFile';

const processEntry = (
    item: Entry<unknown>,
    contentSettings: import('@main/index').ContentSettings
): Promise<void> => {
    const {
        isHeadless,
        type,
        mainContent,
        resolveEntries,
        overrides,
    } = contentSettings;
    const frontMatter = mapFields(
        item,
        isHeadless,
        type,
        mainContent,
        resolveEntries,
        overrides
    );
    const content = contentSettings.mainContent
        ? getMainContent(item, contentSettings.mainContent)
        : '';
    return createFile(contentSettings, item.sys.id, frontMatter, content);
};

export default processEntry;
