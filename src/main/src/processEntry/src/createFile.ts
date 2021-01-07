import fs from 'fs';
import mkdirp from 'mkdirp';
import { ContentSettings } from '@main/index';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML = require('json-to-pretty-yaml');

/**
 * Check if string ends with ext
 * @param {String} str
 * @param {String} ext
 * @returns {boolean}
 */
export const endsWith = (
    str: string | undefined | null,
    ext: string
): boolean => {
    return new RegExp(`${ext}$`).test(str || '');
};

/**
 *
 * @param {Object} contentSettings - Content settings object
 * @param {String} entryId - The id of the Contentful entry
 * @param {Object} frontMatter - Object containing all the data for frontmatter
 * @param {String} mainContent - String data for the main content that will appear below the frontmatter
 */
const createFile = (
    contentSettings: ContentSettings,
    entryId: string,
    frontMatter: unknown = {},
    mainContent: string | null
): void => {
    let fileContent = '';
    const {
        fileExtension,
        fileName,
        isSingle,
        isHeadless,
        isTaxonomy,
    } = contentSettings;
    if (isHeadless && isTaxonomy) {
        throw new Error(
            'A content type cannot have both isHeadless and isTaxonomy set to true'
        );
    }

    if (
        fileExtension === null ||
        fileExtension === undefined ||
        endsWith(fileExtension, 'md')
    ) {
        fileContent += `---\n`;
    }

    // add current item to filecontent
    fileContent += YAML.stringify(frontMatter);
    if (!endsWith(fileExtension, 'yaml') && !endsWith(fileExtension, 'yml')) {
        fileContent += `---\n`;
    }

    // if set add the main content below the front matter
    if (mainContent) {
        fileContent += mainContent;
    }

    // create file
    let filePath = '';
    const directory = removeLeadingAndTrailingSlashes(
        contentSettings.directory
    );
    if (isHeadless && !isSingle) {
        mkdirp.sync(`./${directory}/${entryId}`);
        filePath = `./${directory}/${entryId}/index.${fileExtension}`;
    } else if (isTaxonomy) {
        mkdirp.sync(`./${directory}/${fileName || entryId}`);
        filePath = `./${directory}/${fileName ||
            entryId}/_index.${fileExtension}`;
    } else if (isSingle) {
        filePath = `./${directory}/${fileName}.${fileExtension}`;
    } else {
        filePath = `./${directory}/${entryId}.${fileExtension}`;
    }
    return fs.writeFile(filePath, fileContent, error => {
        if (error) {
            console.log(error);
        }
    });
};

export default createFile;
