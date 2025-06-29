#!/usr/bin/env node
import dotenv from 'dotenv';
import { defineCommand, runMain } from 'citty';
import { LOG_PREFIX } from './helpers/constants';
import { initLogger } from './helpers/logger';
import {
    initializeDirectory,
    loadConfig,
    fetchDataFromContentful,
    copyStaticContent,
} from './main';
import cleanDirectories from './main/clean';
import startServer from './server';

dotenv.config({ quiet: true });

const main = defineCommand({
    meta: {
        name: 'Contentful Hugo',
    },
    args: {
        preview: {
            type: 'boolean',
            default: false,
            alias: 'P',
            description: 'Pulls published and unplublished entries',
        },
        init: {
            type: 'boolean',
            default: false,
            description: 'Initialize directory for Contentful-Hugo',
        },
        wait: {
            type: 'string',
            default: '0',
            alias: 'W',
            description: 'Wait X number of ms before fetching data',
        },
        config: {
            type: 'string',
            default: '',
            alias: 'C',
            description: 'Specify path to a config file',
        },
        server: {
            type: 'boolean',
            default: false,
            alias: 'S',
            description:
                'Run a server that can receive webhooks from Contentful to trigger Contentful Hugo',
        },
        port: {
            type: 'string',
            default: '1414',
            description: 'Specify server port',
        },
        clean: {
            type: 'boolean',
            default: false,
            description: 'Delete all output directories',
        },
        quiet: {
            type: 'boolean',
            default: false,
            alias: 'Q',
            description: "'Run without emitting any logs'",
        },
    },
    async run({ args }) {
        const log = initLogger(args.quiet);

        if (args.init) {
            return initializeDirectory();
        }

        const config = await loadConfig('.', args.config);
        if (config === false) {
            throw new Error(
                `There is an error in your config file, or it doesn't exits.
Check your config for errors or run "contentful-hugo --init" to create a config file.\n`
            );
        }

        if (args.clean) {
            return cleanDirectories(config);
        }

        if (config.staticContent && config.staticContent.length) {
            log(`${LOG_PREFIX} Copying static content...`);
            await copyStaticContent(config);
        }

        const waitVal = Number.isNaN(args.wait) ? 0 : Number(args.wait);
        const portVal = Number.isNaN(args.port) ? 1414 : Number(args.port);
        await fetchDataFromContentful(config, args.preview || false, waitVal);
        if (args.server) {
            return startServer(config, portVal, args.preview || false);
        }
        return null;
    },
});

runMain(main);
