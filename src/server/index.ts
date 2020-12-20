#!/usr/bin/env node
import express, { Response } from 'express';
import { resolve } from 'path';
import { IncomingHttpHeaders } from 'http';
import bodyParser from 'body-parser';
import { Entry, Asset } from 'contentful';
import { ContentfulHugoConfig } from '@main/index';
import determineFileLocations from './src/determineFileLocation';
import deleteFile from './src/deleteFile';
import pullEntry from './src/pullEntry';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    body: Entry<unknown> | Asset;
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
    previewMode = true
): unknown => {
    app.post('/', async (req: ContentfulWebhookRequest, res: Response) => {
        if (!req.body.sys) {
            res.status(401).send();
        }
        const { sys } = req.body;
        if (!sys || !sys.id || (sys.type !== 'Asset' && sys.type !== 'Entry')) {
            return res.status(401).send('Invalid format');
        }
        const triggerType = req.headers['x-contentful-topic'];
        if (typeof triggerType !== 'string') {
            return res.status(401).send('Invalid format');
        }
        if (shouldCreate(triggerType, previewMode)) {
            if (!config) {
                return res
                    .status(500)
                    .send('Contentful Hugo config file error');
            }
            return pullEntry(
                sys.id,
                sys.contentType.sys.id,
                config,
                previewMode
            ).then(() => {
                const fileLocations = determineFileLocations(
                    config,
                    sys.id,
                    sys.contentType.sys.id,
                    false
                );
                for (const location of fileLocations) {
                    console.log(`created ${resolve(location)}`);
                }
                const message = `Created ${fileLocations.length} file${
                    fileLocations.length === 1 ? '' : 's'
                }`;
                return res.status(200).send({
                    date: new Date(),
                    message,
                    entryId: sys.id,
                    contentType: sys.contentType.sys.id,
                    files: fileLocations,
                });
            });
        } else if (shouldDelete(triggerType, previewMode)) {
            if (sys.type === 'Entry') {
                const filePaths = determineFileLocations(
                    config,
                    sys.id,
                    sys.contentType.sys.id,
                    true
                );
                for (const path of filePaths) {
                    deleteFile(path);
                }
                const message = `Deleted ${filePaths.length} file${
                    filePaths.length === 1 ? '' : 's'
                }`;
                return res.status(200).send({
                    date: new Date(),
                    message,
                    entryId: sys.id,
                    contentType: sys.contentType.sys.id,
                    files: filePaths,
                });
            }
        }
        const entryId = sys.id;
        const contentType = sys.contentType;
        return res.status(200).send({ entryId, contentType });
    });

    return app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
};

export default startServer;
