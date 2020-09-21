require('dotenv').config();
const yargs = require('yargs');
const { loadConfig } = require('./src/config');
const getContentType = require('./src/getContentType');
const getContentTypeResultMessage = require('./src/getContentTypeResultMessage');

yargs.options({
    preview: { type: 'boolean', default: false, alias: 'P' },
    init: { type: 'boolean', default: false },
    wait: { type: 'number', default: 0, alias: 'W' },
    config: { type: 'string', default: null, alias: 'C' },
});
const argv = yargs.argv;

const initializeDirectory = require('./src/initializeDirectory');

const initialize = () => {
    if (argv.init) {
        return initializeDirectory();
    }
    if (
        process.env.CONTENTFUL_SPACE &&
        (process.env.CONTENTFUL_TOKEN || process.env.CONTENTFUL_PREVIEW_TOKEN)
    ) {
        return loadConfig('.', argv.config).then(config => {
            fetchDataFromContentful(config);
        });
    }
    return console.error(
        `\nERROR: Environment variables not yet set.\n\nThis module requires the following environmental variables to be set before running:\nCONTENTFUL_SPACE, CONTENTFUL_TOKEN, CONTENTFUL_PREVIEW_TOKEN (optional)\n\nYou can set them using the command line or place them in a .env file.\n`
    );
};

const fetchType = (limit, skip, settings, preview = false) => {
    return getContentType(limit, skip, settings, preview)
        .then(result => {
            console.log(
                getContentTypeResultMessage(result.typeId, result.totalItems)
            );
        })
        .catch(error => {
            const response = error.response;
            if (response) {
                console.log(
                    `   --------------------------\n   ${settings.typeId} - ERROR ${response.status} ${response.statusText}\n   (Note: ${response.data.message})\n   --------------------------`
                );
            } else {
                console.log(error);
            }
        });
};

async function fetchDataFromContentful(config = null) {
    const isPreview = argv.preview;
    const deliveryMode = argv.preview ? 'Preview Data' : 'Published Data';
    if (!config) {
        return console.log(
            `\nConfiguration file not found. Run "contentful-hugo --init" to get started.\nFor more detailed instructions visit https://github.com/ModiiMedia/contentful-hugo\n`
        );
    }

    const waitTime = argv.wait;
    if (waitTime && typeof waitTime === 'number') {
        console.log(`waiting ${waitTime}ms...`);
        await new Promise((resolve, reject) => {
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
                title,
                dateField,
                mainContent,
                type,
                resolveEntries,
            } = types[i];
            const contentSettings = {
                typeId: id,
                directory: directory,
                isHeadless: isHeadless,
                fileExtension: fileExtension,
                titleField: title,
                dateField: dateField,
                mainContent: mainContent,
                type: type,
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
                        fetchType(1000, 0, contentSettings, isPreview)
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
                title,
                dateField,
                mainContent,
                resolveEntries,
                type,
            } = single;
            const contentSettings = {
                typeId: id,
                directory: directory,
                fileExtension: fileExtension,
                fileName: fileName,
                titleField: title,
                dateField: dateField,
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
                        fetchType(1, 0, contentSettings, isPreview)
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
}

module.exports = initialize;
