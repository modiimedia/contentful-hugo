import fs from 'fs';
import mkdirp from 'mkdirp';
import { ContentSettings } from '@main/index';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML = require('json-to-pretty-yaml');

export const determineFilePath = (
    contentSettings: ContentSettings,
    entryId: string
): string => {
    const {
        fileExtension,
        fileName,
        isSingle,
        isHeadless,
        isTaxonomy,
    } = contentSettings;
    const directory = removeLeadingAndTrailingSlashes(
        contentSettings.directory
    );
    if (isHeadless && !isSingle) {
        return `./${directory}/${entryId}/index.${fileExtension}`;
    } else if (isTaxonomy) {
        mkdirp.sync(`./${directory}/${fileName || entryId}`);
        return `./${directory}/${fileName || entryId}/_index.${fileExtension}`;
    } else if (isSingle) {
        return `./${directory}/${fileName}.${fileExtension}`;
    }
    return `./${directory}/${entryId}.${fileExtension}`;
};

export const createDirectoryForFile = (
    contentSettings: ContentSettings,
    entryId: string
): void => {
    const { fileName, isSingle, isHeadless, isTaxonomy } = contentSettings;
    const directory = removeLeadingAndTrailingSlashes(
        contentSettings.directory
    );
    if (isHeadless && !isSingle) {
        mkdirp.sync(`./${directory}/${entryId}`);
    } else if (isTaxonomy) {
        mkdirp.sync(`./${directory}/${fileName || entryId}`);
    }
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
    const { fileExtension, isHeadless, isTaxonomy } = contentSettings;
    if (isHeadless && isTaxonomy) {
        throw new Error(
            'A content type cannot have both isHeadless and isTaxonomy set to true'
        );
    }
    if (
        fileExtension === 'md' ||
        fileExtension === null ||
        fileExtension === undefined
    ) {
        fileContent += `---\n`;
    }

    // add current item to filecontent
    fileContent += YAML.stringify(frontMatter);
    if (fileExtension !== 'yaml' && fileExtension !== 'yml') {
        fileContent += `---\n`;
    }

    // if set add the main content below the front matter
    if (mainContent) {
        fileContent += mainContent;
    }

    // create file
    createDirectoryForFile(contentSettings, entryId);
    const filePath = determineFilePath(contentSettings, entryId);
    return fs.writeFile(filePath, fileContent, error => {
        if (error) {
            console.log(error);
        }
    });
};

export default createFile;
