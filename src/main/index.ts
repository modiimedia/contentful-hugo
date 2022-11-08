import Limiter from 'async-limiter';
import { defineConfig, loadConfig, ContentfulHugoConfig } from './config';
import {
    ConfigContentfulSettings,
    CustomFieldsConfig,
    LocaleConfig,
    OverrideConfig,
    RepeatableTypeConfig,
    SingleTypeConfig,
    getOverrideConfigs as getOverrides,
    getResolveEntryConfigs as getResolveEntries,
} from './config/types';
import getContentType from './getContentType';
import getContentTypeResultMessage from './getContentTypeResultMessage';
import initializeDirectory from './initializeDirectory';
import { isValidFileExtension } from './config/utilities';
import { copyStaticContent } from './staticContent/fileManager';

import { log, LogTypes } from '@/helpers/logger';

type VoidFunction = () => void;

export interface ContentSettings {
    /**
     * Contentful content type ID
     */
    typeId: string;
    /**
     * The directory where the entries will be placed
     */
    locale: LocaleConfig;
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
    customFields: CustomFieldsConfig;
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
): Promise<void> =>
    getContentType(limit, skip, settings, contentfulSettings, preview)
        .then((result) => {
            log(
                getContentTypeResultMessage(
                    result.typeId,
                    result.totalItems,
                    settings.locale.code
                )
            );
        })
        .catch((error: ContentfulError | string) => {
            log(error);
            if (typeof error === 'string') {
                throw new Error(error);
            }
            const { sys } = error;
            if (sys && sys.id && sys.id === 'InvalidQuery') {
                log(
                    `   --------------------------\n   ${
                        settings.typeId
                    } - ERROR ${error.message} ${JSON.stringify(
                        error.details
                    )})\n   --------------------------`,
                    LogTypes.warn
                );
            } else {
                throw new Error(`${JSON.stringify(error)}`);
            }
        });

const configCheck = (config: ContentfulHugoConfig) => {
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
    config: ContentfulHugoConfig,
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

    // check for wait time (from the --wait flag)
    if (waitTime && typeof waitTime === 'number') {
        log(`waiting ${waitTime}ms...`, LogTypes.warn);
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, waitTime);
        });
    }
    log(
        `\n---------------------------------------------\n   Pulling ${deliveryMode} from Contentful...\n---------------------------------------------\n`
    );

    const jobs: {
        limit: number;
        skip: number;
        contentSettings: ContentSettings;
        isPreview: boolean;
    }[] = [];
    const addJob = (
        item: SingleTypeConfig | RepeatableTypeConfig,
        isSingle: boolean
    ) => {
        let settings: ContentSettings;
        if (isSingle) {
            settings = {
                typeId: item.id,
                directory: item.directory,
                locale: {
                    code: '',
                    mapTo: '',
                },
                fileExtension: item.fileExtension,
                fileName: (item as SingleTypeConfig).fileName,
                mainContent: item.mainContent,
                isSingle: true,
                type: item.type,
                resolveEntries: getResolveEntries(item.resolveEntries),
                overrides: getOverrides(item.overrides),
                filters: item.filters,
                customFields: item.customFields || {},
            };
        } else {
            settings = {
                typeId: item.id,
                locale: {
                    code: '',
                    mapTo: '',
                },
                directory: item.directory,
                isHeadless: (item as RepeatableTypeConfig).isHeadless,
                fileExtension: item.fileExtension,
                mainContent: item.mainContent,
                type: item.type,
                isTaxonomy: (item as RepeatableTypeConfig).isTaxonomy,
                resolveEntries: getResolveEntries(item.resolveEntries),
                overrides: getOverrides(item.overrides),
                filters: item.filters,
                fileName: item.fileName,
                customFields: item.customFields || {},
            };
        }
        if (isValidFileExtension(settings.fileExtension)) {
            if (config.locales.length && !item.ignoreLocales) {
                // add a job for each locale
                for (const locale of config.locales) {
                    const newSettings = { ...settings };
                    if (typeof locale === 'string') {
                        newSettings.locale = {
                            code: locale,
                            mapTo: locale,
                        };
                    } else {
                        newSettings.locale = locale;
                    }
                    const job = {
                        limit: isSingle ? 1 : 1000,
                        skip: 0,
                        contentSettings: newSettings,
                        isPreview,
                    };
                    jobs.push(job);
                }
            } else {
                // add single job if no locales
                const job = {
                    limit: isSingle ? 1 : 1000,
                    skip: 0,
                    contentSettings: settings,
                    isPreview,
                };
                jobs.push(job);
            }
        } else {
            log(
                `   ERROR: extension "${settings.fileExtension}" not supported`,
                LogTypes.warn
            );
        }
    };
    // Loop through repeatable types
    const repeatables = config.repeatableTypes;
    if (repeatables) {
        for (let i = 0; i < repeatables.length; i++) {
            // object to pass settings into the function
            addJob(repeatables[i], false);
        }
    }
    // loop through single content types
    const singles = config.singleTypes;
    if (singles) {
        for (let i = 0; i < singles.length; i++) {
            addJob(singles[i], true);
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
            log(`\n---------------------------------------------\n`);
            resolve();
        });
    });
};

export {
    defineConfig,
    fetchDataFromContentful,
    loadConfig,
    initializeDirectory,
    copyStaticContent,
    ContentfulHugoConfig,
};
