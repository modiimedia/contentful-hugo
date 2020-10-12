#!/usr/bin/env node
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Entry, Asset } from 'contentful';
import { loadConfig } from '@main/index';

const config = loadConfig();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

interface ContentfulWebhookRequest extends Request {
    body: Entry<unknown> | Asset;
}

app.post('/', (req: ContentfulWebhookRequest, res: Response) => {
    if (!req.body.sys) {
        res.status(401).send();
    }
    const { sys } = req.body;
    if (!sys || !sys.id || !sys.contentType) {
        res.status(401).send();
    }
    const entryId = sys.id;
    const contentType = sys.contentType;
    res.status(200).send({ entryId, contentType });
});

const port = 4000;

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
