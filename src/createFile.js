const YAML = require('json-to-pretty-yaml');
const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = (contentSettings, entryId, frontMatter, mainContent) => {
    let fileContent = '';
    if (
        contentSettings.fileExtension === 'md' ||
        contentSettings.fileExtension == null ||
        contentSettings.fileExtension == undefined
    ) {
        fileContent += `---\n`;
    }

    // add current item to filecontent
    fileContent += YAML.stringify(frontMatter);
    if (
        contentSettings.fileExtension != 'yaml' ||
        contentSettings.fileExtension != 'yml'
    ) {
        fileContent += `---\n`;
    }

    // if set add the main content below the front matter
    if (mainContent) {
        fileContent += mainContent;
        console.log(mainContent);
    }

    // create file
    if (contentSettings.isHeadless) {
        return fs.writeFile(
            `.${contentSettings.directory}${entryId}/index.${contentSettings.fileExtension}`,
            fileContent,
            error => {
                if (error) {
                    console.log(error);
                }
            }
        );
    } else if (contentSettings.isSingle) {
        return fs.writeFile(
            `.${contentSettings.directory}/${contentSettings.fileName}.${contentSettings.fileExtension}`,
            fileContent,
            error => {
                if (error) {
                    console.log(error);
                }
            }
        );
    } else {
        return fs.writeFile(
            `.${contentSettings.directory}${entryId}.${contentSettings.fileExtension}`,
            fileContent,
            error => {
                if (error) {
                    console.log(error);
                }
            }
        );
    }
};
