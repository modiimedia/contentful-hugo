import { loadConfig, ContentfulConfig } from './src/config';
import { ConfigContentfulSettings } from './src/config/src/types';
import getContentType from './src/getContentType';
import getContentTypeResultMessage from './src/getContentTypeResultMessage';
import initializeDirectory from './src/initializeDirectory';

export interface ContentSettings {
    /**
     * Contentful content type ID
     */
    typeId: string;
    /**
     * The directory where the entries will be placed
     */
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
        .then(result => {
            console.log(
                getContentTypeResultMessage(result.typeId, result.totalItems)
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
        await new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, waitTime);
        });
    }
    console.log(
        `\n---------------------------------------------\n   Pulling ${deliveryMode} from Contentful...\n---------------------------------------------\n`
    );
    // loop through repeatable content types
    const types = config.repeatableTypes;
    const asyncTasks = [];
    if (types) {
        for (let i = 0; i < types.length; i++) {
            // object to pass settings into the function
            const {
                id,
                directory,
                isHeadless,
                fileExtension,
                // title,
                // dateField,
                mainContent,
                type,
                isTaxonomy,
                resolveEntries,
            } = types[i];
            const contentSettings: ContentSettings = {
                typeId: id,
                directory: directory,
                isHeadless: isHeadless,
                fileExtension: fileExtension,
                // titleField: title,
                // dateField: dateField,
                mainContent: mainContent,
                type: type,
                isTaxonomy,
                resolveEntries,
            };
            // check file extension settings
            switch (fileExtension) {
                case 'md':
                case 'yaml':
                case 'yml':
                case undefined:
                case null:
                    asyncTasks.push(
                        fetchType(
                            1000,
                            0,
                            contentSettings,
                            config.contentful,
                            isPreview
                        )
                    );
                    break;
                default:
                    console.log(
                        `   ERROR: extension "${contentSettings.fileExtension}" not supported`
                    );
                    break;
            }
        }
    }
    // loop through single content types
    const singles = config.singleTypes;
    if (singles) {
        for (let i = 0; i < singles.length; i++) {
            const single = singles[i];
            const {
                id,
                directory,
                fileExtension,
                fileName,
                // title,
                // dateField,
                mainContent,
                resolveEntries,
                type,
            } = single;
            const contentSettings: ContentSettings = {
                typeId: id,
                directory: directory,
                fileExtension: fileExtension,
                fileName: fileName,
                // titleField: title,
                // dateField: dateField,
                mainContent: mainContent,
                isSingle: true,
                type: type,
                resolveEntries,
            };
            switch (contentSettings.fileExtension) {
                case 'md':
                case 'yaml':
                case 'yml':
                case null:
                case undefined:
                    asyncTasks.push(
                        fetchType(
                            1,
                            0,
                            contentSettings,
                            config.contentful,
                            isPreview
                        )
                    );
                    break;
                default:
                    console.log(
                        `   ERROR: extension "${contentSettings.fileExtension}" not supported`
                    );
                    break;
            }
        }
    }
    return Promise.all(asyncTasks).then(() => {
        console.log(`\n---------------------------------------------\n`);
    });
};

export {
    fetchDataFromContentful,
    loadConfig,
    initializeDirectory,
    ContentfulConfig as ContentfulHugoConfig,
};
