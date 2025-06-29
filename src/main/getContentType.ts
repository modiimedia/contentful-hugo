import { ContentSettings } from '@main/index';
import fs from 'fs-extra';
import * as contentful from 'contentful';
import processEntry from './processEntry';
import { ConfigContentfulSettings } from './config/types';
import { parseDirectoryPath } from './processEntry/createFile';

export const prepDirectory = async (
    settings: ContentSettings
): Promise<void> => {
    // create directory for file
    const parsedDir = parseDirectoryPath(
        settings.directory,
        settings.locale.mapTo
    );
    const newDir = parsedDir.path;
    await fs.ensureDir(newDir);
    if (settings.isHeadless && !settings.isSingle) {
        const listPageFrontMatter = `---\n# this is a work-around to prevent hugo from rendering a list page\nurl: /\n---\n`;
        if (settings.locale && settings.locale.mapTo) {
            await fs.writeFile(
                `${newDir}/_index.${settings.locale.mapTo.toLowerCase()}.md`,
                listPageFrontMatter
            );
        } else {
            await fs.writeFile(`${newDir}/_index.md`, listPageFrontMatter);
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
    itemsPulled: number = 0,
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
    const client = contentful.createClient(options);
    // check for file extension default to markdown
    if (!contentSettings.fileExtension) {
        contentSettings.fileExtension = 'md';
    }
    const query: contentful.EntriesQueries<
        contentful.EntrySkeletonType,
        undefined
    > = {
        content_type: contentSettings.typeId,
        limit,
        skip,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order: 'sys.updatedAt' as any,
    };
    if (contentSettings.filters) {
        const { filters } = contentSettings;
        const ignoreKeys = ['content_type', 'limit', 'skip'];
        Object.keys(filters).forEach((key) => {
            if (!ignoreKeys.includes(key)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (query as any)[key] = filters[key];
            }
        });
    }

    if (contentSettings.locale && contentSettings.locale.code) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (query as any).locale = contentSettings.locale.code;
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
