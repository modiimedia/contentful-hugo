const YAML = require('json-to-pretty-yaml');
const fs = require('fs');

module.exports = (contentSettings, entryId, frontMatter, mainContent) => {
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
	if (contentSettings.isHeadless) {
		filePath = `.${contentSettings.directory}/${entryId}/index.${contentSettings.fileExtension}`;
	} else if (contentSettings.isSingle) {
		filePath = `.${contentSettings.directory}/${contentSettings.fileName}.${contentSettings.fileExtension}`;
	} else {
		filePath = `.${contentSettings.directory}${entryId}.${contentSettings.fileExtension}`;
	}
	return fs.writeFile(filePath, fileContent, error => {
		if (error) {
			console.log(error);
		}
	});
};
