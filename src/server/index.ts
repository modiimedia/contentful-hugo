#!/usr/bin/env node
import express, { Response } from 'express';
import { IncomingHttpHeaders, Server } from 'http';
import { Entry, Asset, ContentType } from 'contentful';
import { ContentfulHugoConfig } from '@main/index';
import { removeEntry, updateEntry } from './src/handleEntry';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
    express.json({
        type: [
            'application/vnd.contentful.management.v1+json',
            'application/vnd.contentful.management.v1+json; charset=utf-8',
            'application/json',
            'application/json; charset=utf-8',
            'application/x-www-form-urlencoded',
            'application/x-www-form-urlencoded; charset=utf-8',
        ],
    })
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
    body: Entry<unknown> | Asset | ContentType;
}

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

const startServer = (
    config: ContentfulHugoConfig,
    port = 1414,
    previewMode = false
): Server => {
    if (!config) {
        throw new Error('Missing contentful hugo config');
    }
    app.post('/', async (req: ContentfulWebhookRequest, res: Response) => {
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
        if (shouldCreate(triggerType, previewMode)) {
            switch (sys.type) {
                case 'Entry':
                    return updateEntry(config, sys, previewMode).then(
                        (payload) => {
                            return res.status(200).send(payload);
                        }
                    );
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
                    return removeEntry(config, sys).then((payload) => {
                        return res.status(200).send(payload);
                    });
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

    return app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
};

export default startServer;
