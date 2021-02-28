import { ensureDir, writeFile } from 'fs-extra';
import { ContentSettings } from '@main/index';
import { removeLeadingAndTrailingSlashes, endsWith } from '@helpers/strings';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const YAML = require('json-to-pretty-yaml');

export const parseDirectoryPath = (
    directory: string,
    locale: string
): {
    path: string;
    includesLocale: boolean;
} => {
    const dir = removeLeadingAndTrailingSlashes(directory);
    if (dir.includes('[locale]')) {
        const dirParts = dir.split('/');
        const newDirParts: string[] = [];
        for (const part of dirParts) {
            if (part === '[locale]') {
                newDirParts.push(locale.toLowerCase());
            } else {
                newDirParts.push(part);
            }
        }
        return {
            path: newDirParts.join('/'),
            includesLocale: true,
        };
    }
    return {
        path: dir,
        includesLocale: false,
    };
};

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
        locale,
    } = contentSettings;
    const { path, includesLocale } = parseDirectoryPath(
        contentSettings.directory,
        locale.mapTo
    );
    const ext =
        locale.mapTo && !includesLocale
            ? `${locale.mapTo.toLowerCase()}.${fileExtension}`
            : fileExtension;
    if (isHeadless && !isSingle) {
        return `./${path}/${entryId}/index.${ext}`;
    } else if (isTaxonomy) {
        return `./${path}/${fileName || entryId}/_index.${ext}`;
    } else if (isSingle) {
        return `./${path}/${fileName}.${ext}`;
    }
    return `./${path}/${entryId}.${ext}`;
};

export const createDirectoryForFile = async (
    contentSettings: ContentSettings,
    entryId: string
): Promise<void> => {
    const { fileName, isSingle, isHeadless, isTaxonomy } = contentSettings;
    const directory = parseDirectoryPath(
        contentSettings.directory,
        contentSettings.locale.mapTo
    ).path;
    if (isHeadless && !isSingle) {
        await ensureDir(`./${directory}/${entryId}`);
    } else if (isTaxonomy) {
        await ensureDir(`./${directory}/${fileName || entryId}`);
    } else {
        await ensureDir(`./${directory}`);
    }
};

/**
 *
 * @param {Object} contentSettings - Content settings object
 * @param {String} entryId - The id of the Contentful entry
 * @param {Object} frontMatter - Object containing all the data for frontmatter
 * @param {String} mainContent - String data for the main content that will appear below the frontmatter
 */
const createFile = async (
    contentSettings: ContentSettings,
    entryId: string,
    frontMatter: unknown = {},
    mainContent: string | null
): Promise<void> => {
    let fileContent = '';
    const { fileExtension, isHeadless, isTaxonomy } = contentSettings;
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
    await createDirectoryForFile(contentSettings, entryId);
    const filePath = determineFilePath(contentSettings, entryId);
    return writeFile(filePath, fileContent).catch((error) => {
        if (error) {
            console.log(error);
        }
    });
};

export default createFile;
