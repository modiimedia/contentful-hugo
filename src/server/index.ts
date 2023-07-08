#!/usr/bin/env node
import Fastify from 'fastify';
import { IncomingHttpHeaders } from 'http';
import { Entry, Asset, ContentType, EntrySys } from 'contentful';
import { ContentfulHugoConfig } from '@main/index';
import { removeEntry, updateEntry } from './handleEntry';
import createWatcher from '@/main/staticContent/watcher';
import fetchEntriesLinkedToAsset, {
    AssetUpdatePayload,
} from './fetchEntriesLinkedToAsset';

const app = Fastify({});

const contentfulContentTypes = [
    'application/vnd.contentful.management.v1+json',
    'application/vnd.contentful.management.v1+json; charset=utf-8',
    'application/json',
    'application/json; charset=utf-8',
    'application/x-www-form-urlencoded',
    'application/x-www-form-urlencoded; charset=utf-8',
];

app.addContentTypeParser(
    contentfulContentTypes,
    { parseAs: 'string' },
    app.getDefaultJsonParser('ignore', 'ignore')
);

declare module 'http' {
    interface IncomingHttpHeaders {
        'x-contentful-topic':
            | 'ContentManagement.ContentType.create'
            | 'ContentManagement.ContentType.save'
            | 'ContentManagement.ContentType.publish'
            | 'ContentManagement.ContentType.unpublish'
            | 'ContentManagement.ContentType.delete'
            | 'ContentManagement.Entry.create'
            | 'ContentManagement.Entry.save'
            | 'ContentManagement.Entry.auto_save'
            | 'ContentManagement.Entry.archive'
            | 'ContentManagement.Entry.unarchive'
            | 'ContentManagement.Entry.publish'
            | 'ContentManagement.Entry.unpublish'
            | 'ContentManagement.Entry.delete'
            | 'ContentManagement.Asset.create'
            | 'ContentManagement.Asset.save'
            | 'ContentManagement.Asset.auto_save'
            | 'ContentManagement.Asset.archive'
            | 'ContentManagement.Asset.unarchive'
            | 'ContentManagement.Asset.publish'
            | 'ContentManagement.Asset.unpublish'
            | 'ContentManagement.Asset.delete';
        'X-Contentful-Webhook-Name': string;
    }
}

interface ContentfulWebhookRequest {
    headers: IncomingHttpHeaders;
    body: Entry | Asset | ContentType;
}

export const isAssetTrigger = (
    triggerType: ContentfulWebhookRequest['headers']['x-contentful-topic'],
    previewMode: boolean
): boolean => {
    if (previewMode) {
        return (
            triggerType === 'ContentManagement.Asset.archive' ||
            triggerType === 'ContentManagement.Asset.auto_save' ||
            triggerType === 'ContentManagement.Asset.create' ||
            triggerType === 'ContentManagement.Asset.delete' ||
            triggerType === 'ContentManagement.Asset.publish' ||
            triggerType === 'ContentManagement.Asset.save' ||
            triggerType === 'ContentManagement.Asset.unarchive' ||
            triggerType === 'ContentManagement.Asset.unpublish'
        );
    }
    return (
        triggerType === 'ContentManagement.Asset.unpublish' ||
        triggerType === 'ContentManagement.Asset.unarchive' ||
        triggerType === 'ContentManagement.Asset.delete' ||
        triggerType === 'ContentManagement.Asset.publish'
    );
};

export const shouldCreate = (
    triggerType: ContentfulWebhookRequest['headers']['x-contentful-topic'],
    previewMode: boolean
): boolean => {
    const conditions = ['.publish', '.unarchive'];
    for (const condition of conditions) {
        if (triggerType.includes(condition)) {
            return true;
        }
    }
    if (previewMode) {
        const previewCondition = ['.save', '.create', '.auto_save'];
        for (const condition of previewCondition) {
            if (triggerType.includes(condition)) {
                return true;
            }
        }
    }
    return false;
};

export const shouldDelete = (
    triggerType: IncomingHttpHeaders['x-contentful-topic'],
    previewMode: boolean
): boolean => {
    const conditions = ['.delete', '.archive'];
    for (const condition of conditions) {
        if (triggerType.includes(condition)) {
            return true;
        }
    }
    if (!previewMode) {
        const previewConditions = ['.unpublish'];
        for (const condition of previewConditions) {
            if (triggerType.includes(condition)) {
                return true;
            }
        }
    }
    return false;
};

const startServer = async (
    config: ContentfulHugoConfig,
    port = 1414,
    previewMode = false
): Promise<void> => {
    if (!config) {
        throw new Error('Missing contentful hugo config');
    }
    app.get('/status', (_req, res) => res.status(200).send('ok'));
    app.post<{
        Headers: ContentfulWebhookRequest['headers'];
        Body: ContentfulWebhookRequest['body'];
    }>('/', async (req, res) => {
        if (!req.body.sys) {
            return res.status(401).send();
        }
        const { sys } = req.body;
        if (
            !sys ||
            !sys.id ||
            (sys.type !== 'Asset' &&
                sys.type !== 'Entry' &&
                sys.type !== 'ContentType' &&
                sys.type !== 'DeletedEntry')
        ) {
            return res.status(401).send('Invalid format');
        }
        const triggerType = req.headers['x-contentful-topic'];
        if (typeof triggerType !== 'string') {
            return res.status(401).send('Invalid format');
        }
        if (isAssetTrigger(triggerType, previewMode)) {
            return fetchEntriesLinkedToAsset(sys.id, config, previewMode).then(
                () => {
                    const payload: AssetUpdatePayload = {
                        assetId: sys.id,
                        date: new Date(),
                        message: `Updated entries linked to asset ${sys.id}`,
                        files: [],
                    };
                    return res.status(200).send(payload);
                }
            );
        }
        if (shouldCreate(triggerType, previewMode)) {
            switch (sys.type) {
                case 'Entry':
                    return updateEntry(
                        config,
                        sys as EntrySys,
                        previewMode
                    ).then((payload) => res.status(200).send(payload));
                case 'Asset':
                    // handle asset publish / changes (find affected entries and refetch them)
                    break;
                case 'ContentType':
                    // handle contentType changes (find affected entries and refetch them)
                    break;
                default:
                    break;
            }
            // to do
        }
        if (shouldDelete(triggerType, previewMode)) {
            switch (sys.type) {
                case 'Entry':
                case 'DeletedEntry':
                    return removeEntry(config, sys as EntrySys).then(
                        (payload) => res.status(200).send(payload)
                    );
                case 'Asset':
                    // handle asset removal (find entries connected to an asset that has been modified and refetch them)
                    break;
                case 'ContentType':
                    // handle content type changes (find entries connected to a contentType remove them)
                    break;
                default:
                    break;
            }
        }
        return res.status(200).send({
            id: sys.id,
            type: sys.type,
            message: 'Did nothing',
        });
    });

    await app.listen({ port });
    console.log(`[contentful hugo] server started at http://localhost:${port}`);

    createWatcher(config);
};

export default startServer;
