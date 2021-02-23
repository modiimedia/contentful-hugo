import { loadConfig, ContentfulConfig } from './src/config';
import {
    ConfigContentfulSettings,
    OverrideConfig,
    RepeatableTypeConfig,
    SingleTypeConfig,
} from './src/config/src/types';
import getContentType from './src/getContentType';
import getContentTypeResultMessage from './src/getContentTypeResultMessage';
import initializeDirectory from './src/initializeDirectory';
import { isValidFileExtension } from './src/config/src/utilities';

import Limiter = require('async-limiter');

export interface ContentSettings {
    /**
     * Contentful content type ID
     */
    typeId: string;
    /**
     * The directory where the entries will be placed
     */
    locale: string;
    directory: string;
    fileExtension?: string;
    fileName?: string;
    titleField?: string;
    dateField?: string;
    /**
     * The field that will act as the main content in the .md file
     */
    mainContent?: string;
    isSingle?: boolean;
    isHeadless?: boolean;
    isTaxonomy?: boolean;
    type?: string;
    resolveEntries?: { field: string; resolveTo: string }[];
    overrides?: OverrideConfig[];
    filters?: { [key: string]: string | number | boolean };
}

interface ContentfulError {
    sys: {
        type: string;
        id: string;
    };
    message: string;
    details: unknown;
}

const fetchType = (
    limit: number,
    skip: number,
    settings: ContentSettings,
    contentfulSettings: ConfigContentfulSettings,
    preview = false
): Promise<void> => {
    return getContentType(limit, skip, settings, contentfulSettings, preview)
        .then((result) => {
            console.log(
                getContentTypeResultMessage(
                    result.typeId,
                    result.totalItems,
                    settings.locale
                )
            );
        })
        .catch((error: ContentfulError | string) => {
            console.log(error);
            if (typeof error === 'string') {
                throw new Error(error);
            }
            const { sys } = error;
            if (sys && sys.id && sys.id === 'InvalidQuery') {
                console.log(
                    `   --------------------------\n   ${
                        settings.typeId
                    } - ERROR ${error.message} ${JSON.stringify(
                        error.details
                    )})\n   --------------------------`
                );
            } else {
                throw new Error(`${JSON.stringify(error)}`);
            }
        });
};

const configCheck = (config: ContentfulConfig) => {
    const { space, token, environment } = config.contentful;
    const missingParams: string[] = [];
    if (!space) {
        missingParams.push('space');
    }
    if (!token) {
        missingParams.push('token');
    }
    if (!environment) {
        missingParams.push('environment');
    }
    if (missingParams.length > 0) {
        const errorMessage = () => {
            let paramString = '';
            for (let i = 0; i < missingParams.length; i++) {
                const param = missingParams[i];
                if (i === 0) {
                    paramString += `"${param}"`;
                } else if (i === missingParams.length - 1) {
                    paramString += `, and "${param}"`;
                } else {
                    paramString += `, "${param}"`;
                }
            }
            return `Config is missing required contentful parameters: ${paramString}`;
        };
        throw new Error(errorMessage());
    }
    return null;
};

const fetchDataFromContentful = async (
    /**
     * Contentful Hugo Config Object
     */
    config: ContentfulConfig,
    /**
     * Fetch from the Content Preview API
     */
    previewMode = false,
    /**
     * Wait X number of ms before fetching data
     */
    waitTime = 0
): Promise<void> => {
    const isPreview = previewMode;
    const deliveryMode = previewMode ? 'Preview Data' : 'Published Data';
    configCheck(config);
    if (waitTime && typeof waitTime === 'number') {
        console.log(`waiting ${waitTime}ms...`);
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, waitTime);
        });
    }
    console.log(
        `\n---------------------------------------------\n   Pulling ${deliveryMode} from Contentful...\n---------------------------------------------\n`
    );
    // loop through repeatable content types
    const types = config.repeatableTypes;
    const jobs: {
        limit: number;
        skip: number;
        contentSettings: ContentSettings;
        isPreview: boolean;
    }[] = [];
    const addJob = (
        item: SingleTypeConfig | RepeatableTypeConfig,
        isSingle: boolean,
        locales: string[]
    ) => {
        let settings: ContentSettings;
        if (isSingle) {
            settings = {
                typeId: item.id,
                directory: item.directory,
                locale: '',
                fileExtension: item.fileExtension,
                fileName: (item as SingleTypeConfig).fileName,
                mainContent: item.mainContent,
                isSingle: true,
                type: item.type,
                resolveEntries: item.resolveEntries,
                overrides: item.overrides,
                filters: item.filters,
            };
        } else {
            settings = {
                typeId: item.id,
                locale: '',
                directory: item.directory,
                isHeadless: (item as RepeatableTypeConfig).isHeadless,
                fileExtension: item.fileExtension,
                mainContent: item.mainContent,
                type: item.type,
                isTaxonomy: (item as RepeatableTypeConfig).isTaxonomy,
                resolveEntries: item.resolveEntries,
                overrides: item.overrides,
                filters: item.filters,
            };
        }
        if (isValidFileExtension(settings.fileExtension)) {
            if (locales.length && !item.ignoreLocales) {
                for (const locale of locales) {
                    const newSettings = { ...settings };
                    newSettings.locale = locale;
                    const job = {
                        limit: isSingle ? 1 : 1000,
                        skip: 0,
                        contentSettings: newSettings,
                        isPreview,
                    };
                    jobs.push(job);
                }
            } else {
                const job = {
                    limit: 1,
                    skip: 0,
                    contentSettings: settings,
                    isPreview: isPreview,
                };
                jobs.push(job);
            }
        } else {
            console.log(
                `   ERROR: extension "${settings.fileExtension}" not supported`
            );
        }
    };
    if (types) {
        for (let i = 0; i < types.length; i++) {
            // object to pass settings into the function
            addJob(types[i], false, config.locales);
        }
    }
    // loop through single content types
    const singles = config.singleTypes;
    if (singles) {
        for (let i = 0; i < singles.length; i++) {
            addJob(singles[i], true, config.locales);
        }
    }
    return new Promise((resolve) => {
        const t = new Limiter({ concurrency: 2 });
        for (const job of jobs) {
            t.push((cb: VoidFunction) => {
                fetchType(
                    job.limit,
                    job.skip,
                    job.contentSettings,
                    config.contentful,
                    job.isPreview
                ).then(() => {
                    cb();
                });
            });
        }
        t.onDone(() => {
            console.log(`\n---------------------------------------------\n`);
            resolve();
        });
    });
};

export {
    fetchDataFromContentful,
    loadConfig,
    initializeDirectory,
    ContentfulConfig as ContentfulHugoConfig,
};
