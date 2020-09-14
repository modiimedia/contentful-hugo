require('dotenv').config();
const contentful = require('contentful');
const mkdirp = require('mkdirp');
const yargs = require('yargs');
const { loadConfig } = require('./src/config');
const { removeLeadingAndTrailingSlashes } = require('./src/strings');

yargs.options({
    preview: { type: 'boolean', default: false, alias: 'P' },
    init: { type: 'boolean', default: false },
    wait: { type: 'number', default: 0, alias: 'W' },
    config: { type: 'string', default: null, alias: 'C' },
});
const argv = yargs.argv;

const processEntry = require('./src/processEntry');
const checkIfFinished = require('./src/checkIfFinished');
const initializeDirectory = require('./src/initializeDirectory');

// counter variables
let totalContentTypes = 0;
let typesExtracted = 0;

if (argv.init) {
    initializeDirectory();
} else if (
    process.env.CONTENTFUL_SPACE &&
    (process.env.CONTENTFUL_TOKEN || process.env.CONTENTFUL_PREVIEW_TOKEN)
) {
    loadConfig('.', argv.config).then(config => {
        initialize(config);
    });
} else {
    console.log(
        `\nERROR: Environment variables not yet set.\n\nThis module requires the following environmental variables to be set before running:\nCONTENTFUL_SPACE, CONTENTFUL_TOKEN, CONTENTFUL_PREVIEW_TOKEN (optional)\n\nYou can set them using the command line or place them in a .env file.\n`
    );
}

// getting settings from config file
async function initialize(config = null) {
    // check if configFile exist and throw error if it doesn't
    const deliveryMode = argv.preview ? 'Preview Data' : 'Published Data';
    if (config) {
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
        if (types) {
            totalContentTypes += types.length;
            for (let i = 0; i < types.length; i++) {
                // object to pass settings into the function
                const contentSettings = {
                    typeId: types[i].id,
                    directory: types[i].directory,
                    isHeadless: types[i].isHeadless,
                    fileExtension: types[i].fileExtension,
                    titleField: types[i].title,
                    dateField: types[i].dateField,
                    mainContent: types[i].mainContent,
                    type: types[i].type,
                };
                // check file extension settings
                switch (contentSettings.fileExtension) {
                    case 'md':
                    case 'yaml':
                    case 'yml':
                    case undefined:
                    case null:
                        getContentType(1000, 0, contentSettings);
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
            totalContentTypes += singles.length;
            for (let i = 0; i < singles.length; i++) {
                const single = singles[i];
                const contentSettings = {
                    typeId: single.id,
                    directory: single.directory,
                    fileExtension: single.fileExtension,
                    fileName: single.fileName,
                    titleField: single.title,
                    dateField: single.dateField,
                    mainContent: single.mainContent,
                    isSingle: true,
                    type: single.type,
                };
                switch (contentSettings.fileExtension) {
                    case 'md':
                    case 'yaml':
                    case 'yml':
                    case null:
                    case undefined:
                        getContentType(1, 0, contentSettings);
                        break;
                    default:
                        console.log(
                            `   ERROR: extension "${contentSettings.fileExtension}" not supported`
                        );
                        break;
                }
            }
        }
    } else {
        console.log(
            `\nConfiguration file not found. Run "contentful-hugo --init" to get started.\nFor more detailed instructions visit https://github.com/ModiiMedia/contentful-hugo\n`
        );
    }
}

/// get content for a single content type ///
// itemsPulled refers to entries that have already been called it's used in conjunction with skip for pagination
function getContentType(limit, skip, contentSettings, itemsPulled) {
    let previewMode = false;
    if (argv.preview) {
        previewMode = true;
    }
    if (previewMode && !process.env.CONTENTFUL_PREVIEW_TOKEN) {
        throw new Error(
            'Environment variable CONTENTFUL_PREVIEW_TOKEN not set'
        );
    } else if (!previewMode && !process.env.CONTENTFUL_TOKEN) {
        throw new Error('Environment variable CONTENTFUL_TOKEN not set');
    }
    const options = {
        space: process.env.CONTENTFUL_SPACE,
        host: previewMode ? 'preview.contentful.com' : 'cdn.contentful.com',
        accessToken: previewMode
            ? process.env.CONTENTFUL_PREVIEW_TOKEN
            : process.env.CONTENTFUL_TOKEN,
    };
    const client = contentful.createClient(options);

    // check for file extension default to markdown
    if (!contentSettings.fileExtension) {
        contentSettings.fileExtension = 'md';
    }

    client
        .getEntries({
            content_type: contentSettings.typeId,
            limit: limit,
            skip: skip,
            order: 'sys.updatedAt',
        })
        .then(data => {
            // variable for counting number of items pulled
            let itemCount;
            if (itemsPulled) {
                itemCount = itemsPulled;
            } else {
                itemCount = 0;
            }
            // create directory for file
            mkdirp.sync(
                `./${removeLeadingAndTrailingSlashes(
                    contentSettings.directory
                )}`
            );

            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                processEntry(item, contentSettings);
                itemCount++;
            }

            // check total number of items against number of items pulled in API
            if (data.total > data.limit) {
                // run function again if there are still more items to get
                const newSkip = skip + limit;
                getContentType(limit, newSkip, contentSettings, itemCount);
            } else {
                let grammarStuff;
                if (Number(data.total) === 1) {
                    grammarStuff = 'item';
                } else {
                    grammarStuff = 'items';
                }
                console.log(
                    `   ${contentSettings.typeId} - ${itemCount} ${grammarStuff}`
                );
                typesExtracted++;
                if (checkIfFinished(typesExtracted, totalContentTypes)) {
                    console.log(
                        `\n---------------------------------------------\n`
                    );
                }
            }
        })
        .catch(error => {
            const response = error.response;
            if (response) {
                console.log(
                    `   --------------------------\n   ${contentSettings.typeId} - ERROR ${response.status} ${response.statusText}\n   (Note: ${response.data.message})\n   --------------------------`
                );
            } else {
                console.log(error);
            }
        });
}
