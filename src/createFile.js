const YAML = require('json-to-pretty-yaml');
const fs = require('fs');
const { removeLeadingAndTrailingSlashes } = require('./strings');
const mkdirp = require('mkdirp');

/**
 *
 * @param {Object} contentSettings - Content settings object
 * @param {String} entryId - The id of the Contentful entry
 * @param {Object} frontMatter - Object containing all the data for frontmatter
 * @param {String} mainContent - String data for the main content that will appear below the frontmatter
 */
const createFile = (contentSettings, entryId, frontMatter, mainContent) => {
    let fileContent = '';
    if (
        contentSettings.fileExtension === 'md' ||
        contentSettings.fileExtension === null ||
        contentSettings.fileExtension === undefined
    ) {
        fileContent += `---\n`;
    }

    // add current item to filecontent
    fileContent += YAML.stringify(frontMatter);
    if (
        contentSettings.fileExtension !== 'yaml' ||
        contentSettings.fileExtension !== 'yml'
    ) {
        fileContent += `---\n`;
    }

    // if set add the main content below the front matter
    if (mainContent) {
        fileContent += mainContent;
    }

    // create file
    let filePath = '';
    const directory = removeLeadingAndTrailingSlashes(
        contentSettings.directory
    );
    const { fileExtension, fileName, isSingle, isHeadless } = contentSettings;
    if (isHeadless) {
        mkdirp.sync(`./${directory}/${entryId}`);
        filePath = `./${directory}/${entryId}/index.${fileExtension}`;
    } else if (isSingle) {
        filePath = `./${directory}/${fileName}.${fileExtension}`;
    } else {
        filePath = `./${directory}/${entryId}.${fileExtension}`;
    }
    return fs.writeFile(filePath, fileContent, error => {
        if (error) {
            console.log(error);
        }
    });
};

module.exports = createFile;
