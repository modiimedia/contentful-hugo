#!/usr/bin/env node
import yargs from 'yargs';
import {
    initializeDirectory,
    loadConfig,
    fetchDataFromContentful,
} from './main';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

yargs
    .options({
        preview: { type: 'boolean', default: false, alias: 'P' },
        init: { type: 'boolean', default: false },
        wait: { type: 'number', default: 0, alias: 'W' },
        config: { type: 'string', default: null, alias: 'C' },
    })
    .describe({
        preview: 'Pulls published and unplublished entries',
        init: 'Initialize directory for Contentful-Hugo',
        wait: 'Wait X number of ms before fetching data',
        config: 'Specify path to a config file',
    })
    .usage('Usage: contentful-hugo [flags]');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const argv: { [key: string]: any } = yargs.argv;

const initialize = (): Promise<unknown> | unknown => {
    if (argv.init) {
        return initializeDirectory();
    }
    if (
        process.env.CONTENTFUL_SPACE &&
        (process.env.CONTENTFUL_TOKEN || process.env.CONTENTFUL_PREVIEW_TOKEN)
    ) {
        return loadConfig('.', argv.config).then(config => {
            if (config === false) {
                throw new Error(
                    `There is an error in your config file, or it doesn't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.\n`
                );
            }
            fetchDataFromContentful(
                config,
                argv.preview || false,
                argv.wait || 0
            );
        });
    }
    return console.error(
        `\nERROR: Environment variables not yet set.\n\nThis module requires the following environmental variables to be set before running:\nCONTENTFUL_SPACE, CONTENTFUL_TOKEN, CONTENTFUL_PREVIEW_TOKEN (optional)\n\nYou can set them using the command line or place them in a .env file.\n`
    );
};

initialize();
