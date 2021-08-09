import { ContentfulHugoConfig } from '@/main';
import createClient from '@helpers/contentful';
import fetchEntryFromContentful from './fetchEntryFromContentful';

export interface AssetUpdatePayload {
    assetId: string;
    date: Date;
    message: string;
    files: string[];
}

const fetchEntriesLinkedToAsset = async (
    assetId: string,
    config: ContentfulHugoConfig,
    previewMode = false
): Promise<void> => {
    const client = createClient(config.contentful, previewMode);
    const entries: { id: string; contentType: string }[] = [];
    const getEntries = async (skip = 0): Promise<boolean> => {
        const limit = 100;
        const e = await client.getEntries({
            links_to_asset: assetId,
            limit,
        });
        for (const item of e.items) {
            entries.push({
                id: item.sys.id,
                contentType: item.sys.contentType.sys.id,
            });
        }
        if (entries.length !== e.total) {
            return getEntries(skip + limit);
        }
        return true;
    };
    await getEntries(0);

    const tasks: Promise<unknown>[] = [];
    for (const entry of entries) {
        tasks.push(
            fetchEntryFromContentful(
                entry.id,
                entry.contentType,
                config,
                previewMode
            )
        );
    }
    await Promise.all(tasks);
    console.log(`[contentful hugo] fetched entries linked to asset ${assetId}`);
};

export default fetchEntriesLinkedToAsset;
