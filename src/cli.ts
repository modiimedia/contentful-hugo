#!/usr/bin/env node
import yargs from 'yargs';
import {
    initializeDirectory,
    loadConfig,
    fetchDataFromContentful,
    copyStaticContent,
} from './main';
import cleanDirectories from './main/clean';
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
        clean: { type: 'boolean', default: false },
    })
    .describe({
        preview: 'Pulls published and unplublished entries',
        init: 'Initialize directory for Contentful-Hugo',
        wait: 'Wait X number of ms before fetching data',
        config: 'Specify path to a config file',
        server:
            'Run a server that can receive webhooks from Contentful to trigger Contentful Hugo',
        port: 'Specify server port',
        clean: 'Delete all output directories',
    })
    .usage('Usage: contentful-hugo [flags]');

interface CliArgs {
    preview: boolean;
    init: boolean;
    wait: number;
    config: string | null;
    server: boolean;
    port: number;
    clean: boolean;
}

const argv = (yargs.argv as unknown) as CliArgs;

const initialize = (): Promise<unknown> | unknown => {
    // contentful-hugo --init
    if (argv.init) {
        return initializeDirectory();
    }

    return loadConfig('.', argv.config).then(async (config) => {
        if (config === false) {
            throw new Error(
                `There is an error in your config file, or it doesn't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.\n`
            );
        }

        if (argv.clean) {
            return cleanDirectories(config);
        }

        if (config.staticContent && config.staticContent.length) {
            console.log('Copying static content...');
            await copyStaticContent(config);
        }

        await fetchDataFromContentful(
            config,
            argv.preview || false,
            argv.wait || 0
        );
        if (argv.server) {
            return startServer(config, argv.port, argv.preview || false);
        }
        return null;
    });
};

initialize();
