require('dotenv').config();
const fs = require('fs');
const mkdirp = require('mkdirp');
const contentful = require('contentful');
const { removeLeadingAndTrailingSlashes } = require('./strings');
const processEntry = require('./processEntry');

/// get content for a single content type ///
// itemsPulled refers to entries that have already been called it's used in conjunction with skip for pagination
/**
 *
 * @param {Number} limit
 * @param {Number} skip
 * @param {Object} contentSettings
 * @param {String} contentSettings.typeId
 * @param {String} contentSettings.fileExtension
 * @param {String} contentSettings.directory
 * @param {Number} itemsPulled
 */
const getContentType = async (
    limit,
    skip,
    contentSettings,
    previewMode = false,
    itemsPulled
) => {
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

    return client
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
            const newDir = `./${removeLeadingAndTrailingSlashes(
                contentSettings.directory
            )}`;
            mkdirp.sync(newDir);
            if (contentSettings.isHeadless && !contentSettings.isSingle) {
                const listPageFrontMatter = `---\n# this is a work-around to prevent hugo from rendering a list page\nurl: /\n---\n`;
                fs.writeFileSync(`${newDir}/_index.md`, listPageFrontMatter);
            }

            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                processEntry(item, contentSettings);
                itemCount++;
            }

            // check total number of items against number of items pulled in API
            if (data.total > data.limit) {
                // run function again if there are still more items to get
                const newSkip = skip + limit;
                return getContentType(
                    limit,
                    newSkip,
                    contentSettings,
                    previewMode,
                    itemCount
                );
            }
            return {
                totalItems: itemCount,
                typeId: contentSettings.typeId,
            };
        });
};

module.exports = getContentType;
