#!/usr/bin/env node
import express, { Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import bodyParser from 'body-parser';
import { Entry, Asset } from 'contentful';
import { ContentfulHugoConfig, fetchDataFromContentful } from '@main/index';
import determineFileLocations from './src/determineFileLocation';
import deleteFile from './src/deleteFile';
import pullEntry from './src/pullEntry';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

declare module 'http' {
    interface IncomingHttpHeaders {
        'X-Contentful-Topic':
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
        if (
            triggerType.includes('.save') ||
            triggerType.includes('.create') ||
            triggerType.includes('.publish') ||
            triggerType.includes('.auto_save') ||
            triggerType.includes('.unarchive')
        ) {
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
                return res.status(200).send({
                    date: new Date(),
                    message: 'Created file',
                    entryId: sys.id,
                    contentType: sys.contentType.sys.id,
                });
            });
            return fetchDataFromContentful(config, previewMode)
                .then(() => {
                    return res.status(200).send({
                        date: new Date(),
                        message: 'Created file',
                        entryId: sys.id,
                        contentType: sys.contentType,
                    });
                })
                .catch(err => {
                    return res.status(500).send(err);
                });
        } else if (
            triggerType.includes('.delete') ||
            triggerType.includes('unpublish') ||
            triggerType.includes('archive')
        ) {
            if (sys.type === 'Entry') {
                const filePaths = determineFileLocations(
                    config,
                    sys.id,
                    sys.contentType.sys.id
                );
                for (const path of filePaths) {
                    deleteFile(path);
                }
                return res.status(200).send({
                    date: new Date(),
                    message: 'Deleted item',
                    entryId: sys.id,
                    contentType: sys.contentType,
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
