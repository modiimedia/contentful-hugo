import { Entry } from 'contentful';
import { mapFields, getMainContent } from './mapper';
import createFile from './src/createFile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const overrideFileName = (
    nameStr: string,
    entry: any = {},
    locale: string
): string | null => {
    const strParts = nameStr.split('.');
    if (typeof entry !== 'object') {
        return '';
    }
    let result = entry;
    for (const part of strParts) {
        if (result[part]) {
            result = result[part];
        } else if (result[locale]) {
            result = result[locale];
        }
    }
    if (typeof result === 'string') {
        return result;
    }
    return null;
};

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

    const settings = { ...contentSettings };

    // if has dynamic filename
    if (!settings.isSingle && typeof settings.fileName === 'string') {
        const newFileName = overrideFileName(
            settings.fileName,
            item,
            contentSettings.locale.code
        );
        if (newFileName && typeof newFileName === 'string') {
            settings.fileName = newFileName;
        } else {
            settings.fileName = item.sys.id;
        }
    }

    return createFile(settings, item.sys.id, frontMatter, content);
};

export default processEntry;
