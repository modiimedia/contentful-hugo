import { ContentSettings } from '@main/index';
import { ensureDir, writeFile } from 'fs-extra';
import { createClient } from 'contentful';
import processEntry from './processEntry';
import { ConfigContentfulSettings } from './config/src/types';
import { parseDirectoryPath } from './processEntry/src/createFile';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

interface ContentfulClientQuery {
    [key: string]: string | number | undefined | boolean;
    // eslint-disable-next-line camelcase
    content_type?: string;
    limit?: number;
    skip?: number;
    order?: string;
    'sys.id'?: string;
}

export const prepDirectory = async (
    settings: ContentSettings
): Promise<void> => {
    // create directory for file
    const parsedDir = parseDirectoryPath(
        settings.directory,
        settings.locale.mapTo
    );
    const newDir = parsedDir.path;
    await ensureDir(newDir);
    if (settings.isHeadless && !settings.isSingle) {
        const listPageFrontMatter = `---\n# this is a work-around to prevent hugo from rendering a list page\nurl: /\n---\n`;
        if (settings.locale && settings.locale.mapTo) {
            await writeFile(
                `${newDir}/_index.${settings.locale.mapTo.toLowerCase()}.md`,
                listPageFrontMatter
            );
        } else {
            await writeFile(`${newDir}/_index.md`, listPageFrontMatter);
        }
    }
};

/// get content for a single content type ///
// itemsPulled refers to entries that have already been called it's used in conjunction with skip for pagination
const getContentType = async (
    limit: number,
    skip: number,
    contentSettings: ContentSettings,
    contentfulSettings: ConfigContentfulSettings,
    previewMode = false,
    itemsPulled?: number,
    directoryPrepped = false
): Promise<{
    totalItems: number;
    typeId: string;
}> => {
    if (!directoryPrepped) {
        await prepDirectory(contentSettings);
    }
    const { token, previewToken, space, environment } = contentfulSettings;
    if (previewMode && !previewToken) {
        throw new Error(
            'Environment variable CONTENTFUL_PREVIEW_TOKEN not set'
        );
    } else if (!previewMode && !token) {
        throw new Error('Environment variable CONTENTFUL_TOKEN not set');
    }
    let accessToken = token;
    if (previewMode) {
        accessToken = previewToken || token || '';
    }
    const options = {
        space,
        host: previewMode ? 'preview.contentful.com' : 'cdn.contentful.com',
        accessToken,
        environment,
    };
    const client = createClient(options);
    // check for file extension default to markdown
    if (!contentSettings.fileExtension) {
        contentSettings.fileExtension = 'md';
    }
    const query: ContentfulClientQuery = {
        content_type: contentSettings.typeId,
        limit,
        skip,
        order: 'sys.updatedAt',
    };
    if (contentSettings.filters) {
        const { filters } = contentSettings;
        const ignoreKeys = ['content_type', 'limit', 'skip'];
        Object.keys(filters).forEach((key) => {
            if (!ignoreKeys.includes(key)) {
                query[key] = filters[key];
            }
        });
    }

    if (contentSettings.locale && contentSettings.locale.code) {
        query.locale = contentSettings.locale.code;
    }
    return client.getEntries(query).then(async (data) => {
        // variable for counting number of items pulled
        let itemCount;
        if (itemsPulled) {
            itemCount = itemsPulled;
        } else {
            itemCount = 0;
        }
        const tasks: Promise<void>[] = [];
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            tasks.push(processEntry(item, contentSettings));
            itemCount++;
        }
        await Promise.all(tasks);
        // check total number of items against number of items pulled in API
        if (data.total > data.limit && !contentSettings.isSingle) {
            // run function again if there are still more items to get
            const newSkip = skip + limit;
            return getContentType(
                limit,
                newSkip,
                contentSettings,
                contentfulSettings,
                previewMode,
                itemCount,
                true
            );
        }
        return {
            totalItems: itemCount,
            typeId: contentSettings.typeId,
        };
    });
};

export default getContentType;
