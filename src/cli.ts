#!/usr/bin/env node
import yargs from 'yargs';
import {
    initializeDirectory,
    loadConfig,
    fetchDataFromContentful,
} from './main';
import startServer from './server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

yargs
    .options({
        preview: { type: 'boolean', default: false, alias: 'P' },
        init: { type: 'boolean', default: false },
        wait: { type: 'number', default: 0, alias: 'W' },
        config: { type: 'string', default: null, alias: 'C' },
        server: { type: 'boolean', default: false, alias: 'S' },
        port: { type: 'number', default: 1414 },
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

    return loadConfig('.', argv.config).then(config => {
        if (config === false) {
            throw new Error(
                `There is an error in your config file, or it doesn't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.\n`
            );
        }
        if (argv.server) {
            startServer(config, argv.port, true);
        } else {
            fetchDataFromContentful(
                config,
                argv.preview || false,
                argv.wait || 0
            );
        }
    });
};

initialize();
