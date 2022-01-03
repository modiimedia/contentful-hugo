import { resolve } from 'path';
import { ContentfulHugoConfig } from '@main/index';
import { Entry } from 'contentful';
import determineFileLocations from './determineFileLocation';
import fetchEntry from './fetchEntryFromContentful';
import deleteFile from './deleteFile';
import { log } from '@/helpers/logger';

export interface EntryUpdatePayload {
    entryId: string;
    contentType: string;
    date: Date;
    message: string;
    files: string[];
}

const updateEntry = (
    config: ContentfulHugoConfig,
    sys: Entry<unknown>['sys'],
    previewMode: boolean
): Promise<EntryUpdatePayload> => fetchEntry(sys.id, sys.contentType.sys.id, config, previewMode).then(
        async () => {
            const fileLocations = await determineFileLocations(
                config,
                sys.id,
                sys.contentType.sys.id,
                false
            );
            for (const location of fileLocations) {
                log(`[contentful hugo] created ${resolve(location)}`);
            }
            const message = `Created ${fileLocations.length} file${
                fileLocations.length === 1 ? '' : 's'
            }`;
            const payload = {
                message,
                date: new Date(),
                entryId: sys.id,
                contentType: sys.contentType.sys.id,
                files: fileLocations,
            };
            return payload;
        }
    );

const removeEntry = async (
    config: ContentfulHugoConfig,
    sys: Entry<unknown>['sys']
): Promise<EntryUpdatePayload> => {
    const filePaths = await determineFileLocations(
        config,
        sys.id,
        sys.contentType.sys.id,
        true
    );
    const tasks: Promise<null>[] = [];
    for (const path of filePaths) {
        tasks.push(deleteFile(path));
    }
    return Promise.all(tasks).then(() => {
        const message = `Deleted ${filePaths.length} file${
            filePaths.length === 1 ? '' : 's'
        }`;
        return {
            date: new Date(),
            message,
            entryId: sys.id,
            contentType: sys.contentType.sys.id,
            files: filePaths,
        };
    });
};

export { updateEntry, removeEntry };
