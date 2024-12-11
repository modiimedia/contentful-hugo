import fs from 'fs-extra';
import { ContentSettings } from '@main/index';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';
import * as YAML from 'json-to-pretty-yaml';
import { log } from '@/helpers/logger';

export const parseDirectoryPath = (
    directory: string,
    locale: string
): {
    path: string;
    includesLocale: boolean;
} => {
    const dir = removeLeadingAndTrailingSlashes(directory);
    if (locale && (dir.includes('[locale]') || dir.includes('[ locale ]'))) {
        const dirParts = dir.split('/');
        const newDirParts: string[] = [];
        for (const part of dirParts) {
            if (part === '[locale]' || part === '[ locale ]') {
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
    let fName = entryId;
    if (fileName && isSingle) {
        fName = fileName;
    } else if (fileName) {
        fName = fileName;
    }
    const ext =
        locale.mapTo && !includesLocale
            ? `${locale.mapTo.toLowerCase()}.${fileExtension}`
            : fileExtension;
    if (isHeadless && !isSingle) {
        return `./${path}/${fName}/index.${ext}`;
    }
    if (isTaxonomy) {
        return `./${path}/${fName}/_index.${ext}`;
    }
    if (isSingle) {
        return `./${path}/${fName}.${ext}`;
    }
    return `./${path}/${fName}.${ext}`;
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
    const fName = fileName || entryId;
    if (isHeadless && !isSingle) {
        await fs.ensureDir(`./${directory}/${fName}`);
    } else if (isTaxonomy) {
        await fs.ensureDir(`./${directory}/${fName}`);
    } else {
        await fs.ensureDir(`./${directory}`);
    }
};

const cleanPreviousDynamicLocation = async (
    contentSettings: ContentSettings,
    entryId: string
) => {
    const settings = { ...contentSettings };
    settings.fileName = '';
    const tmpPath = determineFilePath(settings, entryId);
    const tmpPathFinal = tmpPath.replace('./', './.contentful-hugo/');
    if (await fs.pathExists(tmpPathFinal)) {
        const path = (await fs.readFile(tmpPathFinal)).toString();
        await fs.remove(path);
        if (path.includes('/index.md')) {
            await fs.remove(path.replace('/index.md', ''));
        }
        if (path.includes('/_index.md')) {
            await fs.remove(path.replace('/_index.md', ''));
        }
    }
};

const logDynamicLocation = async (
    contentSettings: ContentSettings,
    entryId: string,
    filePath: string
) => {
    const settings = { ...contentSettings };
    settings.fileName = '';
    const tmpPath = determineFilePath(settings, entryId);
    const tmpPathFinal = tmpPath.replace('./', './.contentful-hugo/');
    await fs.ensureFile(tmpPathFinal);
    await fs.writeFile(tmpPathFinal, filePath);
};

export const determineDynamicLocation = async (
    filePath: string
): Promise<string> => {
    const path = filePath.replace('./', './.contentful-hugo/');
    if (await fs.pathExists(path)) {
        const newPath = (await fs.readFile(path)).toString();
        return newPath;
    }
    return filePath;
};

const setFileContent = (
    frontMatter: unknown,
    fileExtension: string | null,
    mainContent: string | null
) => {
    let fileContent = '';
    switch (fileExtension) {
        case 'yaml':
        case 'yml':
            fileContent += YAML.stringify(frontMatter);
            break;
        case 'json':
            fileContent += JSON.stringify(frontMatter);
            break;
        default:
            fileContent += `---\n`;
            fileContent += YAML.stringify(frontMatter);
            fileContent += `---\n`;
            if (mainContent) {
                fileContent += mainContent;
            }
            break;
    }
    return fileContent;
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
    frontMatter: unknown,
    mainContent: string | null
): Promise<void> => {
    const { fileExtension, isHeadless, isTaxonomy, isSingle } = contentSettings;
    if (isHeadless && isTaxonomy) {
        throw new Error(
            'A content type cannot have both isHeadless and isTaxonomy set to true'
        );
    }
    const fileContent = setFileContent(
        frontMatter,
        fileExtension || null,
        mainContent
    );

    const hasDynamicFilename =
        typeof contentSettings.fileName === 'string' && !isSingle;

    if (hasDynamicFilename) {
        // since filename can change we need to delete the previous instance
        await cleanPreviousDynamicLocation(contentSettings, entryId);
    }

    // create file
    await createDirectoryForFile(contentSettings, entryId);
    const filePath = determineFilePath(contentSettings, entryId);
    await fs.writeFile(filePath, fileContent).catch((error) => {
        if (error) {
            log(error);
        }
    });

    if (hasDynamicFilename) {
        // write the new location to filesystem so we can delete if it changes
        await logDynamicLocation(contentSettings, entryId, filePath);
    }
};

export default createFile;
