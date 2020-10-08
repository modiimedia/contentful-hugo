import { Entry } from 'contentful';
import { mapFields, getMainContent } from './mapper';
import createFile from '../createFile';

/**
 *
 * @param {Object} item - contentful entry
 * @param {Object} contentSettings - Object containing settings from the contentful-hugo config file
 * @param {Boolean} contentSettings.headless
 * @param {String} contentSetting.directory
 * @param {String} contentSettings.type
 * @param {String} contentSettings.mainContent
 */
const processEntry = (
    item: Entry<any>,
    contentSettings: import('index').ContentSettings
) => {
    const {
        directory,
        isHeadless,
        type,
        mainContent,
        resolveEntries,
    } = contentSettings;
    const frontMatter = mapFields(
        item,
        directory,
        isHeadless,
        type,
        mainContent,
        resolveEntries
    );
    const content = contentSettings.mainContent
        ? getMainContent(item, contentSettings.mainContent)
        : '';
    createFile(contentSettings, item.sys.id, frontMatter, content);
};

export default processEntry;
